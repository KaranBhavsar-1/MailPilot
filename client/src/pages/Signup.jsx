import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signup({ ...form, role: "assistant" });

      toast.success("Account created!");
      navigate("/app");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          className="w-full rounded border p-3"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          className="w-full rounded border p-3"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          className="w-full rounded border p-3"
          name="password"
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
        />

        <button className="w-full rounded bg-blue-600 p-3 text-white">
          Sign Up
        </button>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;