import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');

    if (storedToken) {
      const tokenExpiration = new Date(JSON.parse(atob(storedToken.split('.')[1])).exp * 1000);
      const currentTime = new Date();

      if (currentTime < tokenExpiration) {
        setIsLoggedIn(true);

        const timeout = setTimeout(() => {
          handleLogout();
        }, tokenExpiration - currentTime);

        return () => clearTimeout(timeout);
      } else {
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (token) => {
    sessionStorage.setItem('token', token);
    setIsLoggedIn(true);

    const tokenExpiration = new Date(JSON.parse(atob(token.split('.')[1])).exp * 1000);
    const currentTime = new Date();

    const timeout = setTimeout(() => {
      handleLogout();
    }, tokenExpiration - currentTime);

    return () => clearTimeout(timeout);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');

    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/home"
          element={isLoggedIn ? <Home onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;