import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

const UpdateLeadStatusSchema = z.object({
  status: z.enum(["PENDING", "REMOVED"]),
});

type Params = {
  params: Promise<{
    id: string; // campaignId
    leadId: string; // campaignLeadId
  }>;
};

/**
 * PATCH /api/campaigns/[id]/leads/[leadId]
 * Update individual campaign lead status (include/exclude)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id, leadId } = await params;
    const body = await request.json();

    const result = UpdateLeadStatusSchema.safeParse(body);
    if (!result.success) {
      return ApiError.badRequest(result.error.issues[0].message);
    }

    // Verify campaign lead exists and belongs to campaign
    const campaignLead = await prisma.campaignLead.findFirst({
      where: {
        id: leadId,
        campaignId: id,
      },
    });

    if (!campaignLead) {
      throw new ApiError(404, "Campaign lead not found", "LEAD_NOT_FOUND");
    }

    // Update status
    const updated = await prisma.campaignLead.update({
      where: { id: leadId },
      data: { status: result.data.status },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organization: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
