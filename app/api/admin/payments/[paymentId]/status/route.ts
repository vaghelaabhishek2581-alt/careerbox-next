import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/unified-auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import Payment from "@/src/models/Payment";

// Validation schema
const statusUpdateSchema = z.object({
  status: z.enum(["paid", "failed", "cancelled"]),
  notes: z.string().optional(),
  adminReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);
    const { status, notes, adminReason } = validatedData;

    await connectToDatabase();

    // Await params before using
    const { paymentId } = await params;

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if status change is valid
    const currentStatus = payment.status;

    // Prevent certain status changes
    if (currentStatus === "refunded") {
      return NextResponse.json(
        { error: "Cannot change status of refunded payment" },
        { status: 400 }
      );
    }

    if (currentStatus === "paid" && status === "paid") {
      return NextResponse.json(
        { error: "Payment is already marked as paid" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add admin notes if provided
    if (notes || adminReason) {
      updateData.adminNotes = {
        notes: notes || "",
        reason: adminReason || "",
        updatedBy: user.email,
        updatedAt: new Date(),
      };
    }

    // Set paidAt timestamp if marking as paid
    if (status === "paid" && currentStatus !== "paid") {
      updateData.paidAt = new Date();
    }

    // Set failure reason if marking as failed
    if (status === "failed") {
      updateData.failureReason = adminReason || "Marked as failed by admin";
    }

    // Update payment record
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: updateData },
      { new: true }
    );

    // Populate user information for response
    await updatedPayment.populate("userId", "email");

    // Transform for response
    const responsePayment = {
      id: updatedPayment._id.toString(),
      userId: updatedPayment.userId._id.toString(),
      userEmail: updatedPayment.userId.email,
      userName: updatedPayment.userName || "",
      organizationName: updatedPayment.organizationName,
      organizationType: updatedPayment.organizationType,
      orderId: updatedPayment.orderId,
      paymentId: updatedPayment.paymentId,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      status: updatedPayment.status,
      paymentMethod: updatedPayment.paymentMethod,
      planType: updatedPayment.planType,
      planDuration: updatedPayment.planDuration,
      subscriptionId: updatedPayment.subscriptionId?.toString(),
      razorpayOrderId: updatedPayment.razorpayOrderId,
      razorpayPaymentId: updatedPayment.razorpayPaymentId,
      failureReason: updatedPayment.failureReason,
      refundId: updatedPayment.refundId,
      refundAmount: updatedPayment.refundAmount,
      refundReason: updatedPayment.refundReason,
      createdAt: updatedPayment.createdAt,
      updatedAt: updatedPayment.updatedAt,
      paidAt: updatedPayment.paidAt,
      adminNotes: updatedPayment.adminNotes,
    };

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: responsePayment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
