import { Link } from 'react-router-dom';
import {
  brand,
  companyProfile,
  officialEquipmentShowcase,
  officialProductShowcase,
  qrCodeImage,
} from '../brandContent';
import { InfoChip, SectionHeading } from '../components/cards';
import { PageHero } from '../components/PageHero';

export function ContactPage() {
  return (
    <div className="lc-subpage">
      <PageHero
        kicker="Contact Us"
        title="联系我们"
        desc="欢迎通过电话、手机或到厂方式咨询标签印刷、卷标不干胶、产品说明书、包装与宣传册等定制印刷需求。"
      >
        <Link className="lc-button primary" to="/quote">
          提交报价需求
        </Link>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container lc-contact-layout">
          <article className="lc-card lc-contact-intro">
            <p className="lc-kicker">Company Profile</p>
            <h2>{brand.companyName}</h2>
            <p>{companyProfile.desc}</p>
            <div className="lc-chip-cloud">
              {companyProfile.services.map((item) => (
                <InfoChip key={item}>{item}</InfoChip>
              ))}
            </div>
          </article>

          <aside className="lc-card lc-contact-card">
            <p className="lc-kicker">Contact</p>
            <h2>业务咨询</h2>
            <dl>
              <div>
                <dt>座机</dt>
                <dd>{brand.phone}</dd>
              </div>
              <div>
                <dt>手机</dt>
                <dd>{brand.mobile}</dd>
              </div>
              <div>
                <dt>联系人</dt>
                <dd>{brand.contactPerson}</dd>
              </div>
              <div>
                <dt>地址</dt>
                <dd>{brand.address}</dd>
              </div>
            </dl>
            <img src={qrCodeImage} alt="东方丽彩包装微信二维码" loading="lazy" referrerPolicy="no-referrer" />
          </aside>
        </div>
      </section>

      <section className="lc-section lc-section-soft">
        <div className="lc-container">
          <SectionHeading
            kicker="Products"
            title="原站产品展示"
            desc="以下图片整理自公司原官网公开展示内容，用于补充真实产品与印刷品类展示。"
          />
          <div className="lc-official-gallery">
            {officialProductShowcase.map((item) => (
              <article className="lc-card" key={item.title}>
                <img src={item.imageUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" />
                <strong>{item.title}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section">
        <div className="lc-container">
          <SectionHeading
            kicker="Equipment"
            title="设备展示"
            desc="公司原站展示了标签印刷机、不干胶卷标印刷机、全自动标签模切机等设备图片。"
          />
          <div className="lc-official-gallery equipment">
            {officialEquipmentShowcase.map((item) => (
              <article className="lc-card" key={`${item.title}-${item.imageUrl}`}>
                <img src={item.imageUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" />
                <strong>{item.title}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
