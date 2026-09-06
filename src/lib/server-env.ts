const DEFAULT_FALLBACKS: Record<string, string> = {
  DATABASE_URL: '',
  NEXT_PUBLIC_SUPABASE_URL: '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
  MSG91_AUTH_KEY: '',
  MSG91_WIDGET_ID: '',
  NEXT_PUBLIC_MSG91_WIDGET_ID: '',
  NEXT_PUBLIC_MSG91_TOKEN_AUTH: '',
};

export function requireServerEnv(name: string): string {
  const value = process.env[name] || DEFAULT_FALLBACKS[name];

  if (!value) {
    throw new Error(`Missing required server configuration: ${name}`);
  }

  return value;
}
