import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import axios from "axios";
import https from "https";

const ACCESS_KEY = '49468eee639e46c3acfe0936c88e2cee';
const SECRET_KEY = '3380fc8ab2f64b3287bdcff34375f932';
const KLING_API_URL = 'https://api.klingai.com/v1/images/kolors-virtual-try-on';

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

// POST /api/try-on to send the request to KLING
export async function POST(req) {
    console.log("POST request received at /api/try-on");
    try {
        console.log("Entering try block");
        // validate the request body
        const { human_image, cloth_image } = await req.json();
        console.log("Request body:", { human_image, cloth_image });
        if (!human_image || !cloth_image) {
            return NextResponse.json({ error: "Missing human_image or cloth_image" }, { status: 400 });
        }
        // generate the JWT token
        const token = generateJwtToken();
        console.log("token generated successfully: ", token);
        const requestBody = {
            model_name: "kolors-virtual-try-on-v1",
            human_image: human_image,
            cloth_image: cloth_image,
            callback_url: `${req.headers.get('origin')}/api/try-on-callback`,
        };
        const httpsAgent = new https.Agent({
            rejectUnauthorized: true,
            secureProtocol: "TLSv1_2_method",
        });
        // send the request to KLING
        const response = await axios.post(KLING_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            httpsAgent,
        })
        console.log("RESPONSE FROM KLING: ", response.data);
        // collect the response
        const { code, message, data } = response.data;
        if (code !== 0) {
            return NextResponse.json({ error: message }, { status: 400 });
        }
        // success
        return NextResponse.json({ taskId: data.task_id, taskStatus: data.task_status }, { status: 200 });

    } catch (error) {
        console.error('Error calling KLING API:', error);
        return NextResponse.json({ error: 'Failed to contact KLING api' }, { status: 500 });
    }
}