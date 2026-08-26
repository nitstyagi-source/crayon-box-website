const DEFAULT_FALLBACKS: Record<string, string> = {
  DATABASE_URL: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  NEXT_PUBLIC_SUPABASE_URL: 'https://fesqtrunkqlmvyvqodzy.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzM4OTYsImV4cCI6MjEwMjY0OTg5Nn0.orDLjRNcUVXRNuGvJCDZHJdx8BDMvYC-6MvRKuDUm3o',
  MSG91_AUTH_KEY: '319435TL9QVRfp6n6a89bdeaP1',
  MSG91_WIDGET_ID: '3668766f6a71323234393034',
  NEXT_PUBLIC_MSG91_WIDGET_ID: '3668766f6a71323234393034',
  NEXT_PUBLIC_MSG91_TOKEN_AUTH: '319435TL9QVRfp6n6a89bdeaP1',
};

export function requireServerEnv(name: string): string {
  const value = process.env[name] || DEFAULT_FALLBACKS[name];

  if (!value) {
    throw new Error(`Missing required server configuration: ${name}`);
  }

  return value;
}
