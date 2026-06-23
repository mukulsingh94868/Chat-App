import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // point to your Node server [web:13][web:20]

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(() => {
    return prompt('Enter your name') || 'Anonymous';
  });

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat-message', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('chat-message');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Send message to server
    socket.emit('chat-message', { username, text });

    setInput('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Socket.IO Chat</h1>

      <div
        style={{
          border: '1px solid red',
          height: 300,
          overflowY: 'auto',
          padding: 8,
          marginBottom: 8,
        }}
      >
        {messages.map((m, index) => (
          <div key={index}>
            <strong>{m.username}:</strong> {m.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;