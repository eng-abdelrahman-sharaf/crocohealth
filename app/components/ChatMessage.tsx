"use client";

import { useState } from "react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
    type?: "medical-history" | "advice" | "general" | "emergency";
}

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongMessage = message.text.length > 300;
    const displayText =
        isLongMessage && !isExpanded
            ? message.text.substring(0, 300) + "..."
            : message.text;

    const getMessageStyle = () => {
        if (message.sender === "user") {
            return "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25";
        }

        switch (message.type) {
            case "emergency":
                return "bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm";
            case "medical-history":
                return "bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm";
            case "advice":
                return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 backdrop-blur-sm";
            default:
                return "bg-gray-700/80 text-gray-200 border border-gray-600/50 backdrop-blur-sm";
        }
    };

    const getIcon = () => {
        if (message.sender === "user") return "👤";

        switch (message.type) {
            case "emergency":
                return "🚨";
            case "medical-history":
                return "📋";
            case "advice":
                return "💡";
            default:
                return "🤖";
        }
    };

    return (
        <div
            className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
            }`}>
            <div
                className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl ${getMessageStyle()}`}>
                <div className="flex items-start space-x-3">
                    <span className="text-xl">{getIcon()}</span>
                    <div className="flex-1">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                            {displayText}
                            {isLongMessage && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="ml-2 text-xs underline opacity-70 hover:opacity-100 transition-opacity">
                                    {isExpanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs opacity-60">
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.type && (
                                <span className="text-xs px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
                                    {message.type.replace("-", " ")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
