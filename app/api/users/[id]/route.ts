import { NextRequest, NextResponse } from "next/server";

// Mock user database - in a real app, this would be a database query
const mockUsers = [
    {
        id: "P001",
        name: "John Smith",
        email: "john.smith@email.com",
        registrationDate: new Date("2024-01-15"),
        lastVisit: new Date("2025-07-15"),
        medicalRecordsCount: 5,
    },
    {
        id: "P002",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        registrationDate: new Date("2024-03-20"),
        lastVisit: new Date("2025-07-10"),
        medicalRecordsCount: 3,
    },
    {
        id: "P123",
        name: "Michael Davis",
        email: "michael.davis@email.com",
        registrationDate: new Date("2024-06-10"),
        lastVisit: new Date("2025-07-08"),
        medicalRecordsCount: 7,
    },
    {
        id: "USER456",
        name: "Emily Brown",
        email: "emily.brown@email.com",
        registrationDate: new Date("2024-02-28"),
        lastVisit: new Date("2025-07-12"),
        medicalRecordsCount: 2,
    },
];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Find user in mock database
        const user = mockUsers.find(
            (u) => u.id.toLowerCase() === userId.toLowerCase()
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Return user data
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Optional: Add endpoint to get user's medical reports
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const { action } = await request.json();

        if (action === "get-reports") {
            // Mock medical reports for the user
            const mockReports = [
                {
                    id: `${userId}-report-1`,
                    date: new Date("2025-07-15"),
                    type: "General Checkup",
                    summary:
                        "Annual physical examination completed. All vitals normal.",
                    status: "Completed",
                },
                {
                    id: `${userId}-report-2`,
                    date: new Date("2025-06-20"),
                    type: "Blood Work",
                    summary:
                        "Comprehensive metabolic panel and CBC. Results within normal range.",
                    status: "Completed",
                },
                {
                    id: `${userId}-report-3`,
                    date: new Date("2025-05-10"),
                    type: "Symptom Analysis",
                    summary:
                        "AI-assisted symptom analysis for headache and fatigue. Recommendations provided.",
                    status: "Completed",
                },
            ];

            return NextResponse.json({ reports: mockReports }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error processing user request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
