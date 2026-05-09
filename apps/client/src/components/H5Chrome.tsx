import { Link, NavLink } from 'react-router-dom';

export function H5PageChrome({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="lc-h5-page-chrome" aria-label={title}>
      <div className="lc-h5-page-bar">
        <Link to="/" className="lc-h5-page-brand" aria-label="东方丽彩印刷首页">
          <span>LC</span>
          <strong>东方丽彩印刷</strong>
        </Link>
        <button className="lc-h5-page-menu" type="button" aria-label="打开菜单">
          <span />
          <span />
          <span />
        </button>
      </div>
      <section className="lc-h5-page-title">
        <p>Qingdao Label Printing</p>
        <h1>{title}</h1>
        {subtitle ? <span>{subtitle}</span> : null}
      </section>
    </div>
  );
}

export function H5TabBar() {
  return (
    <nav className="lc-h5-tabbar" aria-label="H5 底部导航">
      <NavLink to="/" end>
        首页
      </NavLink>
      <NavLink to="/products">产品</NavLink>
      <NavLink to="/quote">报价</NavLink>
      <NavLink to="/history">历史</NavLink>
      <NavLink to="/member">我的</NavLink>
    </nav>
  );
}
