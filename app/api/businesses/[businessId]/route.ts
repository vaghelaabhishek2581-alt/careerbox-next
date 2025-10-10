import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/unified-auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import { IBusiness, UpdateBusinessRequest } from "@/lib/types/business.types";
import { ApiResponse } from "@/lib/types/api.types";
import { Business } from "@/src/models";

// GET /api/businesses/[businessId] - Fetch business by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await context.params;
    await connectToDatabase();

    const businessDoc = await Business.findById(businessId).lean().exec();

    if (!businessDoc) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Type assertion for lean document
    const business = businessDoc as unknown as IBusiness;

    const response: ApiResponse<IBusiness> = {
      success: true,
      data: business,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

// PUT /api/businesses/[businessId] - Update business
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await context.params;
    const updateData: UpdateBusinessRequest = await req.json();
    await connectToDatabase();

    const business = await Business.findById(businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check if user can update this business
    const { userId, user } = authResult;
    if (
      !user?.roles?.includes("admin") &&
      business.userId.toString() !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedBusinessDoc = await Business.findByIdAndUpdate(
      businessId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedBusinessDoc) {
      return NextResponse.json(
        { error: "Failed to update business" },
        { status: 500 }
      );
    }

    // Type assertion for updated document
    const updatedBusiness = updatedBusinessDoc as unknown as IBusiness;

    const response: ApiResponse<IBusiness> = {
      success: true,
      data: updatedBusiness,
      message: "Business updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}
