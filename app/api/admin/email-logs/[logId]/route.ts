import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/unified-auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import { EmailLog } from "@/src/models/EmailLog";

export async function GET(
  request: NextRequest,
  context: { params: { logId: string } }
) {
  try {
    // Authentication check with admin role requirement
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    if (!user?.roles?.includes("admin")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Await params before using
    const { logId } = context.params;

    // Find the email log with full content
    const emailLog = (await EmailLog.findById(logId).lean()) as any;

    if (!emailLog) {
      return NextResponse.json(
        { error: "Email log not found" },
        { status: 404 }
      );
    }

    // Transform for response
    const responseEmailLog = {
      id: emailLog._id.toString(),
      to: emailLog.to,
      cc: emailLog.cc,
      bcc: emailLog.bcc,
      from: emailLog.from,
      subject: emailLog.subject,
      htmlContent: emailLog.htmlContent,
      textContent: emailLog.textContent,
      type: emailLog.type,
      status: emailLog.status,
      provider: emailLog.provider,
      messageId: emailLog.messageId,
      errorMessage: emailLog.errorMessage,
      retryCount: emailLog.retryCount,
      maxRetries: emailLog.maxRetries,
      relatedEntityId: emailLog.relatedEntityId?.toString(),
      relatedEntityType: emailLog.relatedEntityType,
      notificationId: emailLog.notificationId?.toString(),
      metadata: emailLog.metadata,
      sentAt: emailLog.sentAt,
      deliveredAt: emailLog.deliveredAt,
      openedAt: emailLog.openedAt,
      clickedAt: emailLog.clickedAt,
      createdAt: emailLog.createdAt,
      updatedAt: emailLog.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: responseEmailLog,
    });
  } catch (error) {
    console.error("Error fetching email log:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
