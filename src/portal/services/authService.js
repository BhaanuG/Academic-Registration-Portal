const SESSION_KEY = "klef-authenticated-student";

export function getAuthenticatedStudent() {
  return sessionStorage.getItem(SESSION_KEY);
}

export function createSession(studentId) {
  sessionStorage.setItem(SESSION_KEY, studentId);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSavedPassword(studentId) {
  return localStorage.getItem(`klef-password-${studentId}`);
}

export function savePassword(studentId, password) {
  localStorage.setItem(`klef-password-${studentId}`, password);
}

export function rememberDateOfBirth(studentId, dateOfBirth) {
  localStorage.setItem(`klef-dob-${studentId}`, dateOfBirth);
}

export function getRememberedDateOfBirth(studentId) {
  return localStorage.getItem(`klef-dob-${studentId}`);
}

export async function requestPasswordReset(studentId) {
  return { studentId, pendingBackend: true };
}
