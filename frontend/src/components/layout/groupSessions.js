function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function groupSessions(sessions, searchTerm) {
  const query = searchTerm.trim().toLowerCase();
  const filtered = query
    ? sessions.filter((session) => session.title.toLowerCase().includes(query))
    : sessions;

  const today = startOfDay();
  const yesterday = today - 86400000;
  const week = today - 86400000 * 7;

  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 days': [],
    Older: [],
  };

  filtered.forEach((session) => {
    const at = session.createdAt || 0;
    if (at >= today) groups.Today.push(session);
    else if (at >= yesterday) groups.Yesterday.push(session);
    else if (at >= week) groups['Previous 7 days'].push(session);
    else groups.Older.push(session);
  });

  return groups;
}
