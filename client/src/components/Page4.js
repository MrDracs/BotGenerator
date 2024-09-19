import React, { useState } from 'react';
import '../App.css';

const Page4 = () => {
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    agentName: '',
    agentTonality: '',
    personalizeAgent: '',
  });
  const [chatbotId, setChatbotId] = useState('');
  const [specifyQuestions, setSpecifyQuestions] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [embedCode, setEmbedCode] = useState({ iframe: '', css: '' });

  // Step 1: Handle Next button click (First form submission)
  const handleNextClick = () => {
    const { agentName, agentTonality, personalizeAgent } = agentData;

    // Basic validation
    if (!agentName || !agentTonality || !personalizeAgent) {
      alert('Please fill in all required fields.');
      return;
    }

    // Prepare data to send to the API
    const requestData = {
      name: agentName,
      temperature: agentTonality,
      contextMessage: personalizeAgent,
    };

    // Send data to the API (chatbot creation)
    fetch('http://localhost:5000/api/chatbots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.chatbotId) {
          setChatbotId(data.chatbotId);
          setStep(2); // Move to Step 2
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
      });
  };

  // Step 2: Handle form submission for knowledge (Upload document)
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!pdfFile) {
      alert('Please upload a context file (PDF).');
      return;
    }

    const formData = new FormData();
    formData.append('chatbotId', chatbotId);
    formData.append('content', specifyQuestions);
    formData.append('pdf', pdfFile);

    fetch('http://localhost:5000/api/knowledge', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.message && data.message.includes('successfully')) {
          setStep(3); // Move to Step 3
          loadEmbedOptions();
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while uploading the document.');
      });
  };

  // Step 3: Load Embed Options
  const loadEmbedOptions = () => {
    fetch(`http://localhost:5000/api/chatbots/${chatbotId}/config`)
      .then(response => response.json())
      .then(data => {
        const iframeEmbed = `<div class="side-bar-fs"><iframe src="https://conversify-9jzj.onrender.com/chat/${chatbotId}" width='80%' height="100%" frameborder='none'></iframe></div>`;
        const cssEmbed = `.side-bar-fs {
  width: 30vw;
  height: 95vh;
  margin: auto;
  margin-left: 69vw;
  position: relative;
  background: none;
  overflow: hidden;
  z-index: 100;
}
iframe {
  margin: auto;
  position: relative;
  background-color: none;
  width: 100%;
  height: 100%;
}`;

        setEmbedCode({ iframe: iframeEmbed, css: cssEmbed });
      })
      .catch(error => {
        console.error('Error fetching embed options:', error);
        alert('An error occurred while fetching embed options.');
      });
  };

  return (
    <section className="page4">
      <h2 style={{ textAlign: 'left' }}>Documents</h2>
      <p>We need more information to tailor the agent perfectly to your needs.</p>
      <div className="form-container">
        <div className="form-left">
          <img src="./asset/images/Document.png" alt="Document Icon" className="document-icon" />
        </div>

        {step === 1 && (
          <div className="form-right">
            <div id="step1">
              <div className="form-group">
                <label htmlFor="agentName">
                  What do you want to <span className="highlight-blue">Name your Agent?</span>
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={agentData.agentName}
                  onChange={(e) => setAgentData({ ...agentData, agentName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="agentTonality">Set Tonality of the Agent</label>
                <div className="select-wrapper">
                  <select
                    id="agentTonality"
                    name="agentTonality"
                    value={agentData.agentTonality}
                    onChange={(e) => setAgentData({ ...agentData, agentTonality: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select tonality
                    </option>
                    <option value="0.1">Strict to Context</option>
                    <option value="0.7">Moderately Creative</option>
                    <option value="0.9">Highly Creative</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="personalizeAgent">Personalize Your Agent</label>
                <input
                  type="text"
                  id="personalizeAgent"
                  name="personalizeAgent"
                  value={agentData.personalizeAgent}
                  onChange={(e) => setAgentData({ ...agentData, personalizeAgent: e.target.value })}
                  required
                />
              </div>
              <button type="button" className="btn submit-btn" onClick={handleNextClick}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div id="step2">
            <form id="agent-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="specifyQuestions">Specify Questions or Instructions</label>
                <textarea
                  id="specifyQuestions"
                  name="specifyQuestions"
                  rows="4"
                  value={specifyQuestions}
                  onChange={(e) => setSpecifyQuestions(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="uploadContext">Upload Context File (PDF)</label>
                <input
                  type="file"
                  id="uploadContext"
                  name="uploadContext"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" className="btn submit-btn">
                Upload Document
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div id="step3" className="embed-options">
            <div className="form-group">
              <h2 id="embed-title">Embed Your Chatbot</h2>
              <label htmlFor="iframeEmbed">Iframe Embed Code:</label>
              <textarea id="iframeEmbed" value={embedCode.iframe} readOnly />
              <label htmlFor="cssEmbed">CSS Embed Code:</label>
              <textarea id="cssEmbed" value={embedCode.css} readOnly />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page4;
