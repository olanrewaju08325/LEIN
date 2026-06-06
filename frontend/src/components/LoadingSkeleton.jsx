export default function LoadingSkeleton() {
  return (
    <div className="skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="skeleton-line" style={{ height: '20px', width: '80%', background: '#E8EDF9', borderRadius: '4px' }} />
      <div className="skeleton-line" style={{ height: '20px', width: '60%', background: '#E8EDF9', borderRadius: '4px' }} />
      <div className="skeleton-line" style={{ height: '20px', width: '90%', background: '#E8EDF9', borderRadius: '4px' }} />
    </div>
  );
}
