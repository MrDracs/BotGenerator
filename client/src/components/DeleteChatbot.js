import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteChatbot = () => {
  const { chatbotId } = useParams(); // Get chatbotId from URL parameters
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // Optionally, you can add logic here to check if the chatbotId is valid or fetch details
  }, [chatbotId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.delete(`http://localhost:5000/api/chat/${chatbotId}`);
      setSuccessMessage(`Chatbot with ID ${chatbotId} deleted successfully!`);
      setTimeout(() => navigate('/admin'), 2000); // Redirect after 2 seconds
    } catch (err) {
      setError('Failed to delete the chatbot. Please try again.' +err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="delete-chatbot-container">
      <h2>Delete Chatbot</h2>
      <p>Are you sure you want to delete the chatbot with ID: <strong>{chatbotId}</strong>?</p>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="delete-button"
      >
        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
      </button>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default DeleteChatbot;
