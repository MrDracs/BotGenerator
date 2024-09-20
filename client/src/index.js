import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Signup from './components/signup';
import Login from './components/login';
import ChatbotList from './components/ChatbotList';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App />
);

