<?php
/**
 * 东方丽彩主题 — 核心功能
 */

// ===== 主题初始化 =====
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'gallery', 'caption']);
    add_theme_support('woocommerce');
    add_theme_support('custom-logo', [
        'height' => 40, 'width' => 120, 'flex-height' => true,
    ]);

    register_nav_menus([
        'primary' => '主导航',
        'footer'  => '底部导航',
    ]);
});

// ===== 多语言支持（中文 / English） =====

// 翻译表
function dflc_t($text) {
    static $map = [
        // === 导航 ===
        '首页'     => 'Home',
        '主营产品' => 'Products',
        '生产实力' => 'Production',
        '关于我们' => 'About Us',
        '人才招聘' => 'Careers',
        '行业应用' => 'Industries',
        '行业资讯' => 'News',
        '联系我们' => 'Contact Us',
        // === 站点 ===
        '青岛东方丽彩'                => 'Dongfang Licai',
        '青岛东方丽彩包装有限公司'    => 'Qingdao Dongfang Licai Packaging Co., Ltd.',
        '专业不干胶标签印刷定制专家'  => 'Professional Label & Packaging Printer',
        // === 菜单 ===
        '菜单' => 'Menu',
        // === 首页 Hero ===
        '专业印刷'               => 'Professional Printing',
        '品质传递价值'            => 'Quality Delivers Value',
        '专注标签 · 包装 · 说明书 · 宣传册印刷' => 'Labels · Packaging · Manuals · Brochures',
        '一站式满足您的包装印刷需求'           => 'One-Stop Packaging & Printing Solutions',
        '查看产品'               => 'View Products',
        '先进设备'               => 'Advanced Equipment',
        '精密印刷工艺'            => 'Precision Printing Technology',
        '品质稳定'               => 'Consistent Quality',
        '严格品控流程'            => 'Rigorous Quality Control',
        '企业优势'               => 'Our Advantages',
        '按需定制'               => 'Custom Solutions',
        '定制方案'               => 'Custom Solutions',
        '满足多样需求'           => 'Meeting Diverse Needs',
        '规模生产'               => 'Scaled Production',
        '品质管控'               => 'Quality Control',
        '快速响应'               => 'Fast Response',
        '专业团队'               => 'Expert Team',
        // === 产品分类名称 ===
        '标签印刷'               => 'Label Printing',
        '不干胶标签'             => 'Adhesive Labels',
        '卷筒不干胶标签'          => 'Roll-Fed Adhesive Labels',
        '防伪标签'               => 'Anti-Counterfeit Labels',
        '定制异形标签'            => 'Custom Shaped Labels',
        '特种标签'               => 'Specialty Labels',
        '食品饮料标签'            => 'Food & Beverage Labels',
        '日化化妆品标签'          => 'Personal Care Labels',
        '医药标签'               => 'Pharmaceutical Labels',
        '电子电器标签'            => 'Electronics Labels',
        '酒水标签'               => 'Wine & Liquor Labels',
        '物流条码标签'            => 'Logistics Barcode Labels',
        '包装盒印刷'             => 'Box Packaging',
        '彩盒包装'               => 'Color Box Packaging',
        '瓦楞纸盒'               => 'Corrugated Boxes',
        '白卡纸盒'               => 'White Cardboard Boxes',
        '礼品盒'                 => 'Gift Boxes',
        '药品包装盒'             => 'Pharmaceutical Boxes',
        '食品包装盒'             => 'Food Packaging Boxes',
        '化妆品包装盒'            => 'Cosmetic Packaging Boxes',
        '电子产品包装盒'          => 'Electronics Packaging Boxes',
        '宣传物料印刷'            => 'Marketing Materials',
        '宣传册'                 => 'Brochures',
        '折页单页'               => 'Flyers & Leaflets',
        '海报'                   => 'Posters',
        '台卡'                   => 'Table Cards',
        '杯套'                   => 'Cup Sleeves',
        '手提袋'                 => 'Handbags',
        '纸袋'                   => 'Paper Bags',
        '纸杯'                   => 'Paper Cups',
        '信封信纸'               => 'Envelopes & Letterheads',
        '企业画册'               => 'Company Profile',
        '产品画册'               => 'Product Catalog',
        '说明书'                 => 'Instruction Manuals',
        '纸制品印刷'             => 'Paper Products',
        '合格证'                 => 'Certificates',
        '吊牌'                   => 'Hang Tags',
        '档案袋'                 => 'File Folders',
        // === 材质 ===
        '材质'                   => 'Material',
        '材质：'                 => 'Material: ',
        '材质与工艺'             => 'Materials & Craft',
        '卡纸材料系列'            => 'Cardboard Series',
        '合成材料系列'            => 'Synthetic Material Series',
        '涂层纸系列'             => 'Coated Paper Series',
        '铜版纸'                 => 'Coated Paper',
        '合成纸'                 => 'Synthetic Paper',
        // === 工艺 ===
        '工艺'                   => 'Process / Craft',
        '工艺：'                 => 'Craft: ',
        '使用工艺'               => 'Craftsmanship',
        '使用材质'               => 'Materials Used',
        '后道加工中心'            => 'Post-Press Center',
        '全自动模切设备'          => 'Automatic Die-Cutting',
        '品检分条设备'            => 'Inspection & Slitting',
        '表面整饰'               => 'Surface Finishing',
        '数码印刷产线'            => 'Digital Printing Line',
        '海德堡多色胶印机'         => 'Heidelberg Multi-Color Offset Press',
        '德国博世Rexroth六色UV印刷生产线' => 'German Bosch Rexroth 6-Color UV Line',
        '四色印刷'               => 'Four-Color (CMYK) Printing',
        '覆膜'                   => 'Film Lamination',
        '烫金'                   => 'Hot Foil Stamping',
        'UV工艺'                 => 'UV Coating',
        '模切'                   => 'Die-Cutting',
        '防护工艺'               => 'Protective Coatings',
        '数字工艺'               => 'Digital Finishing',
        // === 产品属性 ===
        '尺寸'                   => 'Dimensions',
        '形状'                   => 'Shape',
        '用途'                   => 'Application',
        '属性'                   => 'Specifications',
        '产品属性'               => 'Product Specs',
        '产品规格参数'            => 'Product Specifications',
        '最小起订量'             => 'MOQ (Minimum Order Quantity)',
        '起订量'                 => 'MOQ',
        '打样'                   => 'Proofing / Sampling',
        '打样说明'               => 'Sampling Notes',
        '支持打样'               => 'Sampling Available',
        '不支持打样'             => 'Sampling Not Available',
        '免费打样'               => 'Free Sampling',
        '付费打样'               => 'Paid Sampling',
        '支持打样（费用另计）'    => 'Sampling Available (additional cost)',
        '交货周期'               => 'Lead Time',
        '交期'                   => 'Delivery',
        '5-7个工作日'            => '5–7 Business Days',
        '常规尺寸'               => 'Standard Sizes',
        '适用场景'               => 'Suitable For',
        // === 案例 ===
        '产品案例'               => 'Case Studies',
        '案例展示'               => 'Case Studies',
        '案例'                   => 'Cases',
        '使用工艺'               => 'Craftsmanship',
        '项目介绍'               => 'Project Overview',
        '客户需求'               => 'Customer Requirements',
        '解决方案'               => 'Solution',
        '相关产品'               => 'Related Products',
        '关联产品'               => 'Related Products',
        '查看详情'               => 'View Details',
        '查看更多'               => 'View More',
        '返回案例列表'            => 'Back to Cases',
        '返回行业列表'            => 'Back to Industries',
        '查看询价详情'            => 'View Inquiry Details',
        // === 询价 ===
        '询价'                   => 'Inquiry',
        '立即咨询'               => 'Inquire Now',
        '您的姓名'               => 'Your Name',
        '联系电话'               => 'Phone',
        '手机'                   => 'Mobile',
        '办公室电话'             => 'Office Phone',
        '电子邮箱'               => 'Email',
        '请描述您的需求'          => 'Please describe your requirements',
        '请描述您的需求，我们会尽快与您联系' => 'Please describe your requirements, we will contact you shortly',
        '我们会尽快与您联系'      => 'We will contact you shortly',
        '我们会在24小时内与你联系' => 'We will respond within 24 hours',
        '提交成功'               => 'Submitted Successfully',
        '提交留言'               => 'Submit',
        '提交失败'               => 'Submission Failed',
        '提交失败，请重试'        => 'Submission failed, please try again',
        '提交失败，请稍后重试'    => 'Submission failed, please try again later',
        '网络错误，请稍后重试'    => 'Network error, please try again later',
        '请填写你的姓名'          => 'Please enter your name',
        '手机号或座机'            => 'Mobile or landline',
        // === 搜索/分页 ===
        '‹ 上一页'              => '‹ Previous',
        '下一页 ›'              => 'Next ›',
        // === 行业 ===
        '食品饮料'               => 'Food & Beverage',
        '日化美妆'               => 'Personal Care & Cosmetics',
        '医药健康'               => 'Pharmaceutical & Healthcare',
        '电子电器'               => 'Electronics & Appliances',
        '酒类茶叶'               => 'Wine, Liquor & Tea',
        '物流快递'               => 'Logistics & Express',
        '服装鞋帽'               => 'Apparel & Footwear',
        '其他行业'               => 'Other Industries',
        // === 客户/需求描述 ===
        '客户名称'               => 'Client Name',
        '描述客户最初的需求或痛点' => 'Describe original requirements or pain points',
        '描述你们如何解决问题'    => 'Describe how you solved the problem',
        // === Footer ===
        'All Rights Reserved.'   => 'All Rights Reserved.',
        // === 主题 ===
        '默认 · 蓝青'            => 'Default · Blue Cyan',
        '方案A · 深蓝金'         => 'Scheme A · Navy Gold',
        '方案B · 红陶暖橙'       => 'Scheme B · Terracotta',
        '方案C · 墨绿铜'         => 'Scheme C · Forest Copper',
        '方案D · 天蓝珊瑚'       => 'Scheme D · Sky Coral',
        // === 描述文案 ===
        '自然质感，适合环保包装与食品标签'       => 'Natural texture, ideal for eco-friendly packaging and food labels',
        '质感厚重，突出精品包装与酒类标签'       => 'Premium texture, suitable for luxury packaging and wine labels',
        '清新明亮，天蓝主色搭配珊瑚橙点缀'       => 'Fresh and bright, sky blue with coral orange accents',
        '高端商务，适合大客户洽谈与招投标场景'   => 'Premium business style, ideal for enterprise presentations and bidding',
        '防水防油·耐低温·可追溯'               => 'Waterproof · Oil-Resistant · Low-Temp · Traceable',
        '1000张'                                => '1,000 pcs',
        '例如：1000张 / 1卷起订'                 => 'e.g. 1,000 pcs / 1 roll MOQ',
        '例如：50mm×80mm / 可定制'               => 'e.g. 50×80mm / customizable',
        '例如：5-7个工作日'                      => 'e.g. 5–7 business days',
        '如：10000张'                             => 'e.g. 10,000 pcs',
        '山东省'                                  => 'Shandong Province',
        '青岛市'                                  => 'Qingdao City',
        '青岛东方丽彩包装有限公司 · 专业标签与包装印刷服务商' => 'Dongfang Licai · Professional Label & Packaging Printer',
        // === 产品中心 ===
        '产品中心'               => 'Products',
        '分类未找到'             => 'Category Not Found',
        '请返回'                 => 'Please return to',
        '精选产品展示'           => 'Featured Products',
        // === SEO ===
        '标签印刷,不干胶标签,防伪标签,食品标签,化妆品标签,卷标,青岛标签印刷,东方丽彩'
            => 'Label Printing, Adhesive Labels, Anti-Counterfeit Labels, Food Labels, Cosmetic Labels, Roll Labels, Qingdao Label Printing, Dongfang Licai',
        // === 其他 ===
        '期待与您合作'           => 'Looking forward to working with you',
        '精选优质材料，先进印刷工艺' => 'Premium materials, advanced printing technology',
        '先进设备保障品质与效率'   => 'Advanced equipment ensuring quality & efficiency',
        '地址'                   => 'Address',
        '公司简介'               => 'Company Profile',
        '客户服务'               => 'Customer Service',
        '产品目录'               => 'Product Catalog',
        '在线询价'               => 'Online Inquiry',
        // === 首页区块副标题 ===
        '先进印刷与后道设备，保障每一步品质'   
            => 'Advanced printing & finishing equipment ensuring quality at every step',
        '服务多元行业，提供定制化包装印刷方案' 
            => 'Serving diverse industries with customized packaging & printing solutions',
        '精选优质材料，结合先进印刷与表面处理工艺' 
            => 'Premium materials combined with advanced printing & finishing for every masterpiece',
        '深耕行业十五年，以专业赢得客户信赖'   
            => '15+ years in packaging & printing, earning trust through professional excellence',
        '期待与您合作，提供专业的包装印刷解决方案' 
            => 'Looking forward to collaborating with you — professional packaging & printing solutions',
        // === H5 专用 ===
        '印刷设备展示'           => 'Printing Equipment Display',
        '烫金/击凸/压纹'         => 'Hot Stamping / Embossing / Debossing',
        '覆膜/上光'             => 'Lamination / Varnishing',
        '白卡/灰底白板'          => 'White Card / Grey Board',
        '铜版纸/哑粉纸'          => 'Coated Paper / Matte Paper',
        '可变码精准溯源'         => 'Variable QR Code Traceability',
        '6000㎡厂房，全自动产线'   => '6,000㎡ facility, fully automated lines',
        'ISO认证，合格率99.8%'    => 'ISO certified, 99.8% pass rate',
        '打样48h，紧急优先排产'   => 'Sampling in 48h, priority scheduling for urgent orders',
        '资深设计+印刷技师团队'    => 'Senior designers & printing technicians',
        '公司地址'               => 'Company Address',
        '青岛东方丽彩包装有限公司成立于2010年，集设计、印刷、后道加工于一体，拥有6000㎡现代化生产基地，配海德堡多色胶印机、全自动模切机、HP Indigo数字印刷机等先进设备。'
            => 'Founded in 2010, Qingdao Dongfang Licai Packaging integrates design, printing and post-press processing. Our 6,000㎡ modern facility houses Heidelberg offset presses, automatic die-cutters, HP Indigo digital presses, and other advanced equipment.',
        '秉持「品质为本、客户至上」理念，为客户提供从设计到成品的一站式包装印刷解决方案。'
            => 'Guided by "Quality First, Customer Foremost," we deliver one-stop packaging & printing solutions from design to finished product.',

        // === 材质卡片描述 ===
        '烫金 · 击凸 · 压凹。高端3D触感工艺，提升品牌质感' 
            => 'Hot Stamping · Embossing · Debossing. Premium 3D tactile finish for brand elevation',
        '覆膜 · 上光。增强光泽与耐用性，延长产品寿命' 
            => 'Lamination · Varnishing. Enhanced gloss and durability for extended product life',
        '白卡 · 灰板。高挺度与印刷适性优异，适用于包装盒与吊牌' 
            => 'White Card · Grey Board. High stiffness & printability, ideal for boxes and hang tags',
        'PET/PP/PE材料。防水防油耐撕，适用于严苛使用场景' 
            => 'PET/PP/PE materials. Waterproof, oil-resistant, tear-proof for demanding applications',
        '铜版纸 · 哑粉纸。色彩鲜艳细节丰富，适用于高端标签与包装' 
            => 'Coated Paper · Matte Paper. Vibrant colors & rich detail for premium labels and packaging',
        '可变二维码 · 条形码 · 序列号。精准溯源，每件产品可追踪' 
            => 'Variable QR Codes · Barcodes · Serial Numbers. Accurate traceability for every product',
        // === 企业优势 ===
        '规模生产'               => 'Scaled Production',
        '品质管控'               => 'Quality Control',
        '6000㎡现代化车间，多条自动化产线，稳定产能保障交期' 
            => '6,000㎡ modern facility with multiple automated lines, reliable capacity and on-time delivery',
        'ISO认证质量管理体系，全流程在线检测，高合格率保障' 
            => 'ISO-certified quality management system, full-process online inspection, 99.8% pass rate',
        '7×24小时在线响应，最快48小时出样，紧急订单优先排产' 
            => '24/7 online support, sampling as fast as 48 hours, priority scheduling for urgent orders',
        '资深印前设计师与经验丰富的印刷技师，提供全方位技术支持' 
            => 'Senior pre-press designers & experienced printing technicians providing full technical support',
        // === 关于我们 ===
        '公司成立于2010年，青岛东方丽彩包装有限公司是集设计、印刷、后道加工于一体的专业包装印刷企业。公司位于青岛，拥有6000㎡现代化生产基地，配备海德堡多色胶印机、全自动模切机、HP Indigo数码印刷机等先进设备。' 
            => 'Founded in 2010, Qingdao Dongfang Licai Packaging Co., Ltd. is a professional packaging and printing enterprise integrating design, printing, and post-press processing. Located in Qingdao, we operate a 6,000㎡ modern production base equipped with Heidelberg multi-color offset presses, automatic die-cutting machines, HP Indigo digital presses, and other advanced equipment.',
        '主营卷筒不干胶标签、包装盒、手提袋、说明书、宣传画册、可变二维码标签等。服务客户涵盖食品饮料、日化美妆、医药健康、电子电器、酒类茶叶、电商物流等多个行业。' 
            => 'We specialize in roll-fed adhesive labels, packaging boxes, handbags, instruction manuals, brochures, variable QR code labels, and more. Our clients span food & beverage, personal care, pharmaceutical, electronics, wine & spirits, logistics & e-commerce, and other industries.',
        '东方丽彩秉持「品质为本、客户至上」的理念，以专业的技术和用心的服务，为客户提供从设计到成品的一站式包装印刷解决方案。' 
            => 'Dongfang Licai is committed to "Quality First, Customer Foremost," delivering one-stop packaging and printing solutions from design to finished product with professional expertise and attentive service.',
        // === Footer ===
        '专业标签与包装印刷服务商。主营不干胶标签、包装盒、手提袋、说明书、宣传画册等全品类印刷。' 
            => 'Professional Label & Packaging Printer. Full range: adhesive labels, packaging boxes, handbags, manuals, brochures & more.',
        '青岛市城阳区书雨路118号' 
            => 'No. 118 Shuyu Road, Chengyang District, Qingdao',

        '左右滑动查看'           => 'Swipe to view more',
        '十五年深耕，以专业赢得信赖' => '15+ years of expertise, trusted by clients',
        '覆盖标签、包装、商务印刷全品类' => 'Covering labels, packaging & commercial printing',
        '专业标签与包装印刷服务商' => 'Professional Label & Packaging Printing Provider',
    ];
    
    // 非中文语言：Polylang MO 优先 → 静态映射兜底
    if (function_exists('pll_current_language') && function_exists('pll__')) {
        $lang = pll_current_language('slug');
        if ($lang && $lang !== 'zh') {
            $tr = pll__($text);
            if ($tr && $tr !== $text) return $tr;
            // Polylang 无结果时，用静态映射兜底
            return $map[$text] ?? $text;
        }
    }
    // 中文（默认语言）：返回原文，不查英文映射表
    return $text;
}

// 注册所有字符串到 Polylang（后台 → 语言 → 字符串翻译 可见）
add_action('init', function () {
    if (!function_exists('pll_register_string')) return;
    $file = __DIR__ . '/assets/lang/en.json';
    if (!file_exists($file)) return;
    $pairs = json_decode(file_get_contents($file), true) ?: [];
    foreach ($pairs as $p) {
        pll_register_string('dflc_' . md5($p[0]), $p[0], '主题模板');
    }
}, 30);

// 修复 Polylang 英文页面 301 无限重定向
// 根因：Polylang 英文首页 home_url 使用页面 slug（/en/home-en/ 而非 /en/）
// 修复：① 英文首页 slug 页面 → 301 到 /en/  ② 提前移除 Polylang redirect_canonical 钩子

add_action('wp', function() {
    if (!function_exists('pll_current_language') || pll_current_language('slug') !== 'en') return;
    $en = PLL()->model->get_language('en');
    if (!$en) return;
    $front_id = $en->page_on_front ? (int) $en->page_on_front : 0;
    if ($front_id && is_singular('page') && get_queried_object_id() === $front_id && !is_front_page()) {
        wp_redirect(home_url('/en/'), 301);
        exit;
    }
}, 1);

// 在所有 redirect_canonical 触发前，移除 Polylang 对它的劫持
add_action('wp', function() {
    remove_filter('redirect_canonical', [PLL()->static_pages, 'redirect_canonical'], 10);
}, 2);

