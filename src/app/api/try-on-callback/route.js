import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BITSTUDIO_API_KEY = 'bs_YMrMkSNUBWPFpXcKJVjcR5GpSyhwUfI';
const BITSTUDIO_API_BASE_URL = 'https://api.bitstudio.ai';

export async function GET(req) {
    console.log("GET request received at /api/try-on-callback for bitStudio polling");
    const taskId = req.nextUrl.searchParams.get("taskId");
    console.log(`Polling for bitStudio taskId: ${taskId}`);

    if (!taskId) {
        console.error("taskId missing in polling request to /api/try-on-callback");
        return NextResponse.json({ error: "Task ID is required for polling" }, { status: 400 });
    }

    try {
        const bitStudioStatusUrl = `${BITSTUDIO_API_BASE_URL}/images/${taskId}`;
        console.log(`Fetching status from bitStudio: ${bitStudioStatusUrl}`);

        const response = await axios.get(bitStudioStatusUrl, {
            headers: {
                'Authorization': `Bearer ${BITSTUDIO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Raw response from bitStudio GET /images/${taskId}:`, JSON.stringify(response.data, null, 2));

        const { status, path, error: bitStudioError, code: bitStudioErrorCode } = response.data;

        if (response.status >= 400 || bitStudioError) {
            console.error(`Error from bitStudio API when polling task ${taskId}:`, bitStudioError, `Code: ${bitStudioErrorCode}`);
            const errorStatus = response.data.status && typeof response.data.status === 'number' ? response.data.status : (response.status || 500);
            return NextResponse.json({
                error: bitStudioError || "Failed to fetch status from bitStudio",
                details: response.data.details,
                status: status || 'failed'
            }, { status: errorStatus });
        }

        console.log(`Returning status for taskId ${taskId}: status=${status}, path=${path}`);
        return NextResponse.json({
            status: status,
            result: path,
            rawResponse: response.data
        }, { status: 200 });

    } catch (error) {
        console.error(`Error in GET /api/try-on-callback while polling bitStudio task ${taskId}:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        if (error.isAxiosError && error.response) {
            return NextResponse.json({ error: error.response.data.error || 'Failed to poll bitStudio API', details: error.response.data.details, status: 'failed' }, { status: error.response.status || 500 });
        }
        return NextResponse.json({ error: "Internal server error in /api/try-on-callback", status: 'failed' }, { status: 500 });
    }
}