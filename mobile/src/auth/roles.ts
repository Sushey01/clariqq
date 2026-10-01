export function pathForRole(role: string) {
  if (role === 'teacher') return '/teacher' as const;
  if (role === 'parent') return '/parent' as const;
  return '/student/chat' as const;
}
