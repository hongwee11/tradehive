import React from 'react';
import LoginPage from './loginpage/LoginPage'; 
import Dashboard from './dashboard/dashboard';
import TradeForm from './TradeForm';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostPage from './forum/PostPage';
import ForumHome from './forum/ForumHome';
import CreatePost from './forum/CreatePost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trade" element={<TradeForm />} />
        <Route path="/forum" element={<ForumHome />} />
        <Route path="/forum/post/:id" element={<PostPage />} />
        <Route path="/forum/create" element={<CreatePost />} />
      </Routes>
    </Router>
  );
}

export default App;

