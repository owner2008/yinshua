export const brand = {
  companyName: '青岛东方丽彩包装有限公司',
  shortName: '东方丽彩包装印刷',
  subtitle: '标签印刷 / 包装定制 / 数字溯源',
  phone: '0532-8886 0880',
  mobile: '18705328806',
  emails: ['79927940@qq.com', 'qd7931@126.com'],
  contactPerson: '尚经理',
  address: '青岛市城阳区书雨路118号',
  factoryAddress: '城阳夏庄书雨路118号工厂 / 高新区工厂',
  website: 'https://www.qddflc.com/',
  recordNo: '鲁ICP备 xxxxxxxx 号',
} as const;

export const navItems = [
  { label: '首页', href: '/' },
  { label: '产品中心', href: '/products' },
  { label: '产品中心', href: '/products' },
  { label: '案例展示', href: '/#cases' },
  { label: '联系我们', href: '/contact' },
] as const;

const officialAssetMap: Record<string, string> = {
  'uploads/image/20140606/1402073029.jpg': '/official/qddflc/label-self-adhesive.jpg',
  'uploads/image/20140611/1402504974.jpg': '/official/qddflc/label-roll.jpg',
  'uploads/image/20140611/1402500548.jpg': '/official/qddflc/product-insert.jpg',
  'uploads/image/20140611/1402496559.jpg': '/official/qddflc/packaging-bag-box.jpg',
  'uploads/image/20140611/1402503868.jpg': '/official/qddflc/brochure-print.jpg',
  'uploads/image/20190810/1565408204.jpg': '/official/qddflc/equipment-uv-line.jpg',
  'uploads/image/20190810/1565411248.jpg': '/official/qddflc/equipment-heidelberg.jpg',
  'uploads/image/20140613/1402669288.jpg': '/official/qddflc/equipment-label-machine.jpg',
  'uploads/image/20140613/1402673876.jpg': '/official/qddflc/equipment-roll-machine.jpg',
  'uploads/image/20140613/1402671819.jpg': '/official/qddflc/equipment-print-machine.jpg',
  'uploads/image/20140611/1402505008.jpg': '/official/qddflc/equipment-diecut.jpg',
  'data/watermark/erweima.jpg': '/official/qddflc/wechat-qr.jpg',
};

const officialAsset = (path: string) => officialAssetMap[path] ?? '/official/qddflc/label-self-adhesive.jpg';

export const companyProfile = {
  title: '专注标签印刷、包装印刷与企业定制印刷服务',
  desc:
    '青岛东方丽彩包装有限公司引进德国博世 Rexroth 六色+上光 PS 版 UV 印刷生产线，配套海德堡印刷机、海德堡 UV 印刷机等设备，长期服务企业客户的产品标签、卷标不干胶、产品说明书、包装、宣传册、可变二维码与一物一码标签等印刷需求。',
  notice: '最新引进国内先进标签印刷机德国博世 Rexroth 六色+上光 PS 版 UV 印刷生产线',
  services: ['优质服务', '设备先进', '专业印刷', '标签印刷', '卷标不干胶', '产品说明书', '包装印刷', '宣传册', '可变二维码', '一物一码标签'],
  source: '信息整理自 qddflc.com 公开展示内容',
} as const;

export const heroCopy = {
  kicker: '标签印刷 / 包装定制 / 数字溯源',
  title: '专业标签印刷与一物一码解决方案',
  subtitle:
    '提供不干胶标签、卷标、产品说明书、包装印刷、可变二维码、防伪标签等定制印刷服务，支持快速报价、批量生产与多行业应用。',
  points: ['24h 快速响应', '支持打样确认', '多行业批量供货'],
} as const;

export const advantages = [
  { mark: '报', title: '快速报价', desc: '在线填写尺寸、材质、数量与工艺，快速获取专属报价。', color: '#FF7A1A' },
  { mark: '材', title: '多种材质', desc: '铜版纸、哑银、PET、PP、合成纸、透明膜等灵活选择。', color: '#0A6CFF' },
  { mark: 'UV', title: '工艺齐全', desc: '覆膜、烫金、击凸、局部 UV、模切、可变二维码均可定制。', color: '#00A886' },
  { mark: '质', title: '质量稳定', desc: '色彩精准、粘性可靠、批量一致性好，交付更安心。', color: '#6C5CE7' },
  { mark: '定', title: '支持定制', desc: '尺寸、形状、材质、工艺和包装方式均可按需定制。', color: '#09A7C7' },
  { mark: '业', title: '多行业应用', desc: '覆盖食品、饮料、日化、医药、工业、电商和物流。', color: '#EC008C' },
] as const;

export const productCategories = [
  { name: '不干胶标签', desc: '适用于食品、日化、工业等多场景。', imageUrl: officialAsset('uploads/image/20140606/1402073029.jpg') },
  { name: '卷标标签', desc: '自动贴标、批量生产的稳定方案。', imageUrl: officialAsset('uploads/image/20140611/1402504974.jpg') },
  { name: '食品饮料标签', desc: '耐冷藏、防潮、贴合瓶罐包装。', imageUrl: 'https://images.pexels.com/photos/37271678/pexels-photo-37271678.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { name: '日化美妆标签', desc: '强调质感、色彩与货架表现。', imageUrl: 'https://images.pexels.com/photos/13946074/pexels-photo-13946074.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { name: '医药保健标签', desc: '信息清晰，批量一致，可靠耐用。', imageUrl: 'https://images.pexels.com/photos/6800931/pexels-photo-6800931.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { name: '工业电子标签', desc: '耐磨、耐候、可追溯识别。', imageUrl: 'https://images.pexels.com/photos/31091538/pexels-photo-31091538.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { name: '防伪标签', desc: '提升品牌可信度与渠道管控能力。', imageUrl: 'https://images.pexels.com/photos/7464264/pexels-photo-7464264.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { name: '可变二维码 / 一物一码标签', desc: '可变二维码，支持溯源与营销。', imageUrl: 'https://images.pexels.com/photos/12053213/pexels-photo-12053213.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { name: '产品说明书', desc: '折页、说明书、随箱资料印刷。', imageUrl: officialAsset('uploads/image/20140611/1402500548.jpg') },
  { name: '包装盒 / 宣传册印刷', desc: '品牌包装与宣传资料配套生产。', imageUrl: officialAsset('uploads/image/20140611/1402496559.jpg') },
] as const;

export const quoteSteps = [
  '选择产品类型、尺寸与材质',
  '填写数量、工艺与使用场景',
  '提交需求，客服快速确认报价',
] as const;

export const industries = ['食品饮料', '日化美妆', '医药保健', '工业制造', '电子电器', '物流仓储', '农产品', '电商零售'] as const;

export const materials = ['铜版纸', '合成纸', 'PET', 'PP', '哑银', '透明膜', '可移胶', '冷藏冷冻标签材质'] as const;

export const crafts = ['覆亮膜', '覆哑膜', '烫金', '烫银', '击凸', '局部 UV', '模切异形', '可变二维码', '防伪工艺'] as const;

export const cases = [
  { title: '不干胶卷标印刷', industry: '标签卷标', material: '铜版纸 / PET / PP', highlight: '适合批量标签和自动贴标', imageUrl: officialAsset('uploads/image/20140611/1402504974.jpg') },
  { title: '化妆品标签', industry: '日化美妆', material: '透明膜 + 烫金', highlight: '提升货架质感', imageUrl: 'https://images.pexels.com/photos/13946074/pexels-photo-13946074.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: '说明书、宣传册、海报', industry: '宣传物料', material: '铜版纸 / 双胶纸', highlight: '图文清晰，适合企业宣传', imageUrl: officialAsset('uploads/image/20140611/1402500548.jpg') },
  { title: '工业设备标签', industry: '工业制造', material: '哑银 PET', highlight: '耐磨耐候', imageUrl: 'https://images.pexels.com/photos/31091538/pexels-photo-31091538.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: '二维码溯源标签', industry: '一物一码', material: '可变数据印刷', highlight: '扫码追溯防伪', imageUrl: 'https://images.pexels.com/photos/7464264/pexels-photo-7464264.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: '包装盒、手提袋', industry: '包装印刷', material: '卡纸 / 覆膜 / 模切', highlight: '品牌包装配套生产', imageUrl: officialAsset('uploads/image/20140611/1402496559.jpg') },
] as const;

export const qualityItems = ['先进印刷设备', '严格色彩管理', '出货前质量检测', '支持打样确认', '批量生产稳定', '售后跟进服务'] as const;

export const cooperationSteps = ['提交需求', '确认报价', '设计 / 文件检查', '打样确认', '批量生产', '质检发货', '售后服务'] as const;

export const testimonials = [
  '沟通效率高，报价和打样反馈很快，适合新品上线节奏。',
  '批量标签颜色一致，贴标稳定，售后也能及时跟进。',
  '二维码标签数据准确，帮助我们做了渠道追溯和营销活动。',
] as const;

export const productImageByCode: Record<string, string> = {
  'SELF-ADHESIVE-LABEL': officialAsset('uploads/image/20140606/1402073029.jpg'),
  'ROLL-LABEL': officialAsset('uploads/image/20140611/1402504974.jpg'),
  'FOOD-DRINK-LABEL': 'https://images.pexels.com/photos/37271678/pexels-photo-37271678.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'COSMETIC-LABEL': 'https://images.pexels.com/photos/13946074/pexels-photo-13946074.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'MEDICAL-HEALTH-LABEL': 'https://images.pexels.com/photos/6800931/pexels-photo-6800931.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'INDUSTRIAL-ELECTRONIC-LABEL': 'https://images.pexels.com/photos/31091538/pexels-photo-31091538.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'ANTI-COUNTERFEIT-LABEL': 'https://images.pexels.com/photos/7464264/pexels-photo-7464264.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'VARIABLE-QR-LABEL': 'https://images.pexels.com/photos/12053213/pexels-photo-12053213.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'PRODUCT-INSERT': officialAsset('uploads/image/20140611/1402500548.jpg'),
  'PACKAGING-BROCHURE': officialAsset('uploads/image/20140611/1402496559.jpg'),
};

export const factoryVisual = {
  imageUrl: officialAsset('uploads/image/20190810/1565408204.jpg'),
  title: '东方丽彩包装印刷设备展示',
  stats: [
    { label: '出货前质检', value: '100%' },
    { label: '批量色彩校准', value: 'ΔE' },
    { label: '打样确认', value: 'Proof' },
  ],
} as const;

export const trustLogos = ['食品饮料', '日化美妆', '医药保健', '工业制造', '电商零售', '物流仓储'] as const;

export const officialProductShowcase = [
  { title: '不干胶卷标印刷', imageUrl: officialAsset('uploads/image/20140611/1402504974.jpg') },
  { title: '说明书、宣传册、海报', imageUrl: officialAsset('uploads/image/20140611/1402500548.jpg') },
  { title: '包装盒、手提袋', imageUrl: officialAsset('uploads/image/20140611/1402496559.jpg') },
  { title: '宣传册印刷', imageUrl: officialAsset('uploads/image/20140611/1402503868.jpg') },
] as const;

export const officialEquipmentShowcase = [
  { title: '设备展示', imageUrl: officialAsset('uploads/image/20190810/1565408204.jpg') },
  { title: '设备展示', imageUrl: officialAsset('uploads/image/20190810/1565411248.jpg') },
  { title: '标签印刷机', imageUrl: officialAsset('uploads/image/20140613/1402669288.jpg') },
  { title: '不干胶卷标印刷机', imageUrl: officialAsset('uploads/image/20140613/1402673876.jpg') },
  { title: '不干胶印刷机', imageUrl: officialAsset('uploads/image/20140613/1402671819.jpg') },
  { title: '全自动标签模切机', imageUrl: officialAsset('uploads/image/20140611/1402505008.jpg') },
] as const;

export const qrCodeImage = officialAsset('data/watermark/erweima.jpg');
