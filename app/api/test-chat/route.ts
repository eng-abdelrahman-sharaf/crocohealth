import { GoogleGenAI } from "@google/genai/node";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json();
        
        const ai = new GoogleGenAI({});
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: history || [],
            config: {
                systemInstruction: `You are a Bot with a task of creating a medical history report
by asking proper questions ONE QUESTION at a time
and finally suggest which specialist doctor to go to and the required checks or tests
without asking for full name and age`,
            },
        });

        const response = await chat.sendMessage({ message });
        const newHistory = chat.getHistory();
        
        return NextResponse.json({
            response: response.text,
            history: newHistory
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    }
}
