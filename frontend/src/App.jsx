// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { getUserProfile } from "./services/api";
import Home from "./pages/Home";
import TopicDetail from "./pages/TopicDetail";
import Learn from "./pages/Learn";
import Reminders from "./pages/Reminders";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem("userInfo");
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const hasNotifiedToday = useRef(false);
  const lastCheckedDate = useRef(new Date().getDate());

  useEffect(() => {
    const checkNotification = async () => {
      // Skip notification checks if not logged in
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) return;

      try {
        const { data } = await getUserProfile();

        // Skip if notifications are off, or they already studied today
        if (!data.notificationEnabled) return;

        let alreadyStudied = false;
        if (data.lastStudiedDate) {
          const lastDate = new Date(data.lastStudiedDate);
          const today = new Date();
          if (
            lastDate.getFullYear() === today.getFullYear() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getDate() === today.getDate()
          ) {
            alreadyStudied = true;
          }
        }

        const now = new Date();

        // Reset the notification flag if a new day has started
        if (now.getDate() !== lastCheckedDate.current) {
          hasNotifiedToday.current = false;
          lastCheckedDate.current = now.getDate();
        }

        if (alreadyStudied) {
          hasNotifiedToday.current = false;
          return;
        }

        // Check time
        if (data.notificationTime) {
          const currentHours = String(now.getHours()).padStart(2, '0');
          const currentMinutes = String(now.getMinutes()).padStart(2, '0');
          const currentTimeStr = `${currentHours}:${currentMinutes}`;

          if (currentTimeStr === data.notificationTime && !hasNotifiedToday.current) {
            if (Notification.permission === "granted") {
              new Notification(`${data.name}'s DSA Journey 🔔`, {
                body: "Time to study! Your streak is waiting.",
                icon: "/vite.svg"
              });
              hasNotifiedToday.current = true;
            }
          }
        }
      } catch (err) {
        // If token is expired/invalid, don't crash — just skip
        if (err.response?.status === 401) {
          localStorage.removeItem("userInfo");
        }
        console.error("Interval failed to fetch user data", err);
      }
    };

    const intervalId = setInterval(checkNotification, 60000);
    checkNotification();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
        <Route path="/topic/:slug" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;