import { NextResponse } from 'next/server';
import { getFacultyAuthorizedMobileModulesAction } from '@/app/actions/rbac-actions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'FACULTY';
    const teacherId = searchParams.get('teacher_id') || 'FAC-1001';

    const result = await getFacultyAuthorizedMobileModulesAction(role);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      faculty: {
        id: teacherId,
        role: role,
        name: 'Dr. Ananya Sharma',
        designation: 'Senior Faculty & HOD Science',
        department: 'Physical Sciences'
      },
      authorized_modules: result.modules.map((m: any) => ({
        code: m.module_code,
        name: m.name,
        category: m.category,
        icon: m.mobile_icon || 'BookOpen',
        route: m.mobile_route || 'Dashboard',
        persona: m.mobile_persona || 'FACULTY',
        permissions: {
          can_view: m.can_view,
          can_create: m.can_create,
          can_edit: m.can_edit
        }
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
