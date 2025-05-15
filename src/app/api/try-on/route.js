import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken"; // No longer needed for bitStudio
import axios from "axios";
import https from "https";

// const ACCESS_KEY = '22ffc138967442fe811f7cae79a3cc4f'; // Kling AI
// const SECRET_KEY = 'ec6b33b8c5764d78a68c2e2c5f0625fa'; // Kling AI
// const KLING_API_URL = 'https://api.klingai.com/v1/images/kolors-virtual-try-on'; // Kling AI

const BITSTUDIO_API_KEY = 'bs_YMrMkSNUBWPFpXcKJVjcR5GpSyhwUfI';
const BITSTUDIO_API_URL = 'https://api.bitstudio.ai/images/virtual-try-on';

/* // No longer needed for bitStudio
function generateJwtToken() {
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };
    const payload = {
        iss: ACCESS_KEY,
        exp: Math.floor(Date.now() / 1000) + 1800,
        nbf: Math.floor(Date.now() / 1000) - 5,
    };
    return jwt.sign(payload, SECRET_KEY, { header });
}
*/

// POST /api/try-on to send the request to bitStudio
export async function POST(req) {
    console.log("Entering /api/try-on POST handler for bitStudio");
    try {
        // Validate the request body
        // const { human_image, cloth_image } = await req.json(); // Old structure for Kling AI (base64)
        const { person_image_url, outfit_image_url } = await req.json(); // New structure for bitStudio (URLs)
        console.log("Received person_image_url:", person_image_url);
        console.log("Received outfit_image_url:", outfit_image_url);

        if (!person_image_url || !outfit_image_url) {
            console.error("Missing person_image_url or outfit_image_url in request");
            return NextResponse.json({ error: "Missing person_image_url or outfit_image_url" }, { status: 400 });
        }

        // const token = generateJwtToken(); // No longer needed for bitStudio
        // console.log("token generated successfully: ", token); // Old log

        const requestBody = {
            // model_name: "kolors-virtual-try-on-v1", // Kling AI specific
            // human_image: human_image, // Kling AI specific
            // cloth_image: cloth_image, // Kling AI specific
            // callback_url: `${req.headers.get('origin')}/api/try-on-callback`, // Kling AI specific
            person_image_url: person_image_url,
            outfit_image_url: outfit_image_url,
            resolution: "standard",
            num_images: 1
        };
        console.log("Request body for bitStudio:", JSON.stringify(requestBody, null, 2));

        const httpsAgent = new https.Agent({
            rejectUnauthorized: true, // Keep this for security
            minVersion: "TLSv1.2",
            maxVersion: "TLSv1.3",
        });

        console.log("Sending request to bitStudio API:", BITSTUDIO_API_URL);
        const response = await axios.post(BITSTUDIO_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BITSTUDIO_API_KEY}`, // bitStudio auth
            },
            httpsAgent: httpsAgent,
        });

        console.log("Raw response from bitStudio:", JSON.stringify(response.data, null, 2));

        // const { code, message, data } = response.data; // Kling AI response structure
        // if (code !== 0) { // Kling AI error check
        //     console.error("Error from Kling API:", message);
        //     return NextResponse.json({ error: message }, { status: 400 });
        // }
        // return NextResponse.json({ taskId: data.task_id, taskStatus: data.task_status }, { status: 200 }); // Kling AI success

        // bitStudio response structure is an array, we typically care about the first item.
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const bitStudioResponse = response.data[0];
            const taskId = bitStudioResponse.id;
            const taskStatus = bitStudioResponse.status;

            if (!taskId) {
                console.error("bitStudio response missing id (taskId)");
                return NextResponse.json({ error: "bitStudio response missing id" }, { status: 500 });
            }
            console.log(`Success from bitStudio: taskId=${taskId}, taskStatus=${taskStatus}`);
            // Forward the relevant parts of the bitStudio response
            return NextResponse.json({ taskId: taskId, taskStatus: taskStatus, rawResponse: bitStudioResponse }, { status: 200 });
        } else {
            console.error("Unexpected response structure from bitStudio:", response.data);
            return NextResponse.json({ error: "Unexpected response structure from bitStudio" }, { status: 500 });
        }

    } catch (error) {
        console.error('Error calling bitStudio API or processing request in /api/try-on:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        if (error.isAxiosError && error.response) {
            // Forward the error from bitStudio if available
            return NextResponse.json({ error: error.response.data.error || 'Failed to contact bitStudio API', details: error.response.data.details }, { status: error.response.status || 500 });
        }
        return NextResponse.json({ error: 'Internal server error in /api/try-on' }, { status: 500 });
    }
}