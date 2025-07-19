import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
    message: string;
    context?: {
        isCollectingHistory?: boolean;
        symptoms?: string[];
        previousMessages?: string[];
    };
}

interface AIResponse {
    response: string;
    type: "medical-advice" | "history-collection" | "general" | "emergency";
    followUpQuestions?: string[];
    medicalData?: {
        extractedSymptoms?: string[];
        extractedMedications?: string[];
        extractedAllergies?: string[];
    };
}

// System prompt for the medical bot
const SYSTEM_PROMPT = `You are a Bot with a task of creating a medical history report
by asking proper questions ONE QUESTION at a time
and finally suggest which specialist doctor to go to and the required checks or tests
without asking for full name and age

Guidelines:
- Ask only ONE question at a time
- Be thorough but concise
- Focus on symptoms, duration, severity, and medical history
- Avoid asking for personal identifying information like full name and age
- At the end, provide specialist recommendations and suggested tests
- Use a professional but friendly tone`;

// Function to call Google Gemini API
async function callGeminiAPI(
    userMessage: string,
    conversationHistory: string[] = []
): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("Google API key not found");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    // Build the conversation context
    let fullPrompt = SYSTEM_PROMPT + "\n\n";

    if (conversationHistory.length > 0) {
        fullPrompt +=
            "Previous conversation:\n" +
            conversationHistory.join("\n") +
            "\n\n";
    }

    fullPrompt += "User: " + userMessage + "\n\nBot:";

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: fullPrompt,
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_MEDICAL",
                threshold: "BLOCK_NONE",
            },
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data = await response.json();

        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response format from Gemini API");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

// Function to extract medical information from user messages
function extractMedicalInformation(message: string) {
    const extracted = {
        symptoms: [] as string[],
        medications: [] as string[],
        allergies: [] as string[],
    };

    const lowerMessage = message.toLowerCase();

    // Extract common symptoms
    const symptomKeywords = [
        "pain",
        "ache",
        "fever",
        "cough",
        "nausea",
        "vomiting",
        "diarrhea",
        "constipation",
        "rash",
        "swelling",
        "bleeding",
        "shortness of breath",
        "headache",
        "dizzy",
        "tired",
        "fatigue",
        "chest pain",
        "back pain",
        "stomach pain",
        "sore throat",
        "runny nose",
        "congestion",
    ];

    symptomKeywords.forEach((symptom) => {
        if (lowerMessage.includes(symptom)) {
            extracted.symptoms.push(symptom);
        }
    });

    // Extract medications
    if (
        lowerMessage.includes("taking") ||
        lowerMessage.includes("medication") ||
        lowerMessage.includes("medicine") ||
        lowerMessage.includes("prescribed")
    ) {
        const medicationPattern =
            /\b(?:taking|medication|medicine|prescribed|drug|pill)\s+([a-zA-Z-]+)/gi;
        const matches = message.match(medicationPattern);
        if (matches) {
            extracted.medications.push(...matches);
        }
    }

    // Extract allergies
    if (lowerMessage.includes("allergic") || lowerMessage.includes("allergy")) {
        extracted.allergies.push(message);
    }

    return extracted;
}

// Function to determine response type
function determineResponseType(
    responseText: string
): "medical-advice" | "history-collection" | "general" | "emergency" {
    const lowerResponse = responseText.toLowerCase();

    if (
        lowerResponse.includes("emergency") ||
        lowerResponse.includes("911") ||
        lowerResponse.includes("urgent") ||
        lowerResponse.includes("immediately")
    ) {
        return "emergency";
    } else if (
        lowerResponse.includes("specialist") ||
        lowerResponse.includes("doctor") ||
        lowerResponse.includes("test") ||
        lowerResponse.includes("recommend")
    ) {
        return "medical-advice";
    } else if (
        lowerResponse.includes("question") ||
        lowerResponse.includes("tell me") ||
        lowerResponse.includes("describe") ||
        lowerResponse.includes("how long") ||
        lowerResponse.includes("when") ||
        lowerResponse.includes("?")
    ) {
        return "history-collection";
    }

    return "general";
}

export async function POST(request: NextRequest) {
    try {
        const chatMessage: ChatMessage = await request.json();

        if (!chatMessage.message || chatMessage.message.trim() === "") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Extract conversation history from context
        const conversationHistory = chatMessage.context?.previousMessages || [];

        // Call Gemini API
        const aiResponseText = await callGeminiAPI(
            chatMessage.message,
            conversationHistory
        );

        // Extract medical information from user message
        const extractedMedicalData = extractMedicalInformation(
            chatMessage.message
        );

        // Determine response type
        const responseType = determineResponseType(aiResponseText);

        const aiResponse: AIResponse = {
            response: aiResponseText,
            type: responseType,
            medicalData:
                extractedMedicalData.symptoms.length > 0 ||
                extractedMedicalData.medications.length > 0 ||
                extractedMedicalData.allergies.length > 0
                    ? {
                          extractedSymptoms: extractedMedicalData.symptoms,
                          extractedMedications:
                              extractedMedicalData.medications,
                          extractedAllergies: extractedMedicalData.allergies,
                      }
                    : undefined,
        };

        return NextResponse.json({
            success: true,
            ...aiResponse,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error processing chat message:", error);

        // Fallback response in case of API error
        const fallbackResponse: AIResponse = {
            response:
                "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. If this is a medical emergency, please call 911 or your local emergency services immediately.",
            type: "general",
        };

        return NextResponse.json({
            success: true,
            ...fallbackResponse,
            timestamp: new Date().toISOString(),
            error: "API temporarily unavailable",
        });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "AI Medical Chat API is active - Powered by Google Gemini",
        status: "operational",
        capabilities: [
            "Medical history collection",
            "One question at a time approach",
            "Specialist doctor recommendations",
            "Medical test suggestions",
            "Conversational medical assessment",
            "Symptom tracking",
            "Medication history collection",
        ],
        endpoints: {
            POST: "/api/chat - Send message for AI response",
            GET: "/api/chat - API status and capabilities",
        },
        systemPrompt:
            "Creates medical history reports by asking one question at a time and provides specialist recommendations",
        version: "1.0.0",
    });
}
