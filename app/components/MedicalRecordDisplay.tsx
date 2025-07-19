"use client";

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

interface MedicalRecordDisplayProps {
    record: Partial<MedicalRecord>;
    onDownload: () => void;
    onClose: () => void;
}

export function MedicalRecordDisplay({
    record,
    onDownload,
    onClose,
}: MedicalRecordDisplayProps) {
    const formatDate = (date: Date | undefined) => {
        return date
            ? date.toLocaleDateString() + " " + date.toLocaleTimeString()
            : "Not set";
    };

    const renderSection = (
        title: string,
        items: string[] | undefined,
        icon: string
    ) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                    <span className="mr-2">{icon}</span>
                    {title}
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="bg-gray-700/30 p-2 rounded-lg">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center">
                        <span className="mr-3">📋</span>
                        Medical Record
                    </h3>
                    <p className="text-sm text-gray-400">
                        Generated: {formatDate(record.timestamp)}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-200 text-2xl transition-colors"
                    aria-label="Close">
                    ×
                </button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Patient Information */}
                <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl backdrop-blur-sm">
                    <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
                        <span className="mr-2">👤</span>
                        Patient Information
                    </h4>
                    <div className="text-sm space-y-2">
                        <p className="text-gray-300">
                            <strong className="text-white">Name:</strong>{" "}
                            {record.patientName || "Not provided"}
                        </p>
                        <p className="text-gray-300">
                            <strong className="text-white">Age:</strong>{" "}
                            {record.age || "Not provided"}
                        </p>
                        <p className="text-gray-300">
                            <strong className="text-white">Gender:</strong>{" "}
                            {record.gender || "Not provided"}
                        </p>
                    </div>
                </div>

                {/* Clinical Data */}
                {renderSection("Symptoms", record.symptoms, "🩺")}
                {renderSection("Medical History", record.medicalHistory, "📖")}
                {renderSection("Current Medications", record.medications, "💊")}
                {renderSection("Allergies", record.allergies, "⚠️")}
                {renderSection(
                    "AI Recommendations",
                    record.recommendations,
                    "💡"
                )}

                {/* Consultation Summary */}
                {record.consultationSummary && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                            <span className="mr-2">📝</span>
                            Consultation Summary
                        </h4>
                        <p className="text-sm text-gray-300 bg-gray-700/50 p-4 rounded-xl">
                            {record.consultationSummary}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-700/50 pt-6 mt-6">
                <div className="flex space-x-3">
                    <button
                        onClick={onDownload}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="mr-2">📥</span>
                        Download Record
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center">
                        <span className="mr-2">🖨️</span>
                        Print
                    </button>
                </div>

                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-yellow-300">
                        <strong>⚠️ Disclaimer:</strong> This AI-generated record
                        is for informational purposes only. Please consult with
                        qualified healthcare professionals for medical
                        decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}
