"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { MedicalRecordDisplay } from "./components/MedicalRecordDisplay";
import { SymptomChecker } from "./components/SymptomChecker";
import { GetUserById } from "./components/GetUserById";
import { UserInfo } from "./components/UserInfo";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

interface MedicalRecord {
    patientName: string;
    age?: number;
    gender?: string;
    symptoms: string[];
    medicalHistory: string[];
    medications: string[];
    allergies: string[];
    consultationSummary: string;
    recommendations: string[];
    timestamp: Date;
}

interface User {
    id: string;
    name: string;
    email: string;
    registrationDate: Date;
    lastVisit: Date;
    medicalRecordsCount: number;
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm your AI Medical Assistant. I'm here to help collect your medical history and provide health advice. Please note that I'm not a replacement for professional medical care.\n\n🩺 Use the Symptom Checker to select your symptoms\n💬 Chat with me about your health concerns\n📋 Start building your medical record\n\nHow can I assist you today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);

    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCollectingHistory, setIsCollectingHistory] = useState(false);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [medicalRecord, setMedicalRecord] = useState<Partial<MedicalRecord>>({
        symptoms: [],
        medicalHistory: [],
        medications: [],
        allergies: [],
        recommendations: [],
        timestamp: new Date(),
    });
    const [showMedicalRecord, setShowMedicalRecord] = useState(false);
    const [showSymptomChecker, setShowSymptomChecker] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userReports, setUserReports] = useState<any[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (text: string, sender: "user" | "ai") => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);

        // Add user message
        addMessage(inputText, "user");
        const userMessage = inputText;
        setInputText("");

        // Process AI response using test-chat API
        try {
            const response = await fetch("/api/test-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: chatHistory,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();

            // Update chat history
            setChatHistory(data.history);

            // Add AI response
            addMessage(data.response, "ai");
        } catch (error) {
            console.error("Error calling test-chat API:", error);
            addMessage(
                "I apologize, but I encountered an error. Please try again.",
                "ai"
            );
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

    const handleSymptomsSelected = (symptoms: any[]) => {
        const symptomText = symptoms.map((s) => s.name).join(", ");
        setInputText(
            `I am experiencing the following symptoms: ${symptomText}`
        );
        setShowSymptomChecker(false);

        // Update medical record
        setMedicalRecord((prev) => ({
            ...prev,
            symptoms: [
                ...(prev.symptoms || []),
                ...symptoms.map((s) => `${s.name} (${s.severity})`),
            ],
        }));
    };

    const handleUserFound = (user: User) => {
        setSelectedUser(user);
        setShowUserSearch(false);
        addMessage(
            `Patient ${user.name} (ID: ${user.id}) has been found and loaded. You can now view their medical reports and information.`,
            "ai"
        );
    };

    const handleViewReports = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "get-reports" }),
            });

            if (response.ok) {
                const data = await response.json();
                setUserReports(data.reports || []);
                addMessage(
                    `Found ${data.reports?.length || 0} medical reports for ${
                        selectedUser?.name
                    }. Reports have been loaded and are available for review.`,
                    "ai"
                );
            } else {
                addMessage(
                    "Unable to retrieve medical reports at this time. Please try again later.",
                    "ai"
                );
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            addMessage(
                "Error occurred while fetching medical reports. Please try again.",
                "ai"
            );
        }
    };

    const handleCloseUserInfo = () => {
        setSelectedUser(null);
        setUserReports([]);
    };

    const generateMedicalRecord = (): MedicalRecord => {
        return {
            patientName: medicalRecord.patientName || "Patient",
            age: medicalRecord.age,
            gender: medicalRecord.gender,
            symptoms: medicalRecord.symptoms || [],
            medicalHistory: medicalRecord.medicalHistory || [],
            medications: medicalRecord.medications || [],
            allergies: medicalRecord.allergies || [],
            consultationSummary: `Virtual consultation conducted on ${new Date().toLocaleDateString()}. Patient discussed various symptoms and received AI-generated health guidance.`,
            recommendations: medicalRecord.recommendations || [],
            timestamp: new Date(),
        };
    };

    const downloadMedicalRecord = () => {
        const record = generateMedicalRecord();
        const blob = new Blob([JSON.stringify(record, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `medical-record-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg shadow-blue-500/25">
                        <span className="text-2xl">🏥</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                        AI Medical Assistant
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Secure Medical History Collection & Health
                        Consultation
                    </p>
                    <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-400">
                        <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    Chat Interface
                                </span>
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                    Symptom Checker
                                </span>
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                    Medical Records
                                </span>
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                                    AI-Powered
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                            {/* Chat Interface - Main Focus */}
                            <div className="xl:col-span-3 order-1">
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50">
                                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                                <span className="text-2xl">
                                                    🤖
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">
                                                    Chat with AI Assistant
                                                </h2>
                                                <p className="text-blue-100 text-sm">
                                                    Ask questions, share
                                                    symptoms, or start medical
                                                    history collection
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-900/30">
                                        {messages.map((message) => (
                                            <ChatMessage
                                                key={message.id}
                                                message={message}
                                            />
                                        ))}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-700/80 text-gray-200 px-6 py-3 rounded-2xl backdrop-blur-sm">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                                                        <span className="text-sm">
                                                            AI is thinking...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="border-t border-gray-700/50 p-6 bg-gray-800/30">
                                        <div className="flex space-x-3">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputText}
                                                onChange={(e) =>
                                                    setInputText(e.target.value)
                                                }
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your message or describe your symptoms..."
                                                className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                                                disabled={isLoading}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={
                                                    isLoading ||
                                                    !inputText.trim()
                                                }
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25">
                                                <span className="flex items-center space-x-2">
                                                    <span>Send</span>
                                                    <span>🚀</span>
                                                </span>
                                            </button>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() =>
                                                    setInputText(
                                                        "Start medical history collection"
                                                    )
                                                }
                                                className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors backdrop-blur-sm">
                                                📋 Start Medical History
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowSymptomChecker(
                                                        !showSymptomChecker
                                                    )
                                                }
                                                className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors backdrop-blur-sm">
                                                🩺 Symptom Checker
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setInputText(
                                                        "Generate medical record"
                                                    )
                                                }
                                                className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors backdrop-blur-sm">
                                                📄 Generate Record
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowUserSearch(
                                                        !showUserSearch
                                                    )
                                                }
                                                className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-2 rounded-lg hover:bg-orange-500/30 transition-colors backdrop-blur-sm">
                                                🔍 Find Patient
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Side Panel */}
                            <div className="xl:col-span-2 space-y-6 order-2">
                                {/* User Search */}
                                {showUserSearch && !selectedUser && (
                                    <GetUserById
                                        onUserFound={handleUserFound}
                                    />
                                )}

                                {/* User Info */}
                                {selectedUser && (
                                    <UserInfo
                                        user={selectedUser}
                                        onViewReports={handleViewReports}
                                        onClose={handleCloseUserInfo}
                                    />
                                )}

                                {/* User Reports Display */}
                                {userReports.length > 0 && (
                                    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
                                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                            <span className="mr-3">📋</span>
                                            Medical Reports for{" "}
                                            {selectedUser?.name}
                                        </h3>
                                        <div className="space-y-4">
                                            {userReports.map(
                                                (report, index) => (
                                                    <div
                                                        key={report.id}
                                                        className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-lg font-medium text-white">
                                                                {report.type}
                                                            </h4>
                                                            <span className="text-sm text-gray-400">
                                                                {new Date(
                                                                    report.date
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm mb-2">
                                                            {report.summary}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    report.status ===
                                                                    "Completed"
                                                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                                }`}>
                                                                {report.status}
                                                            </span>
                                                            <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                                                                View Details →
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setUserReports([])}
                                            className="mt-4 w-full bg-gray-600/50 text-gray-200 border border-gray-500/50 px-4 py-2 rounded-xl hover:bg-gray-500/50 transition-colors backdrop-blur-sm">
                                            Close Reports
                                        </button>
                                    </div>
                                )}

                                {/* Symptom Checker */}
                                {showSymptomChecker && (
                                    <SymptomChecker
                                        onSymptomsSelected={
                                            handleSymptomsSelected
                                        }
                                    />
                                )}

                                {/* Medical Record */}
                                {showMedicalRecord && (
                                    <MedicalRecordDisplay
                                        record={generateMedicalRecord()}
                                        onDownload={downloadMedicalRecord}
                                        onClose={() =>
                                            setShowMedicalRecord(false)
                                        }
                                    />
                                )}

                                {/* Disclaimer */}
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm">
                                    <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                                        <span className="mr-2">⚠️</span>
                                        Important Disclaimer
                                    </h3>
                                    <p className="text-sm text-yellow-300/80">
                                        This AI assistant provides general
                                        health information only. It is not a
                                        substitute for professional medical
                                        advice, diagnosis, or treatment. Always
                                        consult qualified healthcare providers
                                        for medical concerns.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
