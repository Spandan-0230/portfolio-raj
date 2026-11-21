import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }
    const { name, email, message } = body || {};

    // 1. Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    // 2. Validate message
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message exceeds 1000 characters limit." },
        { status: 400 }
      );
    }

    const senderName = name?.trim() || "Portfolio Visitor";
    const senderEmail = email.trim();
    const sanitizedMessage = message.trim();
    const recipientEmail =
      process.env.CONTACT_FORWARD_TO || "spandanbole777@gmail.com";
    const apiKey = process.env.RESEND_API_KEY;

    // 3. Verify server email service configuration
    if (!apiKey) {
      console.error(
        "[CONTACT_ERROR] RESEND_API_KEY is not defined in environment variables."
      );
      return NextResponse.json(
        {
          error:
            "Email service is not yet configured. Please set RESEND_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    // 4. Construct professional email layout with Reply-To header
    const emailSubject = `[Portfolio] Message from ${senderName}`;
    const formattedTimestamp = new Date().toLocaleString("en-US", {
      timeZone: "UTC",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin: 0; padding: 24px; background-color: #0d0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #141416; border: 1px solid #262628; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="background: linear-gradient(180deg, #1f1f23 0%, #141416 100%); padding: 24px 28px; border-bottom: 1px solid #262628;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                New Portfolio Message
              </h2>
              <p style="margin: 6px 0 0; font-size: 13px; color: #8e8e93;">
                Received on ${formattedTimestamp} UTC
              </p>
            </div>
            
            <div style="padding: 24px 28px;">
              <div style="margin-bottom: 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 4px;">
                  From
                </div>
                <div style="font-size: 15px; font-weight: 600; color: #ffffff;">
                  ${senderName}
                </div>
                <div style="font-size: 14px; color: #38bdf8; margin-top: 2px;">
                  <a href="mailto:${senderEmail}" style="color: #38bdf8; text-decoration: none;">${senderEmail}</a>
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 6px;">
                  Message Content
                </div>
                <div style="background-color: #0a0a0b; border: 1px solid #222225; border-radius: 10px; padding: 16px 18px; font-size: 14px; line-height: 1.6; color: #ededed; white-space: pre-wrap; word-break: break-word;">
                  ${sanitizedMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                </div>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222225; font-size: 12px; color: #71717a; display: flex; align-items: center; justify-content: space-between;">
                <span>Click <strong>Reply</strong> in your email client to respond directly to ${senderEmail}.</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `New Portfolio Message\n\nFrom: ${senderName} (${senderEmail})\nReceived: ${formattedTimestamp} UTC\n\nMessage:\n${sanitizedMessage}\n\n(Direct reply is set to ${senderEmail})`;

    // 5. Dispatch through Resend REST API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Portfolio Contact <onboarding@resend.dev>",
        to: [recipientEmail],
        reply_to: senderEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    });

    const resendData = await resendResponse.json().catch(() => null);

    // 6. Strict validation: Only return 200 OK if Resend successfully forwarded the email
    if (!resendResponse.ok) {
      console.error("[RESEND_DELIVERY_FAILURE]", {
        status: resendResponse.status,
        data: resendData,
      });

      const errorMessage =
        resendData?.message ||
        "Failed to forward message via email provider. Please try again later.";

      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    console.log("[CONTACT_FORWARD_SUCCESS]", {
      id: resendData?.id,
      to: recipientEmail,
      from: senderEmail,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message forwarded successfully.",
        deliveryId: resendData?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CONTACT_SUBMISSION_EXCEPTION]", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
