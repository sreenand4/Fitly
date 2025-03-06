import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, message, to } = await request.json();

    // Validate inputs
    if (!email || !message || !to) {
      return NextResponse.json(
        { message: 'Email and message are required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or another service
      auth: {
        user: "sreenand6@gmail.com",
        pass: "deal gkyv mswa uuby",
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: `New Contact Form Fitly: ${email}`,
      text: message,
      replyTo: email,
      html: `
        <h3>New message from Fitly</h3>
        <Image src="logo.png" alt="Fitly"/>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: `Failed to send email: ${error}` },
      { status: 500 }
    );
  }
}