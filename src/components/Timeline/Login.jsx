/* eslint-disable react/prop-types */
import { useState } from "react";

const Login = ({  onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch("https://dev.app.hd2.menu/api/login"
                                , {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Data : ", data);

      localStorage.setItem("token", data?.access_token);
      localStorage.setItem("email", email);
      
       if (onLoginSuccess) {
      onLoginSuccess();
    }
    onClose();
    window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed: " + error.message);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  
return (
  <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
      >
        &times;
      </button>

      {token ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">You are Already Logged In</h2>
          <p className="text-sm text-green-600 mb-6">
            {localStorage.getItem('email')} is logged in.
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
          {error && (
            <p className="text-sm text-red-500 mb-4 text-center bg-red-50 p-2 rounded">{error}</p>
          )}
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Login
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

};

export default Login;
