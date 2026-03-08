import React, { useEffect, useState, useRef } from 'react';
import { chat, auth } from '../services/api';

const ChatPanel = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const user = auth.getCurrentUser();

    const fetchMessages = async () => {
        try {
            const res = await chat.getMessages();
            // Assuming backend returns sorted by latest first? 
            // Our backend route code says: formatted_msgs.append... 
            // and returns formatted_msgs[::-1] which means Oldest First.
            setMessages(res.data);
        } catch (err) {
            console.error("Chat poll error", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // 5s poll
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Optimistic UI could be added here, but for now we wait
        const originalInput = input;
        setInput('');

        try {
            await chat.sendMessage(originalInput);
            fetchMessages();
        } catch (err) {
            alert('Failed to send');
            setInput(originalInput);
        }
    };

    return (
        <div style={{
            width: '300px',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent)' }}>Global Chat</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, idx) => {
                    const isMe = msg.user_name === user?.name;
                    return (
                        <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                                {msg.user_name}
                            </div>
                            <div style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: isMe ? 'var(--accent)' : 'var(--bg-tertiary)',
                                color: isMe ? 'white' : 'var(--text-primary)',
                                fontSize: '0.9rem',
                                wordWrap: 'break-word'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                <button type="submit" className="primary" style={{ padding: '8px 12px' }}>Send</button>
            </form>
        </div>
    );
};

export default ChatPanel;
