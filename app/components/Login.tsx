"use client";

import { useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: "patient" | "doctor" | "admin";
}

interface LoginProps {
    onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
    const [loginType, setLoginType] = useState<"login" | "register">("login");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        role: "patient" as "patient" | "doctor" | "admin",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Mock users database
    const mockUsers = [
        {
            id: "P001",
            name: "John Smith",
            email: "john.smith@email.com",
            password: "password123",
            role: "patient" as const,
        },
        {
            id: "D001",
            name: "Dr. Sarah Johnson",
            email: "dr.johnson@hospital.com",
            password: "doctor123",
            role: "doctor" as const,
        },
        {
            id: "A001",
            name: "Admin User",
            email: "admin@system.com",
            password: "admin123",
            role: "admin" as const,
        },
    ];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Please fill in all required fields");
            return;
        }

        if (loginType === "register" && !formData.name) {
            setError("Name is required for registration");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (loginType === "login") {
                // Find user in mock database
                const user = mockUsers.find(
                    (u) =>
                        u.email.toLowerCase() ===
                            formData.email.toLowerCase() &&
                        u.password === formData.password
                );

                if (user) {
                    onLogin({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    });
                } else {
                    setError(
                        "Invalid email or password. Try: john.smith@email.com / password123"
                    );
                }
            } else {
                // Register new user
                const newUser: User = {
                    id: `${formData.role.toUpperCase()}${Date.now()}`,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                };
                onLogin(newUser);
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = (userType: "patient" | "doctor" | "admin") => {
        const user = mockUsers.find((u) => u.role === userType);
        if (user) {
            onLogin({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🏥</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        AI Medical Assistant
                    </h1>
                    <p className="text-gray-300">
                        Please login to access your medical assistant
                    </p>
                </div>

                {/* Login/Register Form */}
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
                    {/* Toggle Buttons */}
                    <div className="flex mb-6 bg-gray-700/50 rounded-xl p-1">
                        <button
                            onClick={() => setLoginType("login")}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                loginType === "login"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                    : "text-gray-300 hover:text-white"
                            }`}>
                            Login
                        </button>
                        <button
                            onClick={() => setLoginType("register")}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                loginType === "register"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                    : "text-gray-300 hover:text-white"
                            }`}>
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {loginType === "register" && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                            />
                        </div>

                        {loginType === "register" && (
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-300 mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-3">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>
                                        {loginType === "login"
                                            ? "Logging in..."
                                            : "Registering..."}
                                    </span>
                                </>
                            ) : (
                                <span>
                                    {loginType === "login"
                                        ? "Login"
                                        : "Register"}
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Quick Login Demo */}
                    {loginType === "login" && (
                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                            <p className="text-sm text-gray-400 mb-4 text-center">
                                Quick Demo Login:
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => quickLogin("patient")}
                                    className="w-full bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors text-sm">
                                    👤 Login as Patient
                                </button>
                                <button
                                    onClick={() => quickLogin("doctor")}
                                    className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                                    👨‍⚕️ Login as Doctor
                                </button>
                                <button
                                    onClick={() => quickLogin("admin")}
                                    className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors text-sm">
                                    👑 Login as Admin
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-400 text-sm">
                    <p>🔒 Your data is secure and encrypted</p>
                </div>
            </div>
        </div>
    );
}
