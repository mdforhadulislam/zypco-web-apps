import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Permission, IPermission } from "@/server/models/Permission.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch all permissions for a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const permissions = await Permission.find({ user: user._id, isActive: true }).sort({ grantedAt: -1 });
    return successResponse({ status: 200, message: "Permissions fetched", data: permissions, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch permissions";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// POST - grant new permissions to a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<IPermission> = await req.json();
    if (!body.permissions || !body.grantedBy) {
      return errorResponse({ status: 400, message: "permissions and grantedBy are required", req });
    }

    const newPermission = new Permission({
      user: user._id,
      permissions: body.permissions,
      description: body.description || "",
      grantedBy: body.grantedBy,
      isActive: true,
    });

    await newPermission.save();

    // Send notification to user
    await notificationService.sendNotification(
      { userId:user._id, phone: user.phone, email: user.email ,
        title: "New Permissions Granted",
        message: `You have been granted new permissions: ${body.permissions.join(", ")}`,
        type: "success",
        category: "account",
        channels: ["email", "inapp"],
        data: { permissionId: newPermission._id, permissions: newPermission.permissions },
      }
    ).catch(err => console.error("Permission notification failed:", err));

    return successResponse({ status: 201, message: "Permission granted", data: newPermission, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create permission";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update an existing permission
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string, id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<IPermission> = await req.json();

    const updatedPermission = await Permission.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );

    if (!updatedPermission) return errorResponse({ status: 404, message: "Permission not found", req });

    // Send notification to user
    await notificationService.sendNotification(
      {userId:user._id, phone: user.phone, email: user.email ,
        title: "Permissions Updated",
        message: `Your permissions have been updated: ${updatedPermission.permissions.join(", ")}`,
        type: "info",
        category: "account",
        channels: ["email", "inapp"],
        data: { permissionId: updatedPermission._id, permissions: updatedPermission.permissions },
      }
    ).catch(err => console.error("Permission update notification failed:", err));

    return successResponse({ status: 200, message: "Permission updated", data: updatedPermission, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update permission";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - revoke a permission
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string, id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const revokedPermission = await Permission.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: { isActive: false, revokedAt: new Date() } },
      { new: true }
    );

    if (!revokedPermission) return errorResponse({ status: 404, message: "Permission not found", req });

    // Send notification to user
    await notificationService.sendNotification(
      { userId:user._id, phone: user.phone, email: user.email ,
        title: "Permissions Revoked",
        message: `The following permissions have been revoked: ${revokedPermission.permissions.join(", ")}`,
        type: "warning",
        category: "account",
        channels: ["email", "inapp"],
        data: { permissionId: revokedPermission._id, permissions: revokedPermission.permissions },
      }
    ).catch(err => console.error("Permission revoke notification failed:", err));

    return successResponse({ status: 200, message: "Permission revoked", data: revokedPermission, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to revoke permission";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
