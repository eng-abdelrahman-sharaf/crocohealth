"use client";

import { useState } from "react";

interface Symptom {
    id: string;
    name: string;
    category:
        | "pain"
        | "fever"
        | "respiratory"
        | "digestive"
        | "neurological"
        | "other";
    severity: "mild" | "moderate" | "severe";
    icon: string;
}

interface SymptomCheckerProps {
    onSymptomsSelected: (symptoms: Symptom[]) => void;
}

const availableSymptoms: Symptom[] = [
    // Pain
    {
        id: "headache",
        name: "Headache",
        category: "pain",
        severity: "moderate",
        icon: "🤕",
    },
    {
        id: "chest-pain",
        name: "Chest Pain",
        category: "pain",
        severity: "severe",
        icon: "💔",
    },
    {
        id: "abdominal-pain",
        name: "Abdominal Pain",
        category: "pain",
        severity: "moderate",
        icon: "🤰",
    },
    {
        id: "back-pain",
        name: "Back Pain",
        category: "pain",
        severity: "moderate",
        icon: "🦴",
    },
    {
        id: "joint-pain",
        name: "Joint Pain",
        category: "pain",
        severity: "mild",
        icon: "🦵",
    },

    // Fever
    {
        id: "fever",
        name: "Fever",
        category: "fever",
        severity: "moderate",
        icon: "🌡️",
    },
    {
        id: "chills",
        name: "Chills",
        category: "fever",
        severity: "mild",
        icon: "🥶",
    },

    // Respiratory
    {
        id: "cough",
        name: "Cough",
        category: "respiratory",
        severity: "mild",
        icon: "😷",
    },
    {
        id: "shortness-of-breath",
        name: "Shortness of Breath",
        category: "respiratory",
        severity: "severe",
        icon: "😮‍💨",
    },
    {
        id: "sore-throat",
        name: "Sore Throat",
        category: "respiratory",
        severity: "mild",
        icon: "🗣️",
    },
    {
        id: "runny-nose",
        name: "Runny Nose",
        category: "respiratory",
        severity: "mild",
        icon: "🤧",
    },

    // Digestive
    {
        id: "nausea",
        name: "Nausea",
        category: "digestive",
        severity: "moderate",
        icon: "🤢",
    },
    {
        id: "vomiting",
        name: "Vomiting",
        category: "digestive",
        severity: "moderate",
        icon: "🤮",
    },
    {
        id: "diarrhea",
        name: "Diarrhea",
        category: "digestive",
        severity: "moderate",
        icon: "💩",
    },
    {
        id: "constipation",
        name: "Constipation",
        category: "digestive",
        severity: "mild",
        icon: "😫",
    },

    // Neurological
    {
        id: "dizziness",
        name: "Dizziness",
        category: "neurological",
        severity: "moderate",
        icon: "😵‍💫",
    },
    {
        id: "fatigue",
        name: "Fatigue",
        category: "neurological",
        severity: "mild",
        icon: "😴",
    },
    {
        id: "confusion",
        name: "Confusion",
        category: "neurological",
        severity: "severe",
        icon: "🤔",
    },

    // Other
    {
        id: "rash",
        name: "Skin Rash",
        category: "other",
        severity: "mild",
        icon: "🔴",
    },
    {
        id: "swelling",
        name: "Swelling",
        category: "other",
        severity: "moderate",
        icon: "🎈",
    },
    {
        id: "weight-loss",
        name: "Unexplained Weight Loss",
        category: "other",
        severity: "moderate",
        icon: "⚖️",
    },
];

const categoryColors = {
    pain: "bg-red-500/20 text-red-300 border-red-500/30",
    fever: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    respiratory: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    digestive: "bg-green-500/20 text-green-300 border-green-500/30",
    neurological: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const severityColors = {
    mild: "bg-green-500",
    moderate: "bg-yellow-500",
    severe: "bg-red-500",
};

export function SymptomChecker({ onSymptomsSelected }: SymptomCheckerProps) {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const toggleSymptom = (symptomId: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptomId)
                ? prev.filter((id) => id !== symptomId)
                : [...prev, symptomId]
        );
    };

    const handleSubmit = () => {
        const symptoms = availableSymptoms.filter((s) =>
            selectedSymptoms.includes(s.id)
        );
        onSymptomsSelected(symptoms);
    };

    const filteredSymptoms =
        filterCategory === "all"
            ? availableSymptoms
            : availableSymptoms.filter((s) => s.category === filterCategory);

    const categories = [
        "all",
        ...new Set(availableSymptoms.map((s) => s.category)),
    ];

    return (
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">🩺</span>
                Symptom Checker
            </h3>

            {/* Category Filter */}
            <div className="mb-6">
                <p className="text-sm text-gray-300 mb-3">
                    Filter by category:
                </p>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilterCategory(category)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                                filterCategory === category
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-600/50"
                            }`}>
                            {category === "all"
                                ? "All"
                                : category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 gap-3 mb-6 max-h-64 overflow-y-auto">
                {filteredSymptoms.map((symptom) => (
                    <div
                        key={symptom.id}
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                            selectedSymptoms.includes(symptom.id)
                                ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25"
                                : `border-gray-600/50 hover:border-gray-500/50 ${
                                      categoryColors[symptom.category]
                                  }`
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{symptom.icon}</span>
                                <span className="font-medium">
                                    {symptom.name}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${
                                        severityColors[symptom.severity]
                                    }`}
                                    title={`Severity: ${symptom.severity}`}
                                />
                                {selectedSymptoms.includes(symptom.id) && (
                                    <span className="text-blue-400 text-xl">
                                        ✓
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
                <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
                    <p className="font-medium text-blue-300 mb-3">
                        Selected Symptoms ({selectedSymptoms.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selectedSymptoms.map((id) => {
                            const symptom = availableSymptoms.find(
                                (s) => s.id === id
                            );
                            return symptom ? (
                                <span
                                    key={id}
                                    className="inline-flex items-center px-3 py-2 bg-blue-600/30 text-blue-200 text-sm rounded-xl border border-blue-500/30">
                                    {symptom.icon} {symptom.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSymptom(id);
                                        }}
                                        className="ml-2 text-blue-300 hover:text-blue-100 transition-colors">
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
                <button
                    onClick={handleSubmit}
                    disabled={selectedSymptoms.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25">
                    Analyze Symptoms ({selectedSymptoms.length})
                </button>
                <button
                    onClick={() => setSelectedSymptoms([])}
                    className="px-6 py-3 bg-gray-600/50 text-gray-200 border border-gray-500/50 rounded-xl hover:bg-gray-500/50 transition-colors backdrop-blur-sm">
                    Clear All
                </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
                <p>
                    💡 <strong>Tip:</strong> Select all symptoms you're
                    currently experiencing. The severity indicator helps
                    prioritize your concerns.
                </p>
            </div>
        </div>
    );
}
