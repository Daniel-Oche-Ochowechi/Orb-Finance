import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/supabase/adminAuth';
import { updateContactInquiry, deleteContactInquiry } from '@/lib/supabase/server';
import { ContactStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// PATCH: Update contact inquiry status and/or admin notes
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isAuthenticatedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { status, notes } = body;

    const validStatuses: ContactStatus[] = ['new', 'in_progress', 'responded', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value.' },
        { status: 422 }
      );
    }

    const updated = await updateContactInquiry(id, {
      ...(status ? { status } : {}),
      ...(typeof notes !== 'undefined' ? { notes } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Contact inquiry not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('[Admin Contact Update Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact inquiry.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a contact inquiry
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isAuthenticatedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required.' },
        { status: 400 }
      );
    }

    const deleted = await deleteContactInquiry(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully.',
    });
  } catch (error) {
    console.error('[Admin Contact Delete Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact inquiry.' },
      { status: 500 }
    );
  }
}
