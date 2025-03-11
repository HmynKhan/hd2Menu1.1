/* eslint-disable react/prop-types */
import { useState } from "react";

const Login = ({  onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token"); // Check if token exists

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
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed: " + error.message);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    window.location.reload(); // Reload to reflect logout state
  };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
          >
            X
          </button>
    
          {token ? (
            // If user is already logged in, show this message
            <div className="text-center">
  <h2 className="text-2xl font-bold mb-4">Already Logged In</h2>
  <p className="text-green-600 mb-4">You are already logged in.</p>
  
  <button
    onClick={handleLogout}
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
  >
    Logout
  </button>
</div>
          ) : (
            // Show login form if user is not logged in
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
              
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    );
};

export default Login;
