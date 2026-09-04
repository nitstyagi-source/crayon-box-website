import { NextRequest, NextResponse } from 'next/server';
import { askVaniOrchestratorAction } from '@/app/actions/vani-orchestrator-actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query,
      userRole = 'Parent',
      userName = 'Parent User',
      userId = 'USER-101',
      activeChildId = 'STU-1001',
      sessionId = `sess_${Date.now()}`
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.toLowerCase().trim();

    // =========================================================================
    // LAYER 1: STRICT PERSONA SECURITY GUARDRAIL (PARENT / STUDENT)
    // =========================================================================
    if (userRole === 'Parent' || userRole === 'Student') {
      const prohibitedTerms = [
        'report card', 'marksheet', 'marks', 'exam score', 'grade', 'result',
        'rank', 'topper', 'class rank', 'peer', 'other student', 'other child',
        'salary', 'payroll', 'faculty leave', 'staff attendance', 'teacher salary',
        'collection', 'revenue', 'profit', 'balance sheet', 'ledger', 'financial statement',
        'audit', 'cctv recording', 'security camera', 'confidential', 'management note'
      ];

      const hasProhibitedTerm = prohibitedTerms.some(term => cleanQuery.includes(term));

      if (hasProhibitedTerm) {
        return NextResponse.json({
          success: true,
          role: userRole,
          guarded: true,
          response: `🔒 **Institutional Privacy & Data Governance Active**\n\nAs your family's AI Assistant, I operate within strict institutional boundaries mandated by school policy:\n\n• **Official Report Cards & Exam Marks** are published strictly through the verified **Term Report Cards** screen under the Academics tab after principal sign-off and moderation.\n• **Internal School Operations, Staff Records & Financial Audits** are strictly confidential and inaccessible.\n\nI can gladly assist you with your child's daily homework, live bus GPS radar, fee payment receipts, and school event circulars.`,
          action: {
            title: "Open Term Report Cards",
            route: "ReportCard"
          }
        });
      }
    }

    // =========================================================================
    // LAYER 2: DELEGATE TO CENTRAL ORCHESTRATOR
    // =========================================================================
    const orchestratorResult = await askVaniOrchestratorAction({
      sessionId,
      userQuery: query,
      userRole,
      userName,
      userId,
      activeChildId,
      isSuperAdmin: userRole === 'Admin' || userRole === 'Super Admin'
    });

    return NextResponse.json({
      success: true,
      role: userRole,
      guarded: false,
      response: orchestratorResult.responseMarkdown,
      action: orchestratorResult.actionProposal,
      structuredData: orchestratorResult.structuredData
    });

  } catch (error: any) {
    console.error('Error in /api/mobile/vani/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
