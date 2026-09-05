import { NextRequest, NextResponse } from 'next/server';
import { askVaniOrchestratorAction } from '@/app/actions/vani-orchestrator-actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query = '',
      userRole = 'Parent',
      userName = 'User',
      activeChildId,
      activeClass
    } = body;

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
    }

    const result = await askVaniOrchestratorAction({
      sessionId: `mobile-${Date.now()}`,
      userQuery: query,
      userRole,
      userName,
      activeChildId,
      activeClass,
      isSuperAdmin: userRole === 'Super Admin' || userRole === 'Admin'
    });

    // Formulate clean action format for mobile app
    let action = null;
    if (result.actionProposal) {
      action = {
        title: result.actionProposal.title,
        route: result.actionProposal.actionType === 'VIEW_QUESTION_PAPER' ? 'QuestionBank' :
               result.actionProposal.actionType === 'PUBLISH_LESSON_PLAN' ? 'LessonPlanner' :
               result.actionProposal.actionType === 'NAVIGATE_DASHBOARD' ? 'Governance' : 'DigitalDiary',
        payload: result.actionProposal.payload
      };
    } else if (result.structuredData?.action) {
      action = result.structuredData.action;
    }

    return NextResponse.json({
      success: result.success,
      role: result.role || userRole,
      guarded: result.toolUsed === 'parent_security_guardrail',
      toolUsed: result.toolUsed,
      response: result.responseMarkdown,
      action,
      modelUsed: result.modelUsed,
      structuredData: result.structuredData
    });

  } catch (error: any) {
    console.error('Error in /api/mobile/vani/chat route:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      response: `⚠️ VANI encountered an error: ${error.message}`
    }, { status: 500 });
  }
}
