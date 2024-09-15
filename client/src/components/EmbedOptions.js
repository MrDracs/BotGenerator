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

  if (!config) {
    return <div>Loading...</div>;
  }

  const iframeEmbed = `<div class="side-bar-fs"><iframe src="http://localhost:3000/chat/${chatbotId}" width='80%' height="100%" frameborder='none'></iframe></div>`;
  const cssEmbed = `.side-bar-fs{
    width: 30vw;
    height:95vh;
    margin: auto;
    margin-left: 69vw;
    position: relative;
    background: none;
    overflow: hidden;
    z-index: 100;
}
iframe{
    margin: auto;
    position: relative;
    background-color: none;
    width: 100%;
    height: 100%;
}`;

  return (
    <div>
      <h2>Embed Your Chatbot: {config.name}</h2>
      <h3>iframe Embed</h3>
      <textarea readOnly value={iframeEmbed} />
      <h3>CSS Embed</h3>
      <textarea readOnly value={cssEmbed} />
    </div>
  );
}

export default EmbedOptions;