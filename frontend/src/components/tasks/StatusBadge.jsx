const STATUS_MAP = {
  TODO: { label: 'To Do', cls: 'status-todo' },
  IN_PROGRESS: { label: 'In Progress', cls: 'status-in-progress' },
  DONE: { label: 'Done', cls: 'status-done' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.TODO;
  return <span className={s.cls}>{s.label}</span>;
}
