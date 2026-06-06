export default function EmptyState({ message }) {
  return (
    <div className="empty-state" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>📭</div>
      <p>{message}</p>
    </div>
  );
}
