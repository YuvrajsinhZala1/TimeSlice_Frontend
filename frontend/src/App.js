import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateTask from './pages/CreateTask';
import BrowseTasks from './pages/BrowseTasks';
import MyTasks from './pages/MyTasks';
import TaskApplications from './pages/TaskApplications';
import ChatPage from './pages/ChatPage';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-task" element={<CreateTask />} />
                <Route path="/browse-tasks" element={<BrowseTasks />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                <Route path="/task-applications" element={<TaskApplications />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </div>
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;