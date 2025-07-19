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

interface UserInfoProps {
    user: User;
    onViewReports: (userId: string) => void;
    onClose: () => void;
}

export function UserInfo({ user, onViewReports, onClose }: UserInfoProps) {
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    const handleViewReports = async () => {
        setIsLoadingReports(true);
        try {
            await onViewReports(user.id);
        } finally {
            setIsLoadingReports(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getTimeSince = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-3">👤</span>
                    Patient Information
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-1">
                    <span className="text-xl">✕</span>
                </button>
            </div>

            <div className="space-y-6">
                {/* Patient ID Card */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                            {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-white">
                                {user.name}
                            </h4>
                            <p className="text-blue-300 font-mono text-lg">
                                ID: {user.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">📧</span>
                            <span className="text-sm text-gray-400">Email</span>
                        </div>
                        <p className="text-white font-medium">{user.email}</p>
                    </div>

                    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">📊</span>
                            <span className="text-sm text-gray-400">
                                Medical Records
                            </span>
                        </div>
                        <p className="text-white font-medium">
                            {user.medicalRecordsCount} records
                        </p>
                    </div>
                </div>

                {/* Activity Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">📅</span>
                            <span className="text-sm text-gray-400">
                                Registration Date
                            </span>
                        </div>
                        <p className="text-white font-medium">
                            {formatDate(user.registrationDate)}
                        </p>
                    </div>

                    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">⏰</span>
                            <span className="text-sm text-gray-400">
                                Last Visit
                            </span>
                        </div>
                        <p className="text-white font-medium">
                            {getTimeSince(user.lastVisit)}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            {formatDate(user.lastVisit)}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleViewReports}
                        disabled={isLoadingReports}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25 flex items-center justify-center space-x-3">
                        {isLoadingReports ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading Reports...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl">📋</span>
                                <span>View Medical Reports</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="bg-gray-600/50 text-gray-200 border border-gray-500/50 px-6 py-4 rounded-xl hover:bg-gray-500/50 transition-colors backdrop-blur-sm flex items-center justify-center space-x-3">
                        <span className="text-xl">👈</span>
                        <span>Back to Search</span>
                    </button>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                        <span className="text-blue-400 text-xl">ℹ️</span>
                        <div className="text-sm text-blue-300">
                            <p className="font-medium mb-2">
                                Patient Data Overview:
                            </p>
                            <ul className="space-y-1 text-blue-200">
                                <li>
                                    • Patient has been registered for{" "}
                                    {Math.floor(
                                        (new Date().getTime() -
                                            user.registrationDate.getTime()) /
                                            (1000 * 60 * 60 * 24 * 30)
                                    )}{" "}
                                    months
                                </li>
                                <li>
                                    • {user.medicalRecordsCount} medical records
                                    available
                                </li>
                                <li>
                                    • Last activity:{" "}
                                    {getTimeSince(user.lastVisit)}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
