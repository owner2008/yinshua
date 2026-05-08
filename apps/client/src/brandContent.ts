export const brand = {
  companyName: '青岛东方丽彩包装印刷公司',
  shortName: '东方丽彩包装印刷',
  subtitle: '标签印刷 · 包装定制 · 数字溯源',
  phone: '400-000-0000',
  address: '青岛市包装印刷产业园区',
  recordNo: '鲁ICP备 xxxxxxxx 号',
} as const;

export const navItems = [
  { label: '首页', href: '/' },
  { label: '产品中心', href: '/products' },
  { label: '标签定制', href: '/quote' },
  { label: '在线报价', href: '/quote' },
  { label: '案例展示', href: '/#cases' },
  { label: '工艺与设备', href: '/#craft' },
  { label: '关于我们', href: '/#quality' },
  { label: '联系我们', href: '/#contact' },
] as const;

export const heroCopy = {
  kicker: '标签印刷 · 包装定制 · 数字溯源',
  title: '专业标签印刷与一物一码解决方案',
  subtitle:
    '提供不干胶标签、卷标、产品说明书、包装印刷、可变二维码、防伪标签等定制印刷服务，支持快速报价、批量生产与多行业应用。',
  points: ['24h 快速响应', '可打样确认', '多行业批量供货'],
} as const;

export const advantages = [
  { mark: '¥', title: '快速报价', desc: '在线填写尺寸、材质、数量与工艺，快速获取专属报价。', color: '#FF7A1A' },
  { mark: 'M', title: '多种材质', desc: '铜版纸、哑银、PET、PP、合成纸、透明膜等。', color: '#0A6CFF' },
  { mark: 'UV', title: '工艺齐全', desc: '覆膜、烫金、击凸、局部 UV、模切、可变二维码。', color: '#00A886' },
  { mark: 'Q', title: '质量稳定', desc: '色彩精准、粘性可靠，批量一致性好，交付更安心。', color: '#6C5CE7' },
  { mark: 'C', title: '支持定制', desc: '尺寸、形状、材质、工艺和包装方式均可灵活定制。', color: '#09A7C7' },
  { mark: 'I', title: '多行业应用', desc: '覆盖食品、饮料、日化、医药、工业、电商和物流。', color: '#EC008C' },
] as const;

export const productCategories = [
  { name: '不干胶标签', desc: '适用于食品、日化、工业等多场景。' },
  { name: '卷标标签', desc: '自动贴标、批量生产的稳定方案。' },
  { name: '食品饮料标签', desc: '耐冷藏、防潮、贴合瓶罐包装。' },
  { name: '日化美妆标签', desc: '强调质感、色彩与货架表现。' },
  { name: '医药保健标签', desc: '信息清晰，批量一致，可靠耐用。' },
  { name: '工业电子标签', desc: '耐磨、耐候、可追溯识别。' },
  { name: '防伪标签', desc: '提升品牌可信度与渠道管控能力。' },
  { name: '可变二维码 / 一物一码标签', desc: '可变二维码，支持溯源与营销。' },
  { name: '产品说明书', desc: '折页、说明书、随箱资料印刷。' },
  { name: '包装盒 / 宣传册印刷', desc: '品牌包装与宣传资料配套生产。' },
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
  { title: '食品瓶贴', industry: '食品饮料', material: 'PET + 覆亮膜', highlight: '冷藏环境粘性稳定' },
  { title: '化妆品标签', industry: '日化美妆', material: '透明膜 + 烫金', highlight: '提升货架质感' },
  { title: '茶叶包装标签', industry: '农产品礼盒', material: '铜版纸 + 击凸', highlight: '国风包装识别' },
  { title: '工业设备标签', industry: '工业制造', material: '哑银 PET', highlight: '耐磨耐候' },
  { title: '二维码溯源标签', industry: '一物一码', material: '可变数据印刷', highlight: '扫码追溯防伪' },
  { title: '宣传册 / 产品说明书', industry: '说明书印刷', material: '双胶纸 + 折页', highlight: '信息清晰易读' },
] as const;

export const qualityItems = ['先进印刷设备', '严格色彩管理', '出货前质量检测', '支持打样确认', '批量生产稳定', '售后跟进服务'] as const;

export const cooperationSteps = ['提交需求', '确认报价', '设计 / 文件检查', '打样确认', '批量生产', '质检发货', '售后服务'] as const;

export const testimonials = [
  '沟通效率高，报价和打样反馈很快，适合新品上线节奏。',
  '批量标签颜色一致，贴标稳定，售后也能及时跟进。',
  '二维码标签数据准确，帮助我们做了渠道追溯和营销活动。',
] as const;
