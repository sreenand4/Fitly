import { NextRequest, NextResponse } from "next/server";

const taskStore = new Map();

export async function POST(req) {
    console.log("POST request received at /api/try-on-callback");
    try {
        const body = await req.json();
        console.log("Request body from KLING", body);
        const { task_id, task_status, task_result } = body;
        if (!task_id) {
            return NextResponse.json({ error: "task_id is required" }, { status: 400 });
        }
        const resultUrl = task_result?.images?.[0]?.url;
        taskStore.set(task_id, {
            status: task_status,
            result: resultUrl,
        })
        console.log(`Updated task ${task_id} with status: ${task_status}`);
        if (resultUrl) {
            console.log(`Result URL received for task ${task_id}: ${resultUrl}`);
        }
        console.log("Current taskStore:", Object.fromEntries(taskStore));
        return NextResponse.json({ message: "Callback processed" }, { status: 200 });
    } catch (error) {
        console.error("Error in POST request to /api/try-on-callback:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// For polling
export async function GET(req) {
    console.log("GET request received at /api/try-on-callback");
    const task_id = req.nextUrl.searchParams.get("taskId");
    console.log(`Polling for taskId: ${task_id}`);
    console.log("Current taskStore:", Object.fromEntries(taskStore));
    if (!task_id || !taskStore.has(task_id)) {
        console.log(`Task ${task_id} not found in taskStore`);
        return NextResponse.json({ error: "Task not found yet" }, { status: 404 });
    }
    const task = taskStore.get(task_id);
    console.log(`Returning task data for ${task_id}:`, task);
    return NextResponse.json(task, { status: 200 });
}