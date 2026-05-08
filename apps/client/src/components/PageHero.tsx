import type { ReactNode } from 'react';

export function PageHero({
  kicker,
  title,
  desc,
  children,
}: {
  kicker: string;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <section className="lc-page-hero lc-container">
      <div>
        <p className="lc-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {children ? <div className="lc-page-hero-extra">{children}</div> : null}
    </section>
  );
}