// 调试：强制阻止所有 canonical redirect
add_filter('redirect_canonical', '__return_false', PHP_INT_MAX);

add_filter('pll_check_canonical_url', '__return_false', 1);

// 修正英文首页链接（导航/语言切换器用）
add_filter('page_link', function($link, $id) {
    if (function_exists('pll_get_post_language') && pll_get_post_language($id) === 'en') {
        $en = PLL()->model->get_language('en');
        if ($en && $en->page_on_front == $id) {
            return home_url('/en/');
        }
    }
    return $link;
}, 25, 2);

// 修正语言切换器英文首页链接（/en/home-en/ → /en/）
// 用 pll_the_language_link 过滤每个语言的链接
add_filter('pll_the_language_link', function($url, $slug) {
    if ($slug === 'en') {
        $en = PLL()->model->get_language('en');
        if ($en && $en->page_on_front && strpos($url, '/home-en') !== false) {
            return home_url('/en/');
        }
    }
    return $url;
}, 10, 2);

// 修正 hreflang 中的英文首页链接
add_filter('pll_rel_hreflang_attributes', function($hreflangs) {
    if (isset($hreflangs['en'])) {
        $en = PLL()->model->get_language('en');
        if ($en && $en->page_on_front && strpos($hreflangs['en'], '/home-en') !== false) {
            $hreflangs['en'] = home_url('/en/');
        }
    }
    return $hreflangs;
});

// 修正 pll_home_url() 返回值（logo 链接、首页链接等）
function dflc_home_url() {
    if (function_exists('pll_current_language') && pll_current_language('slug') === 'en') {
        return home_url('/en/');
    }
    return function_exists('pll_home_url') ? pll_home_url() : home_url('/');
}

// 导航 URL 辅助函数（Polylang 多语言）
function dflc_nav_url($zh_page_id, $fallback_path = '/') {
    if (function_exists('pll_get_post') && function_exists('pll_current_language')) {
        $cur_lang = pll_current_language('slug');
        if ($cur_lang === 'en') {
            $en_id = pll_get_post($zh_page_id, 'en');
            if ($en_id) return get_permalink($en_id);
        }
    }
    return home_url($fallback_path);
}

// 动态站点名称（多语言）
add_filter('option_blogname', function($value) {
    if (function_exists('pll_current_language') && pll_current_language('slug') === 'en') {
        return 'Qingdao Dongfang Licai Packaging Co., Ltd.';
    }
    return $value;
});
add_filter('option_blogdescription', function($value) {
    if (function_exists('pll_current_language') && pll_current_language('slug') === 'en') {
        return 'Professional label & packaging printing';
    }
    return $value;
});

function dflc_current_lang() {
    static $lang = null;
    if ($lang !== null) return $lang;

    $uri = $_SERVER['REQUEST_URI'];

    // URL prefix /en/ 优先
    if (preg_match('#^/en(/|$)#', $uri)) {
        $lang = 'en';
        return $lang;
    }
    if (!empty($_COOKIE['dflc_lang']) && $_COOKIE['dflc_lang'] === 'en') {
        $lang = 'en';
        return $lang;
    }
    $lang = 'zh';
    return $lang;
}

// /en/ 前缀 → 去掉前缀后内部重写
add_action('init', function () {
    $uri = $_SERVER['REQUEST_URI'];
    if (preg_match('#^/en(/|$)#', $uri)) {
        // 设置 cookie
        if (empty($_COOKIE['dflc_lang']) || $_COOKIE['dflc_lang'] !== 'en') {
            setcookie('dflc_lang', 'en', time() + 86400 * 30, '/');
        }
        // 去掉 /en 前缀，让 WordPress 正常路由
        $new_uri = preg_replace('#^/en#', '', $uri);
        if ($new_uri === '' || $new_uri === '/') $new_uri = '/';
        $_SERVER['REQUEST_URI'] = $new_uri;
    }
}, 1);

