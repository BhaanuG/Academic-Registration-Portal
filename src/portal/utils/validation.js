export function isValidStudentId(studentId) {
  return /^\d{10}$/.test(studentId);
}

export function passwordsMatch(password, confirmation) {
  return password === confirmation;
}
