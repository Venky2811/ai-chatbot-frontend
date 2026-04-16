import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('https://ai-learning-projects-zhxk.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          session_id: 'react-session'
        })
      });

      const data = await response.json();
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: data.ai_response 
      }]);
    } catch (error) {
      console.error('Error:', error);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>AI Chatbot</h1>
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '8px'
      }}>
        {chat.map((msg, i) => (
          <div key={i} style={{
            margin: '10px 0',
            textAlign: msg.role === 'user' ? 'right' : 'left'
          }}>
            <span style={{
              background: msg.role === 'user' ? '#007bff' : '#f0f0f0',
              color: msg.role === 'user' ? 'white' : 'black',
              padding: '8px 12px',
              borderRadius: '12px',
              display: 'inline-block',
              maxWidth: '80%'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p>AI is thinking...</p>}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={sendMessage}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;