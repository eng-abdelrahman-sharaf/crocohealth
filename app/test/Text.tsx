"use client";
import { useState } from "react";

interface Message {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
}

interface TextInputProps {
    onNewMessage: (message: Message) => void;
}

export const TextInput = ({ onNewMessage }: TextInputProps) => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
            timestamp: new Date(),
        };

        onNewMessage(userMessage);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/test-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    history: [], // You can maintain history state if needed
                }),
            });

            const data = await response.json();

            if (data.response) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "ai",
                    text: data.response,
                    timestamp: new Date(),
                };
                onNewMessage(aiMessage);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea
                rows={3}
                cols={50}
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
            />
            <button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
            >
                {isLoading ? "Sending..." : "Send"}
            </button>
        </div>
    );
};
