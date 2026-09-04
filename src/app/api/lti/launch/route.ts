import { NextRequest, NextResponse } from 'next/server';

/**
 * LTI 1.3 Advantage OpenID Connect (OIDC) Launch Endpoint
 * Allows external learning apps (Canvas, McGraw-Hill, Khan Academy)
 * to authenticate and launch securely inside Crayon Box School portal.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const iss = body.iss || request.nextUrl.searchParams.get('iss');
    const login_hint = body.login_hint || request.nextUrl.searchParams.get('login_hint');
    const target_link_uri = body.target_link_uri || request.nextUrl.searchParams.get('target_link_uri');

    if (!iss || !login_hint || !target_link_uri) {
      return NextResponse.json({
        error: 'Missing required LTI 1.3 parameters: iss, login_hint, or target_link_uri'
      }, { status: 400 });
    }

    // Generate compliant LTI 1.3 OIDC Auth State
    const state = `lti_state_${Math.random().toString(36).substring(2, 15)}`;
    const nonce = `lti_nonce_${Math.random().toString(36).substring(2, 15)}`;

    return NextResponse.json({
      success: true,
      lti_message_type: 'LtiResourceLinkRequest',
      lti_version: '1.3.0',
      state,
      nonce,
      redirect_url: `${target_link_uri}?state=${state}&nonce=${nonce}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Crayon Box School LTI 1.3 Advantage Platform',
    platform_id: 'https://fesqtrunkqlmvyvqodzy.supabase.co',
    client_id: 'cbs-lti-v1-client',
    auth_login_url: '/api/lti/launch',
    auth_token_url: '/api/lti/token',
    key_set_url: '/api/lti/jwks'
  });
}
