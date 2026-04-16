import { useState, useRef, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setLoading(true);

    // add user message
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);

    // add empty AI message that will be filled word by word
    setChat(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('http://localhost:8000/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          session_id: 'react-session'
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.token) {
                // append each token to the last message
                setChat(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: updated[updated.length - 1].content + data.token
                  };
                  return updated;
                });
              }

              if (data.done) {
                setLoading(false);
              }

              if (data.error) {
                console.error('Stream error:', data.error);
                setLoading(false);
              }
            } catch (e) {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        AI Chatbot
      </h1>

      <div style={{
        height: '500px',
        overflowY: 'auto',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        background: '#f9f9f9'
      }}>
        {chat.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>
            Start a conversation!
          </p>
        )}

        {chat.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#007bff' : '#ffffff',
              color: msg.role === 'user' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              lineHeight: '1.5'
            }}>
              {msg.content}
              {msg.role === 'assistant' && 
               msg.content === '' && 
               loading && (
                <span style={{ opacity: 0.5 }}>typing...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;