import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ChatWithChatbot() {
  const { chatbotId } = useParams(); // Retrieve chatbotId from URL params
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatbotConfig, setChatbotConfig] = useState(null);

  useEffect(() => {
    // Fetch chatbot configuration when the component mounts
    const fetchChatbotConfig = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chatbots/${chatbotId}/config`);
        setChatbotConfig(response.data);
      } catch (error) {
        setError('Error fetching chatbot configuration');
      }
    };

    fetchChatbotConfig();
  }, [chatbotId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    const updatedHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(updatedHistory);

    try {
      const response = await axios.post(`http://localhost:5000/api/chat/${chatbotId}`, {
        message,
        previousMessages: updatedHistory,
      });
      console.log(response.data);

      const botResponse = response.data.response;
      setChatHistory([...updatedHistory, { role: 'assistant', content: botResponse }]);
      setMessage(''); // Reset input field
    } catch (error) {
      setError(`Error sending message to the chatbot: ${ error }`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat with {chatbotConfig ? chatbotConfig.name : 'Chatbot'}</h2>

      <div className="chat-window">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-bubble ${chat.role}`}>
            <p>{chat.content}</p>
          </div>
        ))}

        {isLoading && <p>Loading...</p>}
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
  
}

export default ChatWithChatbot;
