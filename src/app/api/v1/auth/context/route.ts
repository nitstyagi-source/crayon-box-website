import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    const rawId = (identifier || '').trim();
    if (!rawId) {
      return NextResponse.json({ success: false, error: 'Identifier (phone or email) is required.' }, { status: 400 });
    }

    const cleanId = rawId.toLowerCase();
    const cleanPhone = rawId.replace(/\D/g, '').slice(-10);

    // 1. Live Query Staff
    const { data: staffList } = await supabase.from('staff').select('*');
    const staff = (staffList || []).find((s: any) => {
      const sPhone = (s.phone_number || s.personal_mobile || s.whatsapp_no || '').replace(/\D/g, '').slice(-10);
      const sEmail = (s.email || s.official_email || s.personal_email || '').toLowerCase();
      return (cleanPhone.length >= 10 && sPhone === cleanPhone) || (cleanId.includes('@') && sEmail === cleanId);
    });

    // 2. Live Query Parents
    const { data: parentList } = await supabase.from('parents').select('*');
    const parent = (parentList || []).find((p: any) => {
      const pPhone = (p.phone_number || '').replace(/\D/g, '').slice(-10);
      const pEmail = (p.email || '').toLowerCase();
      return (cleanPhone.length >= 10 && pPhone === cleanPhone) || (cleanId.includes('@') && pEmail === cleanId);
    });

    // 3. Live Query Linked Students (Children)
    const { data: studentList } = await supabase.from('students').select('*');
    const linkedChildren = (studentList || []).filter((st: any) => {
      const stPhone = (st.parent_phone || st.emergency_contact || '').replace(/\D/g, '').slice(-10);
      const stEmail = (st.parent_email || '').toLowerCase();
      const isLinkedByParentId = parent && st.parent_id === parent.id;
      const isLinkedByStaffParentIds = staff && Array.isArray(staff.is_parent_of_student_ids) && staff.is_parent_of_student_ids.includes(st.id);
      return (cleanPhone.length >= 10 && stPhone === cleanPhone) || (cleanId.includes('@') && stEmail === cleanId) || isLinkedByParentId || isLinkedByStaffParentIds;
    });

    // 4. Live Query Transport Driver
    const { data: busList } = await supabase.from('transport_buses').select('*');
    const driverBus = (busList || []).find((b: any) => {
      const dPhone = (b.driver_phone || '').replace(/\D/g, '').slice(-10);
      return cleanPhone.length >= 10 && dPhone === cleanPhone;
    });

    // If completely absent from database, strictly reject
    if (!staff && !parent && linkedChildren.length === 0 && !driverBus) {
      return NextResponse.json({
        success: false,
        notRegistered: true,
        error: 'User Not Registered. This mobile number or email is not associated with any active school account.'
      }, { status: 404 });
    }

    // Build Global Human Identity
    const primaryName = staff 
      ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
      : parent 
        ? `${parent.first_name || ''} ${parent.last_name || ''}`.trim()
        : linkedChildren[0]?.father_name || linkedChildren[0]?.mother_name || driverBus?.driver_name || 'User';

    const primaryEmail = staff?.official_email || staff?.email || parent?.email || (cleanId.includes('@') ? cleanId : `${cleanPhone}@crayonboxschool.com`);
    const primaryPhone = cleanPhone ? `+91 ${cleanPhone}` : staff?.phone_number || parent?.phone_number || '';

    // Build Personas
    const personas: any = {
      staff: null,
      family: null,
      driver: null,
      isSuperAdmin: false
    };

    const availableRoles: string[] = [];

    if (staff) {
      const roleStr = (staff.role || '').toUpperCase();
      const designationStr = (staff.designation || '').toUpperCase();
      const isSuper = roleStr.includes('SUPER_ADMIN') || roleStr.includes('CHAIRMAN');
      personas.isSuperAdmin = isSuper;

      const hasAdmin = isSuper || roleStr.includes('ADMIN') || roleStr.includes('OFFICER') || roleStr.includes('MANAGER') || roleStr.includes('EXECUTIVE') || roleStr.includes('CASHIER') || roleStr.includes('PRINCIPAL') || designationStr.includes('ADMIN') || designationStr.includes('PRINCIPAL');
      const hasTeaching = roleStr.includes('TEACHER') || roleStr.includes('FACULTY') || designationStr.includes('TEACHER');

      const staffAvailableRoles: ('Admin' | 'Faculty')[] = [];
      if (hasAdmin) staffAvailableRoles.push('Admin');
      if (hasTeaching && !staffAvailableRoles.includes('Faculty')) staffAvailableRoles.push('Faculty');
      if (staffAvailableRoles.length === 0) staffAvailableRoles.push('Faculty');

      staffAvailableRoles.forEach(r => {
        if (!availableRoles.includes(r)) availableRoles.push(r);
      });

      personas.staff = {
        hasAccess: true,
        staffId: staff.id,
        employeeCode: staff.employee_code || staff.employee_id || `EMP-${staff.id.substring(0, 4).toUpperCase()}`,
        designation: staff.designation || (hasAdmin ? 'School Administrator' : 'Teacher'),
        department: staff.department || 'Academics',
        availableRoles: staffAvailableRoles,
        classes: staff.class_teacher_for ? [staff.class_teacher_for] : [],
        campusId: staff.campus_id
      };
    }

    if (linkedChildren.length > 0 || parent) {
      if (!availableRoles.includes('Parent')) availableRoles.push('Parent');

      personas.family = {
        hasAccess: true,
        parentId: parent?.id || null,
        children: linkedChildren.map((child: any) => ({
          studentId: child.id,
          name: `${child.first_name || ''} ${child.last_name || ''}`.trim(),
          admissionNo: child.admission_no || child.enrollment_number || 'ADM',
          grade: child.admission_category || 'General',
          dob: child.dob || child.date_of_birth || null,
          busRoute: child.transport_route || child.transport_bus_no || (child.transport_mode === 'Self' ? 'Self Commute' : null),
          busStop: child.transport_stop || child.transport_pickup_point || null,
          fatherName: child.father_name || null,
          motherName: child.mother_name || null,
          emergencyContact: child.emergency_contact || child.parent_phone || null,
          photoUrl: child.photo_url || null
        }))
      };
    }

    if (driverBus) {
      if (!availableRoles.includes('Driver')) availableRoles.push('Driver');
      personas.driver = {
        hasAccess: true,
        busId: driverBus.id,
        busNumber: driverBus.bus_number,
        routeName: driverBus.route_name
      };
    }

    // Determine initial active role and active child
    const defaultRole = personas.isSuperAdmin 
      ? 'Admin' 
      : personas.staff 
        ? personas.staff.availableRoles[0] 
        : personas.family 
          ? 'Parent' 
          : 'Driver';

    const defaultChildId = personas.family?.children[0]?.studentId || null;

    return NextResponse.json({
      success: true,
      identity: {
        userId: staff?.id || parent?.id || driverBus?.id,
        name: primaryName,
        email: primaryEmail,
        phone: primaryPhone,
        initials: primaryName.split(' ').filter(Boolean).map((p: string) => p[0]).join('').substring(0, 2).toUpperCase()
      },
      personas,
      availableRoles,
      activeContext: {
        activeRole: defaultRole,
        activeChildId: defaultChildId
      }
    });

  } catch (error: any) {
    console.error('User Context Resolution Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
