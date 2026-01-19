import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

const ContactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = ContactFormSchema.safeParse(body);
    if (!result.success) {
      return ApiError.badRequest(result.error.issues[0].message);
    }

    const { firstName, lastName, email, subject, message } = result.data;

    // Store the contact message as an inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        firstName,
        lastName,
        email,
        message: `Subject: ${subject}\n\n${message}`,
        serviceType: "OTHER",
        status: "NEW",
      },
    });

    // In production, you would also send an email notification here
    // using Resend or another email service

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll be in touch soon!",
      id: inquiry.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