// 语言切换 URL
function dflc_lang_switch_url($target_lang) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // 去掉现有 /en/ 前缀
    $path = preg_replace('#^/en(/|$)#', '/', $path);
    if ($target_lang === 'en') {
        return home_url('/en' . ($path === '/' ? '' : $path));
    }
    return home_url($path);
}

// ===== 加载 CSS/JS =====
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('dflc-style', get_stylesheet_uri(), [], '1.0');
    if (dflc_is_mobile()) {
        wp_enqueue_style('dflc-h5', get_template_directory_uri() . '/h5/css/h5.css', [], '3.9');
    } else {
        wp_enqueue_style('dflc-main', get_template_directory_uri() . '/assets/css/main.css', [], '5.9');
        wp_enqueue_script('dflc-script', get_template_directory_uri() . '/assets/js/main.js', [], '1.0', true);
    }
    // 主题风格 CSS（默认不加载，选非默认时加载对应文件）
    $theme = get_option('dflc_theme_style', 'default');
    if ($theme !== 'default') {
        $handle = dflc_is_mobile() ? 'dflc-theme' : 'dflc-theme-pc';
        $dep    = dflc_is_mobile() ? ['dflc-h5'] : ['dflc-main'];
        wp_enqueue_style($handle, get_template_directory_uri() . '/assets/css/themes/' . $theme . '.css', $dep, '1.0');
    }
});

// ===== WooCommerce 支持声明 =====
add_action('after_setup_theme', function () {
    add_theme_support('woocommerce');
});

// ===== 隐藏 WordPress 管理栏（前端） =====
add_filter('show_admin_bar', '__return_false');

// ===== 注册 CPT（确保 web 请求中生效） =====
add_action('init', function () {
    register_post_type('case', [
        'labels' => ['name' => '案例展示', 'singular_name' => '案例', 'add_new' => '添加案例', 'all_items' => '所有案例'],
        'public' => true, 'has_archive' => true,
        'rewrite' => ['slug' => 'cases'],
        'supports' => ['title', 'editor', 'thumbnail'],
        'menu_icon' => 'dashicons-format-gallery',
    ]);
    register_post_type('industry', [
        'labels' => ['name' => '行业应用', 'singular_name' => '行业', 'add_new' => '添加行业', 'all_items' => '所有行业'],
        'public' => true, 'has_archive' => true,
        'rewrite' => ['slug' => 'industries'],
        'supports' => ['title', 'editor', 'thumbnail'],
        'menu_icon' => 'dashicons-building',
    ]);
});

// ===== 注册 ACF 字段组（案例 + 产品） =====
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) return;

    // 案例字段组
    acf_add_local_field_group([
        'key' => 'group_case_details',
        'title' => '案例详细信息',
        'fields' => [
            ['key' => 'field_case_industry', 'label' => '所属行业', 'name' => 'case_industry', 'type' => 'select',
             'choices' => ['食品饮料'=>'食品饮料','日化美妆'=>'日化美妆','医药健康'=>'医药健康','电子电器'=>'电子电器','酒类茶叶'=>'酒类茶叶','物流快递'=>'物流快递','服装鞋帽'=>'服装鞋帽','其他行业'=>'其他行业'],
             'default_value' => '食品饮料', 'wrapper' => ['width' => '33']],
            ['key' => 'field_case_client', 'label' => '客户名称', 'name' => 'case_client', 'type' => 'text',
             'placeholder' => '例如：某某食品有限公司', 'wrapper' => ['width' => '33']],
            ['key' => 'field_case_order', 'label' => '排序权重', 'name' => 'case_order', 'type' => 'number',
             'instructions' => '数字越小越靠前（1~99）', 'default_value' => 10, 'min' => 1, 'max' => 99, 'wrapper' => ['width' => '33']],
            ['key' => 'field_case_craft', 'label' => '使用工艺', 'name' => 'case_craft', 'type' => 'text',
             'instructions' => '用逗号分隔', 'placeholder' => '四色印刷,覆膜,烫金', 'wrapper' => ['width' => '50']],
            ['key' => 'field_case_material', 'label' => '使用材质', 'name' => 'case_material', 'type' => 'text',
             'placeholder' => '铜版纸,合成纸', 'wrapper' => ['width' => '50']],
            ['key' => 'field_case_image_1', 'label' => '案例主图', 'name' => 'case_image_1', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '20']],
            ['key' => 'field_case_image_2', 'label' => '细节图①', 'name' => 'case_image_2', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '20']],
            ['key' => 'field_case_image_3', 'label' => '细节图②', 'name' => 'case_image_3', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '20']],
            ['key' => 'field_case_image_4', 'label' => '成品实拍①', 'name' => 'case_image_4', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '20']],
            ['key' => 'field_case_image_5', 'label' => '成品实拍②', 'name' => 'case_image_5', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '20']],
            ['key' => 'field_case_before', 'label' => 'Before — 原始需求', 'name' => 'case_before', 'type' => 'textarea', 'rows' => 3,
             'instructions' => '描述客户最初的需求或痛点', 'placeholder' => '客户需要一款防水防油的食品标签……', 'wrapper' => ['width' => '50']],
            ['key' => 'field_case_after', 'label' => 'After — 解决方案', 'name' => 'case_after', 'type' => 'textarea', 'rows' => 3,
             'instructions' => '描述你们如何解决问题', 'placeholder' => '采用合成纸覆膜工艺，经过低温测试……', 'wrapper' => ['width' => '50']],
            ['key' => 'field_case_related', 'label' => '关联产品', 'name' => 'case_related', 'type' => 'post_object',
             'post_type' => ['product'], 'multiple' => 1, 'return_format' => 'id', 'instructions' => '选择与此案例相关的产品'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'case']]],
        'menu_order' => 0, 'position' => 'acf_after_title', 'style' => 'seamless',
        'label_placement' => 'top', 'instruction_placement' => 'label',
    ]);

    // 产品字段组
    acf_add_local_field_group([
        'key' => 'group_product_params',
        'title' => '产品规格参数',
        'fields' => [
            ['key' => 'field_product_size', 'label' => '常规尺寸', 'name' => 'product_size', 'type' => 'text',
             'instructions' => '例如：50mm×80mm / 可定制', 'placeholder' => '50mm×80mm / 可定制任意尺寸', 'wrapper' => ['width' => '33']],
            ['key' => 'field_product_moq', 'label' => '最小起订量', 'name' => 'product_moq', 'type' => 'text',
             'instructions' => '例如：1000张 / 1卷起订', 'placeholder' => '1000张', 'wrapper' => ['width' => '33']],
            ['key' => 'field_product_leadtime', 'label' => '交货周期', 'name' => 'product_leadtime', 'type' => 'text',
             'instructions' => '例如：5-7个工作日', 'placeholder' => '5-7个工作日', 'wrapper' => ['width' => '33']],
            ['key' => 'field_product_sample', 'label' => '打样说明', 'name' => 'product_sample', 'type' => 'select',
             'choices' => ['免费打样'=>'免费打样','付费打样'=>'付费打样','支持打样'=>'支持打样（费用另计）','不支持打样'=>'不支持打样'],
             'default_value' => '支持打样', 'wrapper' => ['width' => '33']],
            ['key' => 'field_product_feature_title', 'label' => '卖点标题', 'name' => 'product_feature_title', 'type' => 'text',
             'instructions' => '展示在产品详情顶部', 'placeholder' => '防水防油·耐低温·可追溯', 'wrapper' => ['width' => '33']],
            ['key' => 'field_product_applications', 'label' => '适用场景', 'name' => 'product_applications', 'type' => 'textarea', 'rows' => 3,
             'instructions' => '每行一个，前台以标签展示', 'placeholder' => '食品外包装贴标\n饮料瓶身标签\n冷链产品标签', 'wrapper' => ['width' => '33']],
            ['key' => 'field_product_detail_1', 'label' => '细节图①', 'name' => 'product_detail_1', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '25']],
            ['key' => 'field_product_detail_2', 'label' => '细节图②', 'name' => 'product_detail_2', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '25']],
            ['key' => 'field_product_detail_3', 'label' => '细节图③', 'name' => 'product_detail_3', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '25']],
            ['key' => 'field_product_detail_4', 'label' => '细节图④', 'name' => 'product_detail_4', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'wrapper' => ['width' => '25']],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'product']]],
        'menu_order' => 0, 'position' => 'acf_after_title', 'style' => 'seamless',
        'label_placement' => 'top', 'instruction_placement' => 'label',
    ]);
});

