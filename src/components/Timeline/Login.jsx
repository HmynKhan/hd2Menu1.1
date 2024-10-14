import { useState } from "react";
import request from "../../services/request"; // Adjust the path based on your folder structure
import { storeToken } from "../../services/localStorage"; // Adjust the path based on your folder structure

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      // Make API request to login and get the token

      // Check if the response has the token
      const res = await fetch("https://dev.app.hd2.menu/api/login", {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded" style={{ width: "300px" }}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
