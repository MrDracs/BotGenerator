// components/KnowledgeForm.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function KnowledgeForm() {
  const [content, setContent] = useState('');
  const { chatbotId } = useParams();
  const navigate = useNavigate();

  const addKnowledge = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/knowledge', { chatbotId, content });
      setContent('');
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
      <button type="submit">Add Knowledge</button>
      <button onClick={() => navigate(`/embed/${chatbotId}`)}>Finish and Get Embed Code</button>
    </form>
  );
}

export default KnowledgeForm;
