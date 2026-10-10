import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/supabase/adminAuth';
import { updateWaitlistEntry, deleteWaitlistEntry } from '@/lib/supabase/server';
import { WaitlistStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// PATCH: Update submission status and/or notes
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
        { success: false, error: 'Submission ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { status, notes } = body;

    const validStatuses: WaitlistStatus[] = ['pending', 'approved', 'contacted', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value.' },
        { status: 422 }
      );
    }

    const updated = await updateWaitlistEntry(id, {
      ...(status ? { status } : {}),
      ...(typeof notes !== 'undefined' ? { notes } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Submission not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('[Admin Submission Update Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submission.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a submission
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
        { success: false, error: 'Submission ID is required.' },
        { status: 400 }
      );
    }

    const deleted = await deleteWaitlistEntry(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Submission not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully.',
    });
  } catch (error) {
    console.error('[Admin Submission Delete Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission.' },
      { status: 500 }
    );
  }
}
