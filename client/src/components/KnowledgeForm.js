// components/KnowledgeForm.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function KnowledgeForm() {
  const [content, setContent] = useState('');
  const { chatbotId } = useParams();
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null); 

  const addKnowledge = async (e) => {
    e.preventDefault();
    const formData = new FormData(); // Create form data to handle file uploads
    formData.append('chatbotId', chatbotId);
    formData.append('content', content);
    formData.append('pdf', pdfFile);  // Append the selected file
    try {
      await axios.post('http://localhost:5000/api/knowledge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'  // Important for sending files
        }
      });
      alert('Knowledge added successfully!');
    } catch (error) {
      console.error('Error adding knowledge:', error);
    }
  };

  return (
    <form onSubmit={addKnowledge}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter new knowledge here..."
      />
      {/* File input for PDF upload */}
      <div className="form-group">
          <label>Upload Knowledge Base (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}  // Handle file selection
          />
        </div>
      <button type="submit">Submit</button>
      <button onClick={() => navigate(`/embed/${chatbotId}`)}>Finish and Get Embed Code</button>
    </form>
  );
}

export default KnowledgeForm;
