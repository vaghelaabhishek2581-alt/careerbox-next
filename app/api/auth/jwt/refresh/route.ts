import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  verifyRefreshToken,
  generateTokenPair,
  revokeRefreshToken,
} from "@/lib/auth/jwt";
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequiredFields,
} from "@/lib/middleware/jwt-auth";
import { User } from "@/src/models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validation = validateRequiredFields(body, ["refreshToken"]);
    if (!validation.valid) {
      return createErrorResponse(
        "Refresh token is required",
        400,
        "MISSING_REFRESH_TOKEN"
      );
    }

    const { refreshToken } = body;

    // Verify refresh token
    const { valid, payload, error } = await verifyRefreshToken(refreshToken);

    if (!valid || !payload) {
      return createErrorResponse(
        error || "Invalid refresh token",
        401,
        "INVALID_REFRESH_TOKEN"
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(payload.userId)) {
      return createErrorResponse(
        "Invalid user ID format",
        400,
        "INVALID_USER_ID"
      );
    }

    // Get user - convert string userId to ObjectId
    const user = await User.findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user) {
      return createErrorResponse("User not found", 404, "USER_NOT_FOUND");
    }

    // Check if user is active
    if (user.status !== "active") {
      return createErrorResponse(
        "Account is not active",
        403,
        "ACCOUNT_INACTIVE"
      );
    }

    // Revoke old refresh token
    await revokeRefreshToken(payload.tokenId);

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      tokenId,
    } = await generateTokenPair(user);

    return createSuccessResponse(
      {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          tokenId,
        },
      },
      "Tokens refreshed successfully"
    );
  } catch (error) {
    console.error("JWT refresh error:", error);
    return createErrorResponse("Internal server error", 500, "INTERNAL_ERROR");
  }
}
