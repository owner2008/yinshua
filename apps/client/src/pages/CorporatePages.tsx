import { Link } from 'react-router-dom';
import { toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
import type { Product } from '../types';

const applications = [
  ['食品饮料', '适用于瓶贴、封口贴、营养标签、促销标签等包装识别场景。'],
  ['日化美妆', '支持透明膜、烫金、局部 UV、哑膜等高质感表面处理。'],
  ['医药保健', '重视信息清晰、防潮耐磨、批次追溯与稳定交付。'],
  ['电子电器', '覆盖铭牌、警示标、序列号、耐候标签与防伪标签。'],
  ['仓储物流', '提供条码、可变数据、热敏物流标签与周转识别方案。'],
  ['商超零售', '适用于价签、促销贴、陈列标识和一物一码营销标签。'],
];

const advantages = [
  ['设备先进', '持续引进高效印刷、数码打样、模切和检测设备，稳定承接多品类订单。'],
  ['工艺丰富', '覆膜、烫金、UV、击凸、模切、防伪与可变数据组合，覆盖常见包装需求。'],
  ['品质严格', '从来料、制版、印刷、后道到出库设立质检节点，降低色差与交付风险。'],
  ['交付准时', '以订单排产、物料准备和过程跟踪保障交期，适配打样、小批量与批量生产。'],
  ['服务专业', '工作人员从需求拆解到文件检查、工艺建议、生产跟进提供全流程协作。'],
  ['定制方案', '围绕产品形态、贴标设备、使用环境、包装方式提供定制化组合方案。'],
];

const factoryItems = ['印刷设备', '数码设备', '制版车间', '检测设备', '品控生产线', '成品仓储'];
const productFallbackImages = [
  '/images/product-label-roll.jpg',
  '/images/product-food-label-roll.jpg',
  '/images/product-packaging-box.jpg',
  '/images/product-handbag.jpg',
  '/images/product-manual.jpg',
  '/images/product-brochure.jpg',
  '/images/product-tape.jpg',
  '/images/product-inner-liner.jpg',
];
const applicationImages = [
  '/images/case-food-packaging.jpg',
  '/images/case-cosmetic-packaging.jpg',
  '/images/product-label-roll.jpg',
  '/images/case-equipment-catalog.jpg',
  '/images/product-food-label-roll.jpg',
  '/images/product-packaging-box.jpg',
];
const factoryImages = [
  '/images/equipment-label-press.jpg',
  '/images/equipment-offset-press.jpg',
  '/images/factory-printing-line.jpg',
  '/images/equipment-finishing-line.jpg',
  '/images/factory-workshop.jpg',
  '/images/equipment-digital-workshop.jpg',
];
const jobs = [
  ['印刷机长', '负责印刷设备操作、色彩控制与生产过程质量稳定。'],
  ['工艺工程师', '负责材料、后道工艺、打样验证与工艺文件沉淀。'],
  ['业务跟单', '负责客户需求整理、订单进度跟进与交付沟通。'],
  ['质检专员', '负责来料、过程、成品检验和异常反馈闭环。'],
];

export function AboutPage() {
  return (
    <main className="subpage">
      <SubpageHero title="关于我们" subtitle="专注标签与包装印刷服务，用稳定品质连接品牌与产品。" image="/images/hero-factory-building.jpg" />
      <section className="subpage-section about-detail-layout">
        <img src="/images/factory-printing-line.jpg" alt="青岛东方丽彩包装有限公司厂区" />
        <div>
          <h2>青岛东方丽彩包装有限公司</h2>
          <p>
            公司专注于标签、包装盒、说明书、宣传册、可变二维码和一物一码标签等印刷产品，
            服务食品、日化、医药、电子、物流、零售等多行业客户。
          </p>
          <p>
            我们以设备能力、工艺经验、品质管理和服务响应为基础，为客户提供从材料选择、文件检查、
            打样确认到批量生产交付的一站式协作。
          </p>
          <div className="subpage-metrics">
            <strong>10+<span>年行业经验</span></strong>
            <strong>100+<span>台先进设备</span></strong>
            <strong>5000+<span>家服务客户</span></strong>
            <strong>1000+<span>种材质工艺</span></strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ApplicationsPage() {
  return (
    <main className="subpage">
      <SubpageHero title="行业应用" subtitle="面向多行业提供标签、包装与可变数据印刷解决方案。" image="/images/case-food-packaging.jpg" />
      <section className="subpage-section">
        <div className="subpage-card-grid three">
          {applications.map(([title, desc], index) => (
            <article key={title} className="subpage-info-card">
              <img src={applicationImages[index % applicationImages.length]} alt={title} />
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function AdvantagesPage() {
  return (
    <main className="subpage">
      <SubpageHero title="企业优势" subtitle="从设备、工艺、品控到交付，把印刷服务做得更稳定。" image="/images/equipment-offset-press.jpg" />
      <section className="subpage-section">
        <div className="subpage-card-grid three">
          {advantages.map(([title, desc]) => (
            <article key={title} className="advantage-card subpage-advantage-card">
              <span>{title.slice(0, 1)}</span>
              <strong>{title}</strong>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function CasesPage() {
  const { products } = useCatalog();
  const cases = products.slice(0, 12);

  return (
    <main className="subpage">
      <SubpageHero title="产品案例" subtitle="不同材料、行业和工艺组合下的包装印刷案例。" image="/images/product-packaging-box.jpg" />
      <section className="subpage-section">
        <div className="subpage-card-grid four">
          {(cases.length ? cases : placeholderProducts()).map((product, index) => (
            <Link key={product.id} to={`/products/${product.id}`} className="case-card subpage-case-card">
              <ProductImage product={product} index={index} />
              <strong>{product.name}</strong>
              <p>{product.applicationScenario ?? '支持按需定制材料、尺寸与工艺。'}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export function FactoryPage() {
  return (
    <main className="subpage">
      <SubpageHero title="生产实力" subtitle="现代化生产基地、完善设备与过程管理，保障品质与交付。" image="/images/factory-workshop.jpg" />
      <section className="subpage-section">
        <div className="subpage-card-grid three">
          {factoryItems.map((title, index) => (
            <article key={title} className="factory-card subpage-factory-card">
              <img src={factoryImages[index % factoryImages.length]} alt={title} />
              <span>{title}</span>
              <p>围绕印前、印刷、后道、检测与仓储形成稳定生产协同。</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function JobsPage() {
  return (
    <main className="subpage">
      <SubpageHero title="人才招聘" subtitle="欢迎认同品质、效率与服务价值的伙伴加入我们。" image="/images/hero-factory-building.jpg" />
      <section className="subpage-section jobs-layout">
        <div className="jobs-intro">
          <h2>一起把印刷服务做得更可靠</h2>
          <p>我们重视专业能力，也重视协作与责任心。岗位信息可通过电话或邮箱咨询。</p>
          <Link className="subpage-primary-link" to="/contact">联系我们</Link>
        </div>
        <div className="job-list">
          {jobs.map(([title, desc]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ContactPage() {
  return (
    <main className="subpage">
      <SubpageHero title="联系我们" subtitle="告诉我们您的产品和包装需求，工作人员会尽快与您沟通。" image="/images/hero-contact-service.jpg" />
      <section className="subpage-section contact-page-layout">
        <div className="contact-list">
          <InfoLine label="电话" value="0532-5828 8288" />
          <InfoLine label="邮箱" value="service@dflcyprint.com" />
          <InfoLine label="官网" value="www.dflcyprint.com" />
          <InfoLine label="地址" value="山东省青岛市" />
        </div>
        <div className="contact-message-card">
          <h2>需求沟通建议</h2>
          <p>为了更快提供方案，建议准备产品用途、标签尺寸、材质偏好、数量、使用环境、交期和文件状态。</p>
          <img src="/images/company-qrcode.jpg" alt="青岛东方丽彩包装有限公司二维码" />
        </div>
      </section>
    </main>
  );
}

function SubpageHero({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return (
    <section className="subpage-hero">
      <div>
        <p>Qingdao Dongfang Licai Packaging</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      <img src={image} alt={title} />
    </section>
  );
}

function ProductImage({ product, index }: { product: Product; index: number }) {
  if (product.coverImage) {
    return <img src={toAssetUrl(product.coverImage)} alt={product.name} />;
  }
  return <ProductFallback index={index} />;
}

function ProductFallback({ index }: { index: number }) {
  return <img src={productFallbackImages[index % productFallbackImages.length]} alt="印刷包装产品" />;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <strong>{label}</strong>
      <span>{value}</span>
    </article>
  );
}

function placeholderProducts(): Product[] {
  return ['食品饮料标签', '化妆品包装案例', '药品包装案例', '食品包装案例'].map((name, index) => ({
    id: String(index + 1),
    name,
    code: `CASE-${index + 1}`,
    applicationScenario: '多行业包装印刷案例',
  }));
}
