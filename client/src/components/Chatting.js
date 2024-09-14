import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './chatbot-widget.css'; // Import the CSS file
function ChatWithChatbot() {
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

      const botResponse = response.data.response;
      setChatHistory([...updatedHistory, { role: 'assistant', content: botResponse }]);
      setMessage(''); // Clear input

      // Trigger TTS and avatar animation
      playGoogleTTS(botResponse);
    } catch (error) {
      setError(`Error sending message to the chatbot: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playGoogleTTS = (text) => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    setIsSpeaking(true); // Start avatar speaking animation

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
        audioConfig: { audioEncoding: 'MP3' }
      })
    })
    .then(response => response.json())
    .then(data => {
      const audioSrc = 'data:audio/mp3;base64,' + data.audioContent;
      const audio = new Audio(audioSrc);

      audio.play();

      // Stop animation when audio ends
      audio.onended = () => setIsSpeaking(false);
    })
    .catch(error => {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    });
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
