import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import ChatbotList from './components/ChatbotList';
import ChatbotForm from './components/ChatbotForm';
import KnowledgeForm from './components/KnowledgeForm';
import EmbedOptions from './components/EmbedOptions';
import ChatWithChatbot from './components/Chatting';
import ChatWithChatbotTTS from './components/Chatting-tts';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Page3 from './components/Page3';
import Page4 from './components/Page4';
import Page5 from './components/Page5';
import DeleteChatbot from './components/DeleteChatbot';
import './App.css';  // Import the CSS file

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
  const isHomeRoute = location.pathname === '/';  // Check if it's the home route
  const isChatRoute = location.pathname.startsWith('/chat');
  const isAdminRoute = location.pathname.startsWith('/create') ||
                       location.pathname.startsWith('/add-knowledge') ||
                       location.pathname.startsWith('/embed') ||
                       location.pathname.includes('/chat/') && location.pathname.endsWith('/delete');  // Admin routes

  useEffect(() => {
    if (isChatRoute) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isChatRoute]);

  return (
    <div>
      {!isChatRoute && !isAdminRoute && (  // Only show this for non-chat and non-admin routes
        <div className='Home'>
          <Page1 />
          <Page2 />
          <Page3 />
          <Page4 />
          <Page5 />
        </div>
      )}

      {/* Only show admin content when it's an admin route and not the home route */}
      {!isHomeRoute && isAdminRoute && (
        <header className='Admin'>
          <h1>AI Chatbot Generator</h1>
          <ul>
            <li><Link to="/">Chatbot List</Link></li>
            <li><Link to="/create">Create Chatbot</Link></li>
            <li><Link to="/add-knowledge/:chatbotId">Add Knowledge</Link></li>
            <li><Link to="/embed/:chatbotId">Embed Options</Link></li>
            <li><Link to="/embed/:chatbotId/tts">Embed Options (TTS)</Link></li>
          </ul>
        </header>
      )}

      <div className={`App ${isAdminRoute ? 'admin-view' : ''}`}>
        <main className="container">
          <Routes>
            <Route path="/admin" element={<ChatbotList />} />
            <Route path="/create" element={<ChatbotForm />} />
            <Route path="/add-knowledge/:chatbotId" element={<KnowledgeForm />} />
            <Route path="/embed/:chatbotId" element={<EmbedOptions />} />
            <Route path="/chat/:chatbotId" element={<ChatWithChatbot />} />
            <Route path="/chat/:chatbotId/tts" element={<ChatWithChatbotTTS />} />
            <Route path="/chat/:chatbotId/delete" element={<DeleteChatbot />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
