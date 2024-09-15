import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import ChatbotList from './components/ChatbotList';
import ChatbotForm from './components/ChatbotForm';
import KnowledgeForm from './components/KnowledgeForm';
import EmbedOptions from './components/EmbedOptions';
import ChatWithChatbot from './components/Chatting';
import ChatWithChatbotTTS from './components/Chatting-tts';
import './App.css';  // Import the CSS file
import './components/chatbot-widget.css'; // Import the CSS file

function App() {
  return (
    <Router>
      <RouteSwitch />
    </Router>
  );
}

// Wrapper component to conditionally render UI elements and manage scrolling
function RouteSwitch() {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat');

  useEffect(() => {
    if (isChatRoute) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isChatRoute]);

  return (
    <div>
      {!isChatRoute && (
        <header className="navbar">
          <h1>AI Chatbot Generator</h1>
          <ul>
            <li>
              <Link to="/">Chatbot List</Link>
            </li>
            <li>
              <Link to="/create">Create Chatbot</Link>
            </li>
            <li>
              <Link to="/add-knowledge/:chatbotId">Add Knowledge</Link>
            </li>
            <li>
              <Link to="/embed/:chatbotId">Embed Options</Link>
            </li>
            <li>
              <Link to="/embed/:chatbotId/tts">Embed Options (TTS)</Link>
            </li>
          </ul>
        </header>
      )}
      <div className="App">
        <main className="container">
          <Routes>
            <Route path="/" element={<ChatbotList />} />
            <Route path="/create" element={<ChatbotForm />} />
            <Route path="/add-knowledge/:chatbotId" element={<KnowledgeForm />} />
            <Route path="/embed/:chatbotId" element={<EmbedOptions />} />
            <Route path="/chat/:chatbotId" element={<ChatWithChatbot />} />
            <Route path="/chat/:chatbotId/tts" element={<ChatWithChatbotTTS />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
