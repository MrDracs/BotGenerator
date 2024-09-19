import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './chatbot-widget.css'; // Import the CSS file

function ChatWithChatbotTTS() {
  const { chatbotId } = useParams();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatbotConfig, setChatbotConfig] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false); // Tracks if the bot is speaking

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

      // Trigger TTS and avatar animation
      playBrowserTTS(botResponse);
    } catch (error) {
      setError(`Error sending message to the chatbot: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playBrowserTTS = (text) => {
    // Check if the browser supports speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true); // Start avatar speaking animation
      utterance.onend = () => setIsSpeaking(false); // Stop animation when audio ends
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat with {chatbotConfig ? chatbotConfig.name : 'Chatbot'}</h2>

      {/* Avatar */}
      <img
        id="avatar"
        src={isSpeaking ? `${process.env.PUBLIC_URL}/talk.gif` : `${process.env.PUBLIC_URL}/idle.png`}
        alt="Chatbot Avatar"
        className="avatar"
      />

      {/* Chat Window */}
      <div className="chat-window">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-bubble ${chat.role}`}>
            <p>{chat.content}</p>
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

export default ChatWithChatbotTTS;
