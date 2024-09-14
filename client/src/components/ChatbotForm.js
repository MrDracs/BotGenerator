import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChatbotForm() {
  const [name, setName] = useState('');
  const [contextMessage, setContextMessage] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16); // For handling PDF file upload
  const navigate = useNavigate();

  const createChatbot = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(); // Create form data to handle file uploads
    formData.append('name', name);
    formData.append('contextMessage', contextMessage);
    formData.append('temperature', temperature);
    formData.append('primaryColor', primaryColor);
    formData.append('fontFamily', fontFamily);
    formData.append('fontSize', fontSize);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbots', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'  // Important for sending files
        }
      });
      navigate(`/add-knowledge/${response.data.chatbotId}`);
    } catch (error) {
      console.error('Error creating chatbot:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Your Chatbot</h2>
      <form onSubmit={createChatbot}>
        <div className="form-group">
          <label>Chatbot Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chatbot Name"
            required
          />
        </div>

        <div className="form-group">
          <label>Context Message</label>
          <textarea
            value={contextMessage}
            onChange={(e) => setContextMessage(e.target.value)}
            placeholder="Context Message"
            required
          />
        </div>

        <div className="form-group">
          <label>Temperature</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            step="0.1"
            min="0"
            max="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Primary Color</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>

        <div className="form-group">
          <label>Font Size (px)</label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            min="8"
            max="24"
          />
        </div>


        <button type="submit">Create Chatbot</button>
      </form>
    </div>
  );
}

export default ChatbotForm;
