<?php
/**
 * Template Name: 产品分类页
 * 左边子类导航 + 右边产品网格
 */

// 从页面 slug 获取当前分类
$cat_slug = get_post_field('post_name', get_the_ID());

// 分类数据定义
$categories = [
    'label-printing' => [
        'title' => '标签印刷',
        'subs' => [
            '食品饮料标签' => 'food-beverage',
            '酒水标签' => 'wine-liquor',
            '日化化妆品标签' => 'cosmetics',
            '医药标签' => 'pharmaceutical',
            '电子电器标签' => 'electronics',
            '物流条码标签' => 'logistics-barcode',
            '防伪标签' => 'anti-counterfeit',
            '特种标签' => 'specialty',
            '卷筒不干胶标签' => 'roll-adhesive',
            '定制异形标签' => 'custom-shape',
        ],
    ],
    'box-packaging' => [
        'title' => '包装盒印刷',
        'subs' => [
            '白卡纸盒' => 'white-cardboard-box',
            '瓦楞纸盒' => 'corrugated-box',
            '彩盒包装' => 'color-box',
            '礼品盒' => 'gift-box',
            '食品包装盒' => 'food-box',
            '化妆品包装盒' => 'cosmetic-box',
            '药品包装盒' => 'medicine-box',
            '电子产品包装盒' => 'electronic-box',
        ],
    ],
    'marketing-materials' => [
        'title' => '宣传物料印刷',
        'subs' => [
            '企业画册' => 'company-brochure',
            '产品画册' => 'product-catalog',
            '宣传册' => 'promotional-booklet',
            '折页单页' => 'flyer-leaflet',
            '海报' => 'poster',
            '说明书' => 'manual',
            '吊牌' => 'hang-tag',
            '合格证' => 'certificate',
        ],
    ],
    'paper-products' => [
        'title' => '纸制品印刷',
        'subs' => [
            '手提袋' => 'hand-bag',
            '纸袋' => 'paper-bag',
            '纸杯' => 'paper-cup',
            '杯套' => 'cup-sleeve',
            '台卡' => 'table-card',
            '档案袋' => 'file-folder',
            '信封信纸' => 'envelope-letter',
        ],
    ],
];

$cat_data = $categories[$cat_slug] ?? null;
if (!$cat_data) {
    // 不存在的分类，回退到产品归档页
    get_header();
    echo '<section style="padding:120px 0"><div class="container"><h2>分类未找到</h2><p>请返回 <a href="' . home_url('/products/') . '">产品中心</a></p></div></section>';
    get_footer();
    return;
}

if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    ?>
    <div class="section" style="padding-top:16px">
        <div class="px">
            <div class="section-heading"><?php echo $cat_data['title']; ?></div>
            <nav style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">
                <?php foreach ($cat_data['subs'] as $name => $slug): ?>
                <a href="#sub-<?php echo $slug; ?>" style="padding:6px 14px;background:var(--blue-50);border-radius:20px;font-size:.78rem;color:var(--primary);text-decoration:none;"><?php echo $name; ?></a>
                <?php endforeach; ?>
            </nav>
        </div>
        <?php foreach ($cat_data['subs'] as $name => $slug): ?>
        <div class="section" id="sub-<?php echo $slug; ?>" style="padding:12px 0">
            <div class="px">
                <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:12px;color:var(--text);"><?php echo $name; ?></h3>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;">
                <?php for ($hi = 1; $hi <= 4; $hi++): ?>
                <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
                    <div style="height:140px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;">
                        <img src="<?php echo home_url('/wp-content/uploads/products/' . $cat_slug . '/' . $slug . ($hi > 1 ? '-' . $hi : '') . '.jpg'); ?>" alt="<?php echo $name; ?>" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:2rem>📦</span>'">
                    </div>
                    <div style="padding:10px 12px;">
                        <p style="font-size:.8rem;font-weight:500;color:var(--text);text-align:center;"><?php echo $name . ($hi > 1 ? ' ' . $hi : ''); ?></p>
                    </div>
                </div>
                <?php endfor; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php
    include get_template_directory() . '/h5/footer.php';
    return;
endif;

get_header(); ?>

<section class="product-category-page">
  <div class="container" style="display:flex;gap:40px;">
    
    <!-- 左边子类导航 -->
    <aside class="cat-sidebar">
      <h2 class="cat-sidebar-title"><?php echo $cat_data['title']; ?></h2>
      <nav class="cat-sidebar-nav">
        <?php foreach ($cat_data['subs'] as $name => $slug): ?>
        <a href="#sub-<?php echo $slug; ?>" class="cat-sidebar-link"><?php echo $name; ?></a>
        <?php endforeach; ?>
      </nav>
    </aside>

    <!-- 右边内容 -->
    <main class="cat-main" style="flex:1;">
      <div class="section-title" style="margin-bottom:24px;">
        <span class="en">Products</span>
        <span class="cn"><?php echo $cat_data['title']; ?></span>
        <span class="line"></span>
      </div>

      <?php foreach ($cat_data['subs'] as $name => $slug): ?>
      <div class="subcat-section" id="sub-<?php echo $slug; ?>" style="margin-bottom:40px;">
        <h3 class="subcat-heading"><?php echo $name; ?></h3>
        <div class="subcat-grid">
          <?php for ($i = 1; $i <= 4; $i++): ?>
          <div class="subcat-card">
            <div class="subcat-thumb">
              <img src="<?php echo home_url('/wp-content/uploads/products/' . $cat_slug . '/' . $slug . ($i > 1 ? '-' . $i : '') . '.jpg'); ?>" alt="<?php echo $name; ?>" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem>📦</div>'">
            </div>
            <p class="subcat-label"><?php echo $name . ($i > 1 ? ' ' . $i : ''); ?></p>
          </div>
          <?php endfor; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </main>

  </div>
</section>

<?php get_footer(); ?>
