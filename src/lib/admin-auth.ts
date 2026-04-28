import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "dejitaru_admin_session";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    `${normalize(email)}::${password}`;

  return { email, password, sessionSecret };
}

export function isAdminConfigured() {
  const { email, password } = getAdminCredentials();
  return email.length > 0 && password.length > 0;
}

export function createAdminSessionToken() {
  const { email, password, sessionSecret } = getAdminCredentials();

  if (!email || !password) {
    return null;
  }

  return `${normalize(email)}::${password}::${sessionSecret}`;
}

export function verifyAdminCredentials(email: string, password: string) {
  const expected = getAdminCredentials();

  if (!expected.email || !expected.password) {
    return false;
  }

  return normalize(email) === normalize(expected.email) && password === expected.password;
}

export function isValidAdminSessionToken(token: string | null | undefined) {
  const expected = createAdminSessionToken();

  if (!expected || !token) {
    return false;
  }

  return token === expected;
}

export async function isAdminAuthenticatedOnServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}

export async function requireAdminAuth() {
  const isAuthed = await isAdminAuthenticatedOnServer();

  if (!isAuthed) {
    redirect("/admin/login");
  }
}
