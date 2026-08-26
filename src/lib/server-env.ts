/**
 * Reads a required server-only setting without providing an insecure fallback.
 * Keep all credentials in the deployment environment, never in source code.
 */
export function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server configuration: ${name}`);
  }

  return value;
}
