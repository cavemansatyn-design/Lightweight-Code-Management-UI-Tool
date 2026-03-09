import os
import requests
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.ai_report import AIReport
from models.version import Version
from models.file import File
from models.project import Project
from database import db

ai_bp = Blueprint('ai', __name__)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@ai_bp.route('/generate-ai-report', methods=['POST'])
@jwt_required()
def generate_ai_report():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    project_id = data.get('project_id')

    if not project_id:
        return jsonify({'error': 'Project ID required'}), 400

    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # For each file in the project, collect the initial and latest versions.
    files = File.query.filter_by(project_id=project_id).all()
    if not files:
        return jsonify({'message': 'No files found for project'}), 200

    version_texts = []
    version_ids = []

    for f in files:
        file_versions = Version.query.filter_by(file_id=f.id).order_by(Version.created_at.asc()).all()
        if not file_versions:
            continue

        initial_version = file_versions[0]
        latest_version = file_versions[-1]

        def add_version(label, v):
            version_ids.append(v.id)
            content_preview = v.content[:5000] + "... (truncated)" if v.content and len(v.content) > 5000 else (v.content or "[Empty]")
            version_texts.append(
                f"Component/File: {f.name}\n"
                f"{label} Version ID: {v.id}\n"
                f"Content:\n{content_preview}\n---"
            )

        # Always include the latest version; include initial if different.
        add_version("Initial", initial_version)
        if latest_version.id != initial_version.id:
            add_version("Latest", latest_version)

    if not version_texts:
        return jsonify({'message': 'No versions available for analysis'}), 200

    joined_versions = "\n".join(version_texts)

    system_prompt = (
        "You are a senior software architect reviewing a multi-component codebase "
        "with intent-based locking and version history."
    )

    user_prompt = f"""
We have a project broken down into components (frontend, backend, payment gateway, etc.).
For each component/file you are given the initial and latest code versions (when available).

Your tasks:
1. Identify and list structural changes in each component/file.
2. Detect conflicts or inconsistencies between components (e.g., mismatched APIs, data contracts, shared assumptions).
3. Highlight risky changes, code smells, or potential bugs.
4. Analyze algorithmic complexity and performance hotspots, and suggest concrete improvements.
5. Call out missing validations, error handling, or security issues (especially around auth, payments, and shared data).
6. Provide an overall migration/change summary suitable for an internal company change log that every engineer can read.

Use clear headings and bullet points. Reference components/files by name. Focus on actionable recommendations.

Here is the version data:

{joined_versions}
"""

    if not GROQ_API_KEY:
        return jsonify({'error': 'GROQ_API_KEY not configured'}), 500

    try:
        print("Sending request to Groq API...")
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 2048
        }

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(GROQ_API_URL, json=payload, headers=headers)
        response_data = response.json()

        if response.status_code != 200:
            print(f"Groq API Error: {response_data}")
            return jsonify({'error': 'Groq API failed', 'details': response_data}), 502

        report_content = response_data['choices'][0]['message']['content']
        token_usage = response_data.get('usage', {}).get('total_tokens', 0)
        llm_model = "llama-3.3-70b-versatile"

        new_report = AIReport(
            project_id=project_id,
            generated_by=current_user_id,
            version_ids_analyzed=version_ids,
            report_content=report_content,
            llm_model=llm_model,
            token_usage=token_usage
        )

        db.session.add(new_report)
        db.session.commit()

        return jsonify(new_report.to_dict()), 201

    except Exception as e:
        import traceback
        print("AI ROUTE ERROR:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/reports', methods=['GET'])
@jwt_required()
def list_ai_reports():
    project_id = request.args.get('project_id', type=int)

    query = AIReport.query
    if project_id:
        query = query.filter_by(project_id=project_id)

    reports = query.order_by(AIReport.created_at.desc()).limit(20).all()

    return jsonify([
        {
            'id': r.id,
            'project_id': r.project_id,
            'generated_by': r.generated_by,
            'created_at': r.created_at.isoformat(),
            'llm_model': r.llm_model,
            'token_usage': r.token_usage,
        }
        for r in reports
    ]), 200


@ai_bp.route('/reports/<int:report_id>', methods=['GET'])
@jwt_required()
def get_ai_report(report_id):
    report = AIReport.query.get_or_404(report_id)
    return jsonify(report.to_dict()), 200