// ===== 首页模块：输出 ACF Options Page 数据 =====
function dflc_option($field, $default = '') {
    return function_exists('get_field') ? get_field($field, 'option') ?: $default : $default;
}

// ===== 获取产品属性 =====
function dflc_product_terms($post_id, $taxonomy) {
    $terms = get_the_terms($post_id, $taxonomy);
    return $terms && !is_wp_error($terms) ? wp_list_pluck($terms, 'name') : [];
}

// ===== 移动端检测 =====
function dflc_is_mobile() {
    if (function_exists('wp_is_mobile') && wp_is_mobile()) return true;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    return (bool) preg_match('/(Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone|Silk)/i', $ua);
}

// ===== 导航激活状态 =====
function dflc_nav_active($path) {
    $current = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($path === '/') return $current === '/';
    return strpos($current, $path) === 0;
}

// ===== Schema.org 结构化数据（Organization + LocalBusiness） =====
add_action('wp_head', function () {
    $schema = [
        '@context'  => 'https://schema.org',
        '@type'     => ['Organization', 'LocalBusiness'],
        '@id'       => home_url('/#organization'),
        'name'      => '青岛东方丽彩包装有限公司',
        'url'       => home_url(),
        'description'=> '专业标签印刷 · 不干胶标签定制 · 防伪标签 · 食品标签 · 化妆品标签',
        'address'   => [
            '@type'           => 'PostalAddress',
            'addressLocality' => '青岛市',
            'addressRegion'   => '山东省',
            'addressCountry'  => 'CN',
        ],
        'contactPoint' => [
            '@type'       => 'ContactPoint',
            'telephone'   => '',
            'contactType' => 'customer service',
            'availableLanguage' => ['Chinese'],
        ],
        'sameAs' => [],
    ];
    echo "\n<script type=\"application/ld+json\">\n" . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n</script>\n";

    // BreadcrumbList schema
    if (function_exists('yoast_breadcrumb') && !is_front_page()) {
        $crumbs = [];
        $crumbs[] = ['@type' => 'ListItem', 'position' => 1, 'name' => '首页', 'item' => home_url()];
        $pos = 2;
        if (is_singular('product')) {
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => '产品中心', 'item' => home_url('/products')];
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title()];
        } elseif (is_singular('case')) {
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => '案例展示', 'item' => home_url('/cases')];
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title()];
        } elseif (is_singular('industry')) {
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => '行业应用', 'item' => home_url('/industries')];
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title()];
        } elseif (is_page()) {
            $crumbs[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title()];
        }
        if (count($crumbs) > 1) {
            echo "\n<script type=\"application/ld+json\">\n" . json_encode(['@context'=>'https://schema.org', '@type'=>'BreadcrumbList', 'itemListElement'=>$crumbs], JSON_UNESCAPED_UNICODE) . "\n</script>\n";
        }
    }
}, 5);

// ===== 注入 robots.txt =====
add_action('init', function () {
    if (!get_option('dflc_robots_set')) {
        update_option('dflc_robots_set', 1);
    }
});
add_filter('robots_txt', function ($output) {
    $sitemap = home_url('/sitemap_index.xml');
    return "User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\nDisallow: /wp-login.php\n\nSitemap: {$sitemap}\n";
}, PHP_INT_MAX);

// ===== 首页 Meta Description =====
add_action('wp_head', function () {
    if (is_front_page()) {
        echo '<meta name="description" content="青岛东方丽彩包装有限公司 — 专业不干胶标签印刷定制专家。提供食品标签、日化标签、防伪标签、卷标等定制服务。铜版纸/PET/PP/合成纸，四色印刷、烫金覆膜UV工艺，小批量起订，快速出货。">' . "\n";
        echo '<meta name="keywords" content="标签印刷,不干胶标签,防伪标签,食品标签,化妆品标签,卷标,青岛标签印刷,东方丽彩">' . "\n";
    }
}, 1);

