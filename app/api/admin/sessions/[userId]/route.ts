import { NextRequest, NextResponse } from "next/server";
import {
  withJWTAuthDynamic,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/middleware/jwt-auth";
import { revokeAllUserTokens } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { User } from "@/src/models";

// Terminate all sessions for a specific user
async function terminateAllUserSessionsHandler(
  request: NextRequest,
  user: any,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before using
    const { userId } = await params;

    if (!userId) {
      return createErrorResponse("User ID is required", 400, "MISSING_USER_ID");
    }

    const { db } = await connectToDatabase();

    // Check if target user exists
    const targetUser = await User.findOne({
      _id: new ObjectId(userId),
    });

    if (!targetUser) {
      return createErrorResponse("User not found", 404, "USER_NOT_FOUND");
    }

    // Revoke all tokens for the user
    const success = await revokeAllUserTokens(userId);

    if (!success) {
      return createErrorResponse(
        "Failed to terminate user sessions",
        500,
        "TERMINATE_SESSIONS_FAILED"
      );
    }

    // Log the action
    await db.collection("admin_actions").insertOne({
      action: "terminate_all_sessions",
      adminId: user._id.toString(),
      targetUserId: userId,
      targetUserEmail: targetUser.email,
      timestamp: new Date(),
      details: {
        reason: "Admin terminated all sessions",
      },
    });

    return createSuccessResponse(
      null,
      `All sessions terminated for ${targetUser.email}`
    );
  } catch (error) {
    console.error("Terminate all user sessions error:", error);
    return createErrorResponse(
      "Failed to terminate user sessions",
      500,
      "TERMINATE_SESSIONS_FAILED"
    );
  }
}

// Get sessions for a specific user
async function getUserSessionsHandler(
  request: NextRequest,
  user: any,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before using
    const { userId } = await params;

    if (!userId) {
      return createErrorResponse("User ID is required", 400, "MISSING_USER_ID");
    }

    const { db } = await connectToDatabase();

    // Get all sessions for the user
    const sessions = await db
      .collection("refresh_tokens")
      .find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return createSuccessResponse({
      userId,
      sessions: sessions.map((session) => ({
        tokenId: session.tokenId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastUsed: session.lastUsed,
      })),
    });
  } catch (error) {
    console.error("Get user sessions error:", error);
    return createErrorResponse(
      "Failed to fetch user sessions",
      500,
      "FETCH_USER_SESSIONS_FAILED"
    );
  }
}

export const DELETE = withJWTAuthDynamic(terminateAllUserSessionsHandler, {
  requireAdmin: true,
});
export const GET = withJWTAuthDynamic(getUserSessionsHandler, {
  requireAdmin: true,
});
