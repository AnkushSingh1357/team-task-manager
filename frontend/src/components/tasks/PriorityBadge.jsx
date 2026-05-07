const PRIORITY_MAP = {
  LOW: { label: 'Low', cls: 'priority-low' },
  MEDIUM: { label: 'Medium', cls: 'priority-medium' },
  HIGH: { label: 'High', cls: 'priority-high' },
};

export default function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority] || PRIORITY_MAP.MEDIUM;
  return <span className={p.cls}>{p.label}</span>;
}
