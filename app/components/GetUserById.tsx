"use client";

import { useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    registrationDate: Date;
    lastVisit: Date;
    medicalRecordsCount: number;
}

interface GetUserByIdProps {
    onUserFound: (user: User) => void;
}

export function GetUserById({ onUserFound }: GetUserByIdProps) {
    const [userId, setUserId] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!userId.trim()) {
            setError("Please enter a valid User ID");
            return;
        }

        setIsSearching(true);
        setError("");

        try {
            // Simulate API call - replace with actual API endpoint
            const response = await fetch(`/api/users/${userId}`);

            if (response.ok) {
                const userData = await response.json();
                onUserFound(userData);
                setUserId("");
            } else if (response.status === 404) {
                setError("User not found. Please check the ID and try again.");
            } else {
                setError("Error retrieving user data. Please try again.");
            }
        } catch (err) {
            // For demo purposes, create a mock user if API doesn't exist
            const mockUser: User = {
                id: userId,
                name: `Patient ${userId}`,
                email: `patient${userId}@example.com`,
                registrationDate: new Date(
                    Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
                ),
                lastVisit: new Date(
                    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
                ),
                medicalRecordsCount: Math.floor(Math.random() * 10) + 1,
            };
            onUserFound(mockUser);
            setUserId("");
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">🔍</span>
                Find Patient by ID
            </h3>

            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="userId"
                        className="block text-sm font-medium text-gray-300 mb-2">
                        Patient ID
                    </label>
                    <div className="flex space-x-3">
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter patient ID (e.g., P001, P123)"
                            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            disabled={isSearching}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !userId.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center space-x-2">
                            {isSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                            <span className="text-red-400">⚠️</span>
                            <span className="text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                <div className="text-sm text-gray-400">
                    <p>
                        💡 <strong>Tip:</strong> Enter a patient ID to retrieve
                        their medical records and information. Examples: P001,
                        P123, USER456
                    </p>
                </div>
            </div>
        </div>
    );
}
