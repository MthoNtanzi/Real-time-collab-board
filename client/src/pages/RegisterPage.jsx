import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = await register({ name, email, password });
        if (user) navigate("/home");
    };

    return (
        <div className="min-h-screen bg-blue-800 text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        T
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Taskward</span>
                </div>

                <div className="bg-blue-900 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-1">Create an account</h2>
                    <p className="text-gray-400 text-sm mb-6">Start managing your work with your team</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-blue-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-blue-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-blue-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg font-medium text-sm mt-2"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}