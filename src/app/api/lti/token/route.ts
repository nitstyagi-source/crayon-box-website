import { NextRequest, NextResponse } from 'next/server';

/**
 * LTI 1.3 OAuth 2.0 Token Endpoint
 * Handles client_credentials grant for LTI Assignment and Grade Services (AGS)
 * and Names and Role Provisioning Services (NRPS).
 */
export async function POST(request: NextRequest) {
  try {
    let grantType = '';
    let clientAssertion = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        grantType = String(formData.get('grant_type') || '');
        clientAssertion = String(formData.get('client_assertion') || '');
      }
    } else {
      const body = await request.json().catch(() => ({}));
      grantType = body.grant_type || '';
      clientAssertion = body.client_assertion || '';
    }

    if (!grantType) {
      grantType = request.nextUrl.searchParams.get('grant_type') || 'client_credentials';
    }

    const token = `cbs_lti_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    return NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/lti/token',
    grant_types_supported: ['client_credentials'],
    token_endpoint_auth_methods_supported: ['private_key_jwt', 'client_secret_post']
  });
}
