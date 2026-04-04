import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import type { Attachment } from '@/lib/validations/email-draft'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ATTACHMENTS = 5

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; draftId: string }> }
) {
  try {
    const { id: campaignId, draftId } = await params

    const draft = await prisma.emailDraft.findFirst({
      where: { id: draftId, campaignId },
    })

    if (!draft) {
      throw new ApiError(404, 'Draft not found', 'NOT_FOUND')
    }

    if (draft.status !== 'DRAFT') {
      throw new ApiError(400, `Cannot modify attachments for a draft with status ${draft.status}`, 'INVALID_STATUS')
    }

    const existingAttachments = (draft.attachments as Attachment[] | null) || []
    if (existingAttachments.length >= MAX_ATTACHMENTS) {
      throw new ApiError(400, `Maximum ${MAX_ATTACHMENTS} attachments allowed`, 'MAX_ATTACHMENTS')
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new ApiError(400, 'No file provided', 'NO_FILE')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, 'File size exceeds 10MB limit', 'FILE_TOO_LARGE')
    }

    // Save file to public/uploads/attachments/<draftId>/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'attachments', draftId)
    await mkdir(uploadDir, { recursive: true })

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = path.join(uploadDir, safeFilename)
    const relativePath = `/uploads/attachments/${draftId}/${safeFilename}`

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const attachment: Attachment = {
      filename: file.name,
      path: relativePath,
      size: file.size,
    }

    const updatedAttachments = [...existingAttachments, attachment]

    await prisma.emailDraft.update({
      where: { id: draftId },
      data: { attachments: updatedAttachments, editedByUser: true },
    })

    return NextResponse.json(attachment)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; draftId: string }> }
) {
  try {
    const { id: campaignId, draftId } = await params
    const { filename } = await request.json()

    if (!filename) {
      throw new ApiError(400, 'Filename is required', 'NO_FILENAME')
    }

    const draft = await prisma.emailDraft.findFirst({
      where: { id: draftId, campaignId },
    })

    if (!draft) {
      throw new ApiError(404, 'Draft not found', 'NOT_FOUND')
    }

    if (draft.status !== 'DRAFT') {
      throw new ApiError(400, `Cannot modify attachments for a draft with status ${draft.status}`, 'INVALID_STATUS')
    }

    const existingAttachments = (draft.attachments as Attachment[] | null) || []
    const attachment = existingAttachments.find(a => a.filename === filename)

    if (!attachment) {
      throw new ApiError(404, 'Attachment not found', 'ATTACHMENT_NOT_FOUND')
    }

    // Remove file from disk
    try {
      const filePath = path.join(process.cwd(), 'public', attachment.path)
      await unlink(filePath)
    } catch {
      // File may already be deleted
    }

    const updatedAttachments = existingAttachments.filter(a => a.filename !== filename)

    await prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        attachments: updatedAttachments.length > 0 ? updatedAttachments : Prisma.JsonNull,
        editedByUser: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
