import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChatbotList from './components/ChatbotList';
import ChatbotForm from './components/ChatbotForm';
import KnowledgeForm from './components/KnowledgeForm';
import EmbedOptions from './components/EmbedOptions';
import ChatWithChatbot from './components/Chatting';
import './App.css';  // Import the CSS file
import './components/chatbot-widget.css'; // Import the CSS file

function App() {
  return (
    <Router>
      <div className="App">
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
          </ul>
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<ChatbotList />} />
            <Route path="/create" element={<ChatbotForm />} />
            <Route path="/add-knowledge/:chatbotId" element={<KnowledgeForm />} />
            <Route path="/embed/:chatbotId" element={<EmbedOptions />} />
            <Route path="/chat/:chatbotId" element={<ChatWithChatbot />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
