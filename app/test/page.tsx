"use client";
import { useState } from "react";
import { ChatMessage } from "../components/ChatMessage";
import { TextInput } from "./Text";

interface Message {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
}

export default function TestPage() {
    const [messages, setMessages] = useState<Message[]>([]);

    const handleNewMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    return (
        <div>
            <h1>Test Chat</h1>
            <div style={{ marginBottom: "20px", minHeight: "300px" }}>
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}
            </div>
            <TextInput onNewMessage={handleNewMessage} />
        </div>
    );
}
