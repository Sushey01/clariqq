export function homePathForRole(role) {
  if (role === 'teacher') return '/teacher';
  if (role === 'parent') return '/parent';
  return '/app';
}

export function userRole(user) {
  return user?.role || 'student';
}
