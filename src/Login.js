import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        Swal.fire({
          icon: 'error',
          text: 'Username and password are required',
          confirmButtonColor: '#00a65a',
        });
        return;
      }

      const response = await axios.post('http://localhost:3002/api/login', { username, password });

      if (response.status === 200 && response.data.success) {
        Swal.fire({
          icon: 'success',
          text: 'Login Successful!',
          confirmButtonColor: '#00a65a',
        });
        onLogin();
      } else {
        Swal.fire({
          icon: 'error',
          text: 'Invalid credentials',
          confirmButtonColor: '#00a65a',
        });
        console.error('Login failed:', response.data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        text: 'An error occurred during login',
        confirmButtonColor: '#00a65a',
      });
      console.error('Error during login:', error.message);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card p-4" style={{ width: '400px', height: '400px', border: "0px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleLogin} className="btn btn-success" style={{ width: "100%" }}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
