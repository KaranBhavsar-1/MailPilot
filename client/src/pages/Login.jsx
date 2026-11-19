import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await login({ email, password });

      toast.success("Login successful!");

      navigate(data.user.role === "client" ? "/client" : "/app");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">MailPilot Login</h1>

        <input
          className="w-full rounded border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full rounded border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full rounded bg-blue-600 p-3 text-white">
          Login
        </button>

        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;