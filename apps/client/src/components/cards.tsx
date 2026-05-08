import type { CSSProperties, ReactNode } from 'react';

export function SectionHeading({
  kicker,
  title,
  desc,
  action,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="lc-section-heading">
      <div>
        {kicker ? <p className="lc-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {desc ? <p>{desc}</p> : null}
      </div>
      {action ? <div className="lc-section-action">{action}</div> : null}
    </div>
  );
}

export function FeatureCard({ mark, title, desc, color }: { mark: string; title: string; desc: string; color: string }) {
  return (
    <article className="lc-feature-card">
      <span className="lc-icon-badge" style={{ '--badge-color': color } as CSSProperties}>
        {mark}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </article>
  );
}

export function InfoChip({ children }: { children: ReactNode }) {
  return <span className="lc-chip">{children}</span>;
}

export function ProcessStep({ index, title }: { index: number; title: string }) {
  return (
    <article className="lc-process-step">
      <span>{index}</span>
      <strong>{title}</strong>
    </article>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="lc-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
