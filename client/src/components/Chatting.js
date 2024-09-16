import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './chatbot-widget.css'; // Import the CSS file

function ChatWithChatbot() {
  const { chatbotId } = useParams();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatbotConfig, setChatbotConfig] = useState(null);
  const [isTalking, setIsTalking] = useState(false); // Track avatar animation
  const chatWindowRef = useRef(null); // Ref to chat window for auto-scrolling

  useEffect(() => {
    const fetchChatbotConfig = async () => {
      try {
        const response = await axios.get(`https://botgenerator.onrender.com/api/chatbots/${chatbotId}/config`);
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
      const response = await axios.post(`https://botgenerator.onrender.com/api/chat/${chatbotId}`, {
        message,
        previousMessages: updatedHistory,
      });

      const botResponse = response.data.response;
      setChatHistory([...updatedHistory, { role: 'assistant', content: botResponse }]);
      setMessage(''); // Clear input

      // Trigger avatar animation
      setIsTalking(true);
      setTimeout(() => {
        setIsTalking(false);
      }, 3000); // Animation duration
    } catch (error) {
      setError(`Error sending message to the chatbot: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to the latest message
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-container">
      <h2 style={{color: '#ffffff', fontSize:'1.5em'}}>Chat with <span id="title">{chatbotConfig ? chatbotConfig.name : 'Chatbot'}</span></h2>

      {/* Avatar */}
      <img
        id="avatar"
        src={isTalking ? `${process.env.PUBLIC_URL}/talk.gif` : `${process.env.PUBLIC_URL}/idle.png`}
        alt="Chatbot Avatar"
        className={`avatar ${isTalking ? 'talking' : 'idle'}`}
      />

      {/* Chat Window */}
      <div className="chat-window" ref={chatWindowRef}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-bubble ${chat.role} animate`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chat.content}
            </ReactMarkdown>
          </div>
        ))}

        {isLoading && <p>Loading...</p>}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="chat-input">
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
