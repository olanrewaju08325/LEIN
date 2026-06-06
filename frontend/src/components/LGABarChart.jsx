import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LGABarChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--ai-blue)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--ai-blue)" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorIncRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--alert-red)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--alert-red)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="lga" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{ background: '#000', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: '#fff' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.count > 15 ? "url(#colorIncRed)" : "url(#colorInc)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
