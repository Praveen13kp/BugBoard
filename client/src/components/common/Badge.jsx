import { PRIORITY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from '../../utils/format';

const LABEL_MAP = {
  status: STATUS_LABELS,
  severity: SEVERITY_LABELS,
  priority: PRIORITY_LABELS,
};

function slug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

export default function Badge({ kind, value }) {
  const label = LABEL_MAP[kind]?.[value] || value || '—';
  return (
    <span className={['badge', `badge--${kind}`, `badge--${slug(value)}`].join(' ')}>{label}</span>
  );
}