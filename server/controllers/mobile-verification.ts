import { Request, Response } from "express";
import { db } from "../db";
import { customers, mobileLinkRequests } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { z } from "zod";

// Strict 10-digit mobile validation starting with 6-9
const mobileSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.");

/**
 * Check if user's mobile is verified
 * Called on login/dashboard load
 */
export async function checkMobileVerificationStatus(req: Request, res: Response) {
    try {
        if (!req.session?.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const customerId = req.session.user.id;
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, customerId),
            columns: {
                id: true,
                name: true,
                mobile: true,
                mobileVerified: true,
            }
        });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({
            isVerified: customer.mobileVerified === true,
            currentMobile: customer.mobile,
            message: customer.mobileVerified === false
                ? "Your mobile number is not linked with your account. Please add your mobile number to continue."
                : null
        });

    } catch (error: any) {
        console.error("Check mobile verification status error:", error);
        res.status(500).json({ message: "Failed to check verification status", error: error.message });
    }
}

/**
 * User Flow: Add Mobile Number
 * Creates a verification request for the mobile number
 */
export async function addMobileNumber(req: Request, res: Response) {
    try {
        if (!req.session?.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const customerId = req.session.user.id;
        const { mobile } = req.body;

        // Validate mobile number
        mobileSchema.parse(mobile);

        // Get current customer data
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, customerId)
        });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Check if already verified
        if (customer.mobileVerified === true) {
            return res.status(400).json({
                message: "Your mobile number is already verified.",
                isVerified: true
            });
        }

        // Check if mobile is already used by another verified customer
        const existingVerified = await db.query.customers.findFirst({
            where: and(
                eq(customers.mobile, mobile),
                eq(customers.mobileVerified, true)
            )
        });

        if (existingVerified && existingVerified.id !== customerId) {
            return res.status(400).json({
                message: "This mobile number is already registered with another shop.",
                code: "MOBILE_ALREADY_EXISTS"
            });
        }

        // Check if this customer already has a pending request for this mobile
        const existingRequest = await db.query.mobileLinkRequests.findFirst({
            where: and(
                eq(mobileLinkRequests.customerId, customerId),
                eq(mobileLinkRequests.mobile, mobile),
                eq(mobileLinkRequests.status, 'pending')
            )
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending verification request for this mobile number.",
                requestId: existingRequest.id
            });
        }

        // Create verification request
        await db.insert(mobileLinkRequests).values({
            customerId,
            shopName: customer.name,
            mobile: mobile,
            status: 'pending'
        });

        res.json({
            success: true,
            message: "Mobile number request submitted successfully. Your request is pending admin verification.",
            mobile: mobile,
            status: "pending"
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid mobile number format",
                errors: error.errors
            });
        }
        console.error("Add mobile number error:", error);
        res.status(500).json({ message: "Failed to add mobile number", error: error.message });
    }
}

/**
 * Admin: Get all pending mobile verification requests
 */
export async function getPendingVerifications(req: Request, res: Response) {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }

        const pendingRequests = await db.execute(sql`
            SELECT 
                mlr.id,
                mlr.customer_id,
                mlr.shop_name,
                mlr.mobile,
                mlr.status,
                mlr.created_at
            FROM mobile_link_requests mlr
            WHERE mlr.status = 'pending'
            ORDER BY mlr.created_at ASC
        `);

        res.json({
            requests: pendingRequests.rows.map(row => ({
                requestId: row.id,
                customerId: row.customer_id,
                shopName: row.shop_name,
                mobile: row.mobile,
                status: row.status,
                requestDate: row.created_at
            }))
        });

    } catch (error: any) {
        console.error("Get pending verifications error:", error);
        res.status(500).json({ message: "Failed to fetch pending verifications", error: error.message });
    }
}

/**
 * Admin: Verify and Link Mobile Number
 */
export async function verifyMobileNumber(req: Request, res: Response) {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }

        const adminId = req.session.user.id;
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required" });
        }

        // Get the verification request
        const request = await db.query.mobileLinkRequests.findFirst({
            where: eq(mobileLinkRequests.id, requestId)
        });

        if (!request) {
            return res.status(404).json({ message: "Verification request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                message: `This request has already been ${request.status}`,
                currentStatus: request.status
            });
        }

        const customerId = request.customerId;
        const mobileToVerify = request.mobile;

        // Perform atomic transaction
        await db.transaction(async (tx) => {
            // Update customer: set mobile and mark as verified
            await tx.update(customers)
                .set({
                    mobile: mobileToVerify,
                    mobileVerified: true,
                })
                .where(eq(customers.id, customerId));

            // Update verification request
            await tx.update(mobileLinkRequests)
                .set({
                    status: 'approved',
                    approvedBy: adminId,
                    approvedAt: new Date(),
                })
                .where(eq(mobileLinkRequests.id, requestId));
        });

        res.json({
            success: true,
            message: `Mobile number ${mobileToVerify} has been verified and linked.`,
            customerId,
            mobile: mobileToVerify
        });

    } catch (error: any) {
        console.error("Verify mobile number error:", error);
        res.status(500).json({ message: "Failed to verify mobile number", error: error.message });
    }
}

/**
 * Admin: Reject Mobile Verification Request
 */
export async function rejectMobileVerification(req: Request, res: Response) {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }

        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required" });
        }

        // Get the verification request
        const request = await db.query.mobileLinkRequests.findFirst({
            where: eq(mobileLinkRequests.id, requestId)
        });

        if (!request) {
            return res.status(404).json({ message: "Verification request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                message: `This request has already been ${request.status}`,
                currentStatus: request.status
            });
        }

        // Update verification request
        await db.update(mobileLinkRequests)
            .set({
                status: 'rejected',
            })
            .where(eq(mobileLinkRequests.id, requestId));

        res.json({
            success: true,
            message: `Mobile verification request has been rejected`,
            requestId: requestId
        });

    } catch (error: any) {
        console.error("Reject mobile verification error:", error);
        res.status(500).json({ message: "Failed to reject verification", error: error.message });
    }
}