// ===== WooCommerce 目录模式（隐藏价格、购物车） =====
add_filter('woocommerce_cart_redirect_after_add', '__return_false');
add_filter('woocommerce_is_purchasable', '__return_false');
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_price', 10);
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30);
remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10);
remove_action('woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_price', 10);
remove_action('woocommerce_before_shop_loop', 'woocommerce_result_count', 20);
remove_action('woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30);

// ===== 注册询价 CPT =====
add_action('init', function () {
    register_post_type('inquiry', [
        'labels' => [
            'name' => '询价记录',
            'singular_name' => '询价',
            'add_new' => '添加询价',
            'all_items' => '所有询价记录',
            'edit_item' => '查看询价详情',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-email-alt',
        'menu_position' => 28,
        'supports' => ['title', 'editor'],
        'capability_type' => 'post',
    ]);
});

// ===== 产品详情页显示询价按钮（PC） =====
add_action('woocommerce_single_product_summary', function () {
    $product_id = get_the_ID();
    ?>
    <div class="dflc-inquiry-btn-wrapper" style="margin-top:30px;">
        <button type="button" class="dflc-inquiry-btn" onclick="dflc_open_inquiry(<?php echo $product_id; ?>)">
            📋 立即咨询
        </button>
        <p class="dflc-inquiry-note" style="margin-top:8px; color:#888; font-size:13px;">
            不显示价格 · 提交需求后我们会在24h内联系你
        </p>
    </div>
    <style>
        .dflc-inquiry-btn {
            display: block; width: 100%; max-width: 320px;
            padding: 14px 32px; background: linear-gradient(135deg, #1a73e8, #00a8b5);
            color: #fff; border: none; border-radius: 8px;
            font-size: 18px; font-weight: 600; cursor: pointer;
            transition: all 0.25s; text-align: center;
        }
        .dflc-inquiry-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,115,232,0.4); }
    </style>
    <?php
}, 31);

// ===== 产品归档页显示询价按钮 =====
add_action('woocommerce_after_shop_loop_item', function () {
    $product_id = get_the_ID();
    echo '<a href="' . get_permalink($product_id) . '" class="button dflc-loop-inquiry" style="display:block; text-align:center; margin-top:10px; padding:8px; background:#1a73e8; color:#fff; border-radius:6px; text-decoration:none;">📋 立即咨询</a>';
}, 15);

// ===== 询价表单弹窗模板 =====
add_action('wp_footer', function () {
    $material_tax = get_terms(['taxonomy' => 'pa_cailiao', 'hide_empty' => false]);
    ?>
    <div id="dflc-inquiry-modal" class="dflc-modal" style="display:none;">
        <div class="dflc-modal-overlay" onclick="dflc_close_inquiry()"></div>
        <div class="dflc-modal-content">
            <div class="dflc-modal-header">
                <h3>📋 提交咨询</h3>
                <span class="dflc-modal-close" onclick="dflc_close_inquiry()">✕</span>
            </div>
            <form id="dflc-inquiry-form" onsubmit="return dflc_submit_inquiry(event)">
                <input type="hidden" name="product_id" id="dflc_inquiry_product_id" value="">
                <div class="dflc-form-group">
                    <label>产品名称</label>
                    <input type="text" id="dflc_inquiry_product_name" readonly>
                </div>
                <div class="dflc-form-group">
                    <label><?php echo dflc_t('您的姓名'); ?> <span style="color:red">*</span></label>
                    <input type="text" name="customer_name" required placeholder="<?php echo dflc_t('请填写你的姓名'); ?>">
                </div>
                <div class="dflc-form-row">
                    <div class="dflc-form-group">
                        <label><?php echo dflc_t('联系电话'); ?> <span style="color:red">*</span></label>
                        <input type="tel" name="customer_phone" required placeholder="<?php echo dflc_t('手机号或座机'); ?>">
                    </div>
                    <div class="dflc-form-group">
                        <label>预期数量</label>
                        <input type="text" name="quantity" placeholder="如：10000张">
                    </div>
                </div>
                <div class="dflc-form-group">
                    <label>材质偏好</label>
                    <select name="material">
                        <option value="">请选择（可选）</option>
                        <?php foreach ($material_tax as $term): ?>
                            <option value="<?php echo esc_attr($term->name); ?>"><?php echo esc_html($term->name); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="dflc-form-group">
                    <label>备注需求</label>
                    <textarea name="notes" rows="3" placeholder="请描述你对标签的具体要求，如尺寸、工艺、用途等"></textarea>
                </div>
                <button type="submit" class="dflc-submit-btn">提交咨询</button>
                <p class="dflc-form-note">我们会在24小时内与你联系，你的信息仅用于报价沟通</p>
            </form>
            <div id="dflc-inquiry-success" style="display:none; text-align:center; padding:40px 20px;">
                <div style="font-size:48px; margin-bottom:16px;">✅</div>
                <h3>提交成功！</h3>
                <p>我们会在24小时内与你联系，请保持电话畅通。</p>
                <button onclick="dflc_close_inquiry()" style="margin-top:16px; padding:10px 24px; background:#1a73e8; color:#fff; border:none; border-radius:6px; cursor:pointer;">关闭</button>
            </div>
        </div>
    </div>
    <?php
});

// ===== 询价 AJAX 处理 =====
add_action('wp_ajax_dflc_submit_inquiry', 'dflc_handle_inquiry');
add_action('wp_ajax_nopriv_dflc_submit_inquiry', 'dflc_handle_inquiry');

function dflc_handle_inquiry() {
    check_ajax_referer('dflc_inquiry_nonce', 'nonce');

    $product_id  = intval($_POST['product_id']);
    $name        = sanitize_text_field($_POST['customer_name']);
    $phone       = sanitize_text_field($_POST['customer_phone']);
    $quantity    = sanitize_text_field($_POST['quantity']);
    $material    = sanitize_text_field($_POST['material']);
    $notes       = sanitize_textarea_field($_POST['notes']);

    $product_title = get_the_title($product_id) ?: '未指定产品';
    $title = "{$name} — 咨询「{$product_title}」";

    $content = "客户姓名：{$name}\n";
    $content .= "联系电话：{$phone}\n";
    $content .= "咨询产品：{$product_title}\n";
    $content .= "预期数量：{$quantity}\n";
    $content .= "材质偏好：{$material}\n";
    $content .= "备注需求：{$notes}\n";
    $content .= "提交时间：" . current_time('Y-m-d H:i:s') . "\n";
    $content .= "来源IP：" . $_SERVER['REMOTE_ADDR'] . "\n";

    $inquiry_id = wp_insert_post([
        'post_type'   => 'inquiry',
        'post_title'  => $title,
        'post_content'=> $content,
        'post_status' => 'publish',
    ]);

    if ($inquiry_id) {
        $admin_email = get_option('admin_email');
        $subject = "【东方丽彩】新询价 - {$product_title}";
        $message = "收到一条新的询价：\n\n{$content}\n\n查看详情：". admin_url("post.php?post={$inquiry_id}&action=edit");
        wp_mail($admin_email, $subject, $message);

        wp_send_json_success(['message' => '提交成功']);
    } else {
        wp_send_json_error(['message' => '提交失败，请稍后重试']);
    }
}

// ===== 询价表单 JS（内联） =====
add_action('wp_footer', function () {
    $ajax_url = admin_url('admin-ajax.php');
    $nonce = wp_create_nonce('dflc_inquiry_nonce');
    ?>
    <script>
    function dflc_open_inquiry(productId) {
        document.getElementById('dflc_inquiry_product_id').value = productId;
        var titleEl = document.querySelector('.product_title.entry-title');
        document.getElementById('dflc_inquiry_product_name').value = titleEl ? titleEl.textContent.trim() : '';
        document.getElementById('dflc-inquiry-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function dflc_close_inquiry() {
        document.getElementById('dflc-inquiry-modal').style.display = 'none';
        document.body.style.overflow = '';
        document.getElementById('dflc-inquiry-form').style.display = 'block';
        document.getElementById('dflc-inquiry-success').style.display = 'none';
    }
    async function dflc_submit_inquiry(e) {
        e.preventDefault();
        var form = document.getElementById('dflc-inquiry-form');
        var data = new FormData(form);
        data.append('action', 'dflc_submit_inquiry');
        data.append('nonce', '<?php echo $nonce; ?>');
        try {
            var resp = await fetch('<?php echo $ajax_url; ?>', {method:'POST', body:data});
            var json = await resp.json();
            if (json.success) {
                form.style.display = 'none';
                document.getElementById('dflc-inquiry-success').style.display = 'block';
            } else {
                alert(json.data.message || '提交失败');
            }
        } catch(e) {
            alert('网络错误，请稍后重试');
        }
    }
    </script>
    <style>
    .dflc-modal { display:flex; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; align-items:center; justify-content:center; }
    .dflc-modal-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); }
    .dflc-modal-content { position:relative; background:#fff; border-radius:12px; width:90%; max-width:500px; max-height:85vh; overflow-y:auto; z-index:1; }
    .dflc-modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #eee; }
    .dflc-modal-header h3 { margin:0; font-size:18px; }
    .dflc-modal-close { cursor:pointer; font-size:22px; color:#999; }
    .dflc-modal-close:hover { color:#333; }
    #dflc-inquiry-form { padding:20px; }
    .dflc-form-group { margin-bottom:14px; }
    .dflc-form-group label { display:block; margin-bottom:4px; font-size:14px; font-weight:500; color:#333; }
    .dflc-form-group input, .dflc-form-group select, .dflc-form-group textarea {
        width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:14px;
        box-sizing:border-box; transition:border-color 0.2s;
    }
    .dflc-form-group input:focus, .dflc-form-group select:focus, .dflc-form-group textarea:focus {
        outline:none; border-color:#1a73e8; box-shadow:0 0 0 3px rgba(26,115,232,0.1);
    }
    .dflc-form-row { display:flex; gap:12px; }
    .dflc-form-row .dflc-form-group { flex:1; }
    .dflc-submit-btn {
        display:block; width:100%; padding:12px; background:linear-gradient(135deg, #1a73e8, #00a8b5);
        color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; margin-top:8px;
    }
    .dflc-submit-btn:hover { opacity:0.9; }
    .dflc-form-note { text-align:center; color:#999; font-size:12px; margin-top:12px; }
    @media (max-width:480px) { .dflc-form-row { flex-direction:column; gap:0; } }
    </style>
    <?php
}, 20);

// ============================================================
// 后台管理界面 — 业务人员定制
// ============================================================

// --- 加载后台品牌 CSS ---
add_action('admin_enqueue_scripts', function () {
    wp_enqueue_style('dflc-admin', get_template_directory_uri() . '/assets/css/admin.css', [], '1.1');
});

// --- 修改内容后强制同步前后台（多钩子兜底） ---
// --- 修改内容后强制同步前后台（多钩子兜底） ---

// 调试：记录保存前的实际内容
add_filter('wp_insert_post_data', function ($data, $postarr) {
    if ($data['post_type'] === 'page' && isset($postarr['ID']) && $postarr['ID'] == 52) {
        $old = get_post_field('post_content', $postarr['ID']);
        $new = $data['post_content'];
        $same = ($old === $new) ? 'SAME' : 'CHANGED';
        error_log(sprintf('[DFLC DEBUG] page 52 save | old_len=%d new_len=%d | %s | user=%s | source=%s',
            strlen($old), strlen($new), $same,
            wp_get_current_user()->user_login,
            defined('REST_REQUEST') && REST_REQUEST ? 'REST' : 'CLASSIC'
        ));
        error_log('[DFLC DEBUG] OLD: ' . substr($old, 0, 200));
        error_log('[DFLC DEBUG] NEW: ' . substr($new, 0, 200));
    }
    return $data;
}, 1, 2);

function dflc_clear_all_caches($post_id) {
    // 跳过自动保存和修订版本
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)) return;
    if (wp_is_post_revision($post_id)) return;
    if (wp_is_post_autosave($post_id)) return;
    
    // 只对公开的页面/文章生效
    $post_type = get_post_type($post_id);
    if (!in_array($post_type, ['page', 'post', 'product'])) return;
    
    // 1. 清 W3 Total Cache（全量）
    if (function_exists('w3tc_flush_all')) {
        w3tc_flush_all();
    }
    if (function_exists('w3tc_flush_post')) {
        w3tc_flush_post($post_id);
    }
    
    // 2. 清 WP Object Cache
    wp_cache_flush();
    
    // 3. 清 W3TC 磁盘页面缓存
    $cache_dir = WP_CONTENT_DIR . '/cache/page_enhanced';
    if (is_dir($cache_dir)) {
        $files = array_merge(
            glob("$cache_dir/**/*.html") ?: [],
            glob("$cache_dir/**/*.html_gzip") ?: [],
            glob("$cache_dir/*.html") ?: []
        );
        foreach ($files as $f) { @unlink($f); }
    }
    
    // 4. 清 W3TC 数据库缓存目录
    $db_cache = WP_CONTENT_DIR . '/cache/db';
    if (is_dir($db_cache)) {
        $db_files = glob("$db_cache/**/*.php") ?: [];
        foreach ($db_files as $f) { @unlink($f); }
    }
    
    // 5. 清除页面相关的 transients
    delete_transient('dflc_page_' . $post_id);
    delete_transient('dflc_about_content');
    
    // 6. 强制刷新 OPcache（如果可能）
    if (function_exists('opcache_reset')) {
        @opcache_reset();
    }
    
    // 7. 记录日志便于排查
    error_log(sprintf('[DFLC] 缓存已清除 | post_id=%d | type=%s | time=%s', 
        $post_id, $post_type, current_time('mysql')));
}
add_action('save_post', 'dflc_clear_all_caches', 999);
add_action('post_updated', 'dflc_clear_all_caches', 999);
add_action('wp_after_insert_post', 'dflc_clear_all_caches', 999);

// --- 强制前后台页面不被浏览器缓存 ---
add_action('send_headers', function () {
    if (is_admin() || is_user_logged_in()) return; // 后台/登录用户不限制
    // 对可编辑页面发送 nocache 头
    if (is_page() || is_single() || is_singular('product')) {
        header('Cache-Control: no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: Wed, 11 Jan 1984 05:00:00 GMT');
    }
});

// --- 后台编辑页显示最后清除时间（调试用） ---
add_action('admin_notices', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'post') return;
    global $post;
    if (!$post) return;
    $modified = get_post_modified_time('Y-m-d H:i:s', false, $post);
    echo '<div class="notice notice-info is-dismissible" style="font-size:13px;"><p>';
    echo '📝 最后修改：<strong>' . $modified . '</strong> · ';
    echo '修改保存后前端立即生效（已清除所有缓存）';
    echo '</p></div>';
});

// --- 登录页品牌定制 ---
add_action('login_enqueue_scripts', function () {
    ?>
    <style>
        body.login { background: #f1f5f9; }
        .login h1 a {
            background-image: none !important;
            width: auto; height: auto; text-indent: 0;
            font-size: 22px; font-weight: 700; color: #153e5e; text-decoration: none;
        }
        .login #nav a, .login #backtoblog a { color: #1e6b9e; }
        .login #nav a:hover, .login #backtoblog a:hover { color: #14b8a6; }
        .login .button-primary { background: #1e6b9e; border-color: #153e5e; }
        .login .button-primary:hover { background: #14b8a6; border-color: #0d9488; }
        .login .message { border-left-color: #14b8a6; }
    </style>
    <?php
});
add_filter('login_headertext', function () { return '青岛东方丽彩包装有限公司'; });
add_filter('login_headerurl', function () { return home_url(); });

// --- 创建「业务专员」角色 ---
add_action('init', function () {
    if (!get_role('sales_specialist')) {
        add_role('sales_specialist', '业务专员', [
            'read'                   => true,
            'edit_posts'             => true,
            'edit_pages'             => true,
            'edit_others_posts'      => true,
            'edit_others_pages'      => true,
            'edit_published_posts'   => true,
            'edit_published_pages'   => true,
            'publish_posts'          => true,
            'publish_pages'          => true,
            'delete_posts'           => true,
            'delete_pages'           => true,
            'delete_others_posts'    => true,
            'delete_others_pages'    => true,
            'delete_published_posts' => true,
            'delete_published_pages' => true,
            'upload_files'           => true,
            'manage_categories'      => true,
        ]);
    }
    // 补充 WooCommerce 产品管理权限
    $role = get_role('sales_specialist');
    if ($role) {
        $wc_caps = [
            'manage_woocommerce',
            'edit_product', 'read_product', 'delete_product',
            'edit_products', 'edit_others_products', 'edit_published_products',
            'publish_products', 'delete_products', 'delete_others_products',
            'delete_published_products', 'manage_product_terms',
            'edit_product_terms', 'delete_product_terms', 'assign_product_terms',
        ];
        foreach ($wc_caps as $cap) {
            $role->add_cap($cap);
        }
    }
});

// --- 后台菜单清理（非管理员用户） ---
add_action('admin_menu', function () {
    if (current_user_can('administrator')) return;

    // 移除不需要的顶级菜单
    remove_menu_page('edit-comments.php');
    remove_menu_page('themes.php');
    remove_menu_page('plugins.php');
    remove_menu_page('users.php');
    remove_menu_page('tools.php');
    remove_menu_page('options-general.php');
    remove_menu_page('edit.php?post_type=page'); // 页面 → 改为独立链接

    // 移除插件菜单
    remove_menu_page('wpseo_dashboard');
    remove_menu_page('wpseo_workouts');
    remove_menu_page('wordfence');
    remove_menu_page('w3tc_dashboard');
    remove_menu_page('edit.php?post_type=acf-field-group');
    remove_menu_page('cptui_main_menu');
    remove_menu_page('wp-mail-smtp');
    remove_menu_page('ninja-forms');
    remove_menu_page('akismet');
    remove_menu_page('admin-menu-editor-iframe');

    // 清理 WooCommerce 子菜单
    remove_submenu_page('woocommerce', 'woocommerce');
    remove_submenu_page('woocommerce', 'wc-admin');
    remove_submenu_page('woocommerce', 'wc-admin&path=/analytics/overview');
    remove_submenu_page('woocommerce', 'wc-reports');
    remove_submenu_page('woocommerce', 'wc-settings');
    remove_submenu_page('woocommerce', 'wc-status');
    remove_submenu_page('woocommerce', 'wc-addons');
    remove_submenu_page('woocommerce', 'edit.php?post_type=shop_order');
    remove_submenu_page('woocommerce', 'edit.php?post_type=shop_coupon');
    remove_submenu_page('woocommerce', 'admin.php?page=wc-admin&path=/marketing');
    remove_submenu_page('woocommerce', 'admin.php?page=wc-admin&path=/customers');
    remove_submenu_page('woocommerce', 'admin.php?page=wc-admin');

    // WooCommerce 产品子菜单保留：所有产品、添加、分类、标签、属性
    remove_submenu_page('edit.php?post_type=product', 'product_attributes');
    add_submenu_page(
        'edit.php?post_type=product', '产品属性', '属性',
        'manage_product_terms', 'edit.php?post_type=product&page=product_attributes'
    );

    // 文章子菜单：移除分类/标签
    remove_submenu_page('edit.php', 'edit-tags.php?taxonomy=category');
    remove_submenu_page('edit.php', 'edit-tags.php?taxonomy=post_tag');

    // ===== 添加前台导航栏对应的独立菜单项 =====
    add_menu_page(
        '首页', '首页', 'edit_pages', 'dflc-edit-home',
        function () { wp_redirect(admin_url('post.php?post=30&action=edit')); exit; },
        'dashicons-admin-home', 24
    );
    add_menu_page(
        '生产实力', '生产实力', 'edit_pages', 'dflc-edit-production',
        function () { wp_redirect(admin_url('post.php?post=130&action=edit')); exit; },
        'dashicons-building', 26
    );
    add_menu_page(
        '关于我们', '关于我们', 'edit_pages', 'dflc-edit-about',
        function () { wp_redirect(admin_url('post.php?post=52&action=edit')); exit; },
        'dashicons-info-outline', 27
    );
    add_menu_page(
        '人才招聘', '人才招聘', 'edit_pages', 'dflc-edit-jobs',
        function () { wp_redirect(admin_url('post.php?post=123&action=edit')); exit; },
        'dashicons-groups', 28
    );
    add_menu_page(
        '联系我们', '联系我们', 'edit_pages', 'dflc-edit-contact',
        function () { wp_redirect(admin_url('post.php?post=54&action=edit')); exit; },
        'dashicons-phone', 29
    );
    add_menu_page(
        '在线报价', '在线报价', 'edit_pages', 'dflc-quote-tool',
        function () { wp_redirect('http://39.106.169.147:8088/admin/'); exit; },
        'dashicons-calculator', 30
    );
}, 999);

// --- 重命名菜单以匹配前台导航（非管理员） ---
add_action('admin_menu', function () {
    if (current_user_can('administrator')) return;
    global $menu, $submenu;

    foreach ($menu as $k => $v) {
        // WooCommerce → 主营产品
        if ($v[2] === 'edit.php?post_type=product') {
            $menu[$k][0] = '主营产品';
        }
        // 文章 → 行业资讯
        if ($v[2] === 'edit.php') {
            $menu[$k][0] = '行业资讯';
            $menu[$k][6] = 'dashicons-media-document';
        }
        // 案例展示 → 隐藏（不在前台导航中）
        if ($v[2] === 'edit.php?post_type=case') {
            unset($menu[$k]);
        }
    }

    // 重命名子菜单
    if (isset($submenu['edit.php'])) {
        foreach ($submenu['edit.php'] as $k => $v) {
            if ($v[2] === 'edit.php') $submenu['edit.php'][$k][0] = '所有资讯';
            if ($v[2] === 'post-new.php') $submenu['edit.php'][$k][0] = '发布资讯';
        }
    }
}, 1000);

// --- 管理栏 +新建 重命名 ---
add_action('admin_bar_menu', function ($wp_admin_bar) {
    if (current_user_can('administrator')) return;
    $node = $wp_admin_bar->get_node('new-post');
    if ($node) {
        $node->title = '发布资讯';
        $wp_admin_bar->add_node((array)$node);
    }
    // 隐藏新建页面
    $wp_admin_bar->remove_node('new-page');
    // 隐藏案例
    $wp_admin_bar->remove_node('new-case');
}, 999);

// --- 移除 Yoast SEO 的 Newsletter 仪表盘小部件 ---
add_action('wp_dashboard_setup', function () {
    global $wp_meta_boxes;
    // 移除不需要的仪表盘小部件
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_activity']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_site_health']);
    unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press']);
    unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_primary']);
    // Yoast SEO
    unset($wp_meta_boxes['dashboard']['normal']['core']['wpseo-dashboard-overview']);
    // WooCommerce
    unset($wp_meta_boxes['dashboard']['normal']['core']['woocommerce_dashboard_status']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['wc_admin_dashboard_setup']);
    // Wordfence
    unset($wp_meta_boxes['dashboard']['normal']['core']['wordfence_activity_report_widget']);
}, 999);

// --- 后台页脚文字 ---
add_filter('admin_footer_text', function () {
    return '青岛东方丽彩包装有限公司 · 专业标签与包装印刷服务商';
});

// --- 隐藏后台顶部「关于 WordPress」下拉 ---
add_action('admin_bar_menu', function ($wp_admin_bar) {
    $wp_admin_bar->remove_node('wp-logo');
    if (!current_user_can('administrator')) {
        $wp_admin_bar->remove_node('comments');
        $wp_admin_bar->remove_node('new-content');
        $wp_admin_bar->remove_node('updates');
    }
}, 999);

// ===== 主题风格切换（外观 → 主题风格） =====
add_action('admin_menu', function () {
    add_menu_page(
        '主题风格', '主题风格',
        'edit_pages', 'dflc-theme-style',
        'dflc_theme_style_page',
        'dashicons-admin-appearance', 60
    );
});

add_action('admin_init', function () {
    register_setting('dflc_theme_style_group', 'dflc_theme_style', [
        'default' => 'default',
        'sanitize_callback' => function ($val) {
            return in_array($val, ['default', 'theme-a', 'theme-b', 'theme-c', 'theme-d']) ? $val : 'default';
        }
    ]);
});

function dflc_theme_style_page() {
    $current = get_option('dflc_theme_style', 'default');

    $themes = [
        'default' => ['name' => '默认 · 蓝青', 'desc' => '当前使用的配色方案'],
        'theme-a' => ['name' => '方案A · 深蓝金', 'desc' => '高端商务，适合大客户洽谈与招投标场景'],
        'theme-b' => ['name' => '方案B · 红陶暖橙', 'desc' => '质感厚重，突出精品包装与酒类标签'],
        'theme-c' => ['name' => '方案C · 墨绿铜', 'desc' => '自然质感，适合环保包装与食品标签'],
        'theme-d' => ['name' => '方案D · 天蓝珊瑚', 'desc' => '清新明亮，天蓝主色搭配珊瑚橙点缀'],
    ];

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['dflc_theme_style'])) {
        update_option('dflc_theme_style', $_POST['dflc_theme_style']);
        if (function_exists('w3tc_flush_all')) { w3tc_flush_all(); }
        wp_cache_flush();
        echo '<div class="notice notice-success is-dismissible"><p>主题风格已切换，请刷新前台查看效果。</p></div>';
        $current = $_POST['dflc_theme_style'];
    }

    $colors = [
        'default' => ['#1e6b9e', '#14b8a6'],
        'theme-a' => ['#0f2b46', '#c9a84c'],
        'theme-b' => ['#7c2d12', '#d97706'],
        'theme-c' => ['#064e3b', '#b45309'],
        'theme-d' => ['#0284c7', '#f97316'],
    ];
    ?>
    <div class="wrap">
        <h1>🎨 主题风格</h1>
        <p>选择一套配色方案，前台立即生效。切换后自动清除缓存。</p>
        <form method="post">
            <?php settings_fields('dflc_theme_style_group'); ?>
            <div style="display:grid;gap:16px;margin:24px 0;max-width:720px">
                <?php foreach ($themes as $key => $t):
                    $c = $colors[$key]; ?>
                <label style="display:flex;align-items:center;gap:16px;padding:18px 20px;
                    background:<?php echo $key === $current ? '#eef7fc' : '#fff'; ?>;
                    border:2px solid <?php echo $key === $current ? '#1e6b9e' : '#e2e8f0'; ?>;
                    border-radius:12px;cursor:pointer;transition:all .2s">
                    <input type="radio" name="dflc_theme_style" value="<?php echo $key; ?>"
                        <?php checked($current, $key); ?>
                        style="width:18px;height:18px;accent-color:#1e6b9e;flex-shrink:0">
                    <div style="display:flex;align-items:center;gap:10px;flex:1">
                        <div style="display:flex;gap:0">
                            <div style="width:24px;height:24px;background:<?php echo $c[0]; ?>;border-radius:6px 0 0 6px"></div>
                            <div style="width:24px;height:24px;background:<?php echo $c[1]; ?>;border-radius:0 6px 6px 0"></div>
                        </div>
                        <div>
                            <strong style="font-size:15px"><?php echo $t['name']; ?></strong>
                            <p style="margin:4px 0 0;color:#64748b;font-size:13px"><?php echo $t['desc']; ?></p>
                        </div>
                    </div>
                </label>
                <?php endforeach; ?>
            </div>
            <p class="submit">
                <button type="submit" class="button button-primary" style="padding:6px 28px;font-size:15px">保存切换</button>
            </p>
        </form>
    </div>
    <?php
}
