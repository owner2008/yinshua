import { NavLink } from 'react-router-dom';
import { brand, navItems, productCategories } from '../brandContent';

export function BrandHeader() {
  return (
    <header className="lc-header">
      <NavLink to="/" className="lc-logo" aria-label={`${brand.companyName}首页`}>
        <span>LC</span>
        <div>
          <strong>{brand.shortName}</strong>
          <small>Qingdao Label Printing</small>
        </div>
      </NavLink>
      <nav className="lc-nav" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.href} end={item.href === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="lc-header-actions" aria-label="用户快捷入口">
        <NavLink className="lc-header-link" to="/history">
          报价历史
        </NavLink>
        <NavLink className="lc-header-link" to="/member">
          会员中心
        </NavLink>
        <NavLink className="lc-button primary lc-header-cta" to="/quote">
          立即报价
        </NavLink>
      </div>
    </header>
  );
}

export function BrandFooter() {
  return (
    <footer id="contact" className="lc-footer">
      <div className="lc-footer-brand">
        <h2>{brand.companyName}</h2>
        <p>主营：标签印刷 / 卷标不干胶 / 产品说明书 / 包装印刷 / 防伪与一物一码标签</p>
      </div>
      <div className="lc-footer-links">
        <h3>产品分类</h3>
        <div>
          {productCategories.slice(0, 8).map((item) => (
            <NavLink key={item.name} to="/products">
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="lc-footer-contact">
        <span>电话：{brand.phone}</span>
        <span>地址：{brand.address}</span>
        <span>备案信息：{brand.recordNo}</span>
      </div>
      <div className="lc-footer-qr" aria-label="微信二维码占位">
        微信咨询
      </div>
    </footer>
  );
}
