import { NextRequest, NextResponse } from "next/server";

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

interface AIAnalysis {
    riskLevel: "low" | "medium" | "high";
    suggestedActions: string[];
    followUpRecommendations: string[];
    redFlags: string[];
}

// Simulate AI analysis of medical record
function analyzeSymptoms(symptoms: string[]): AIAnalysis {
    const symptomsText = symptoms.join(" ").toLowerCase();

    let riskLevel: "low" | "medium" | "high" = "low";
    const suggestedActions: string[] = [];
    const followUpRecommendations: string[] = [];
    const redFlags: string[] = [];

    // High-risk symptoms
    if (
        symptomsText.includes("chest pain") ||
        symptomsText.includes("difficulty breathing") ||
        symptomsText.includes("severe headache")
    ) {
        riskLevel = "high";
        redFlags.push("Potentially serious symptoms detected");
        suggestedActions.push("Seek immediate medical attention");
        suggestedActions.push(
            "Contact emergency services if symptoms are severe"
        );
    }

    // Medium-risk symptoms
    else if (
        (symptomsText.includes("fever") && symptomsText.includes("pain")) ||
        symptomsText.includes("persistent") ||
        symptomsText.includes("worsening")
    ) {
        riskLevel = "medium";
        suggestedActions.push(
            "Schedule appointment with healthcare provider within 24-48 hours"
        );
        followUpRecommendations.push("Monitor symptoms closely");
    }

    // Low-risk symptoms
    else {
        suggestedActions.push("Self-care measures may be appropriate");
        suggestedActions.push("Monitor symptoms and seek care if they worsen");
        followUpRecommendations.push(
            "Follow up with healthcare provider if symptoms persist beyond 7-10 days"
        );
    }

    // General recommendations
    followUpRecommendations.push("Keep a symptom diary");
    followUpRecommendations.push("Stay hydrated and get adequate rest");
    followUpRecommendations.push("Follow medication instructions carefully");

    return {
        riskLevel,
        suggestedActions,
        followUpRecommendations,
        redFlags,
    };
}

export async function POST(request: NextRequest) {
    try {
        const medicalRecord: MedicalRecord = await request.json();

        // Validate required fields
        if (!medicalRecord.symptoms || medicalRecord.symptoms.length === 0) {
            return NextResponse.json(
                { error: "Symptoms are required for analysis" },
                { status: 400 }
            );
        }

        // Perform AI analysis
        const analysis = analyzeSymptoms(medicalRecord.symptoms);

        // Generate comprehensive medical report
        const medicalReport = {
            recordId: `MR-${Date.now()}`,
            patient: {
                name: medicalRecord.patientName,
                age: medicalRecord.age,
                gender: medicalRecord.gender,
            },
            consultation: {
                date: new Date().toISOString(),
                type: "AI Virtual Consultation",
                summary: medicalRecord.consultationSummary,
            },
            clinicalData: {
                symptoms: medicalRecord.symptoms,
                medicalHistory: medicalRecord.medicalHistory,
                currentMedications: medicalRecord.medications,
                allergies: medicalRecord.allergies,
            },
            aiAnalysis: analysis,
            recommendations: medicalRecord.recommendations,
            nextSteps: {
                immediateActions: analysis.suggestedActions,
                followUp: analysis.followUpRecommendations,
                warnings: analysis.redFlags,
            },
            disclaimer:
                "This AI-generated report is for informational purposes only and should not replace professional medical advice.",
        };

        return NextResponse.json({
            success: true,
            medicalReport,
            analysisComplete: true,
        });
    } catch (error) {
        console.error("Error processing medical record:", error);
        return NextResponse.json(
            { error: "Failed to process medical record" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Medical Record API is active",
        endpoints: {
            POST: "/api/medical-record - Submit medical record for AI analysis",
        },
    });
}
