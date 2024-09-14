// components/EmbedOptions.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function EmbedOptions() {
  const [config, setConfig] = useState(null);
  const { chatbotId } = useParams();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chatbots/${chatbotId}/config`);
        setConfig(response.data);
      } catch (error) {
        console.error('Error fetching chatbot configuration:', error);
      }
    };
    fetchConfig();
  }, [chatbotId]);

  if (!config) return <div>Loading...</div>;

  const iframeEmbed = `<iframe src="http://localhost:3000/chat/${chatbotId}" width="300" height="400" frameborder="0"></iframe>`;
  const scriptEmbed = `<script src="http://localhost:3000/chatbot-widget.js" data-chatbot-id="${chatbotId}"></script>`;

  return (
    <div>
      <h2>Embed Your Chatbot: {config.name}</h2>
      <h3>iframe Embed</h3>
      <textarea readOnly value={iframeEmbed} />
      <h3>Script Embed</h3>
      <textarea readOnly value={scriptEmbed} />
    </div>
  );
}

export default EmbedOptions;