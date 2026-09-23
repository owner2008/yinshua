<?php
/**
 * Template Name: 产品中心（带展开侧边栏）
 * URL: /products/?cat=大类&sub=子类
 * 数据源：WooCommerce 商品分类（product_cat）
 */

// 从 WooCommerce 动态拉取分类树
$all_cats = [];
$parent_cats = get_terms([
    'taxonomy' => 'product_cat',
    'parent'   => 0,
    'hide_empty' => false,
    'exclude'  => [get_option('default_product_cat')], // 排除 Uncategorized
    'lang'     => '',  // 跳过 Polylang 语言过滤（product_cat 未关联语言）
]);

foreach ($parent_cats as $parent) {
    $sub_terms = get_terms([
        'taxonomy' => 'product_cat',
        'parent'   => $parent->term_id,
        'hide_empty' => false,
        'lang'     => '',  // 跳过 Polylang 语言过滤
    ]);
    $subs = [];
    foreach ($sub_terms as $sub) {
        $subs[$sub->slug] = $sub->name;
    }
    $all_cats[$parent->slug] = [
        'title' => $parent->name,
        'icon'  => get_term_meta($parent->term_id, 'cat_icon', true) ?: '📦',
        'subs'  => $subs,
        'term_id' => $parent->term_id,
    ];
}

// 按指定顺序排列分类：标签印刷 → 宣传物料印刷 → 包装盒印刷 → 纸制品印刷
$cat_order = ['label-printing', 'marketing-materials', 'box-packaging', 'paper-products'];
$sorted = [];
foreach ($cat_order as $slug) {
    if (isset($all_cats[$slug])) {
        $sorted[$slug] = $all_cats[$slug];
    }
}
// 追加任何不在指定顺序中的分类
foreach ($all_cats as $slug => $data) {
    if (!isset($sorted[$slug])) {
        $sorted[$slug] = $data;
    }
}
$all_cats = $sorted;

if (empty($all_cats)) {
    // 兜底：如果没有任何分类，用硬编码默认值
    $all_cats = [
        'label-printing' => ['title' => dflc_t('标签印刷'), 'icon' => '🏷️', 'subs' => ['food-beverage' => dflc_t('食品饮料标签')]],
    ];
}

// 当前选中的分类和子类
$active_cat = $_GET['cat'] ?? '';
$active_sub = $_GET['sub'] ?? '';

// 如果没指定，默认展开第一个分类
if (!$active_cat || !isset($all_cats[$active_cat])) {
    $active_cat = 'label-printing';
}
$cat_data = $all_cats[$active_cat];

// 如果没指定子类，默认第一个
if (!$active_sub || !isset($cat_data['subs'][$active_sub])) {
    $keys = array_keys($cat_data['subs']);
    $active_sub = $keys[0];
}
$sub_name = $cat_data['subs'][$active_sub];
$img_base = home_url('/wp-content/uploads/products/');

// === H5 ===
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    ?>
    <div class="section" style="padding-top:16px">
      <div class="px">
        <div class="section-heading"><?php echo $cat_data['title']; ?> · <?php echo $sub_name; ?></div>
        <!-- 分类切换 -->
        <nav style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
          <?php foreach ($all_cats as $ck => $cv): ?>
          <a href="?cat=<?php echo $ck; ?>" style="padding:6px 14px;border-radius:20px;font-size:.75rem;font-weight:600;text-decoration:none;
            <?php echo $ck === $active_cat ? 'background:var(--primary);color:#fff;' : 'background:var(--blue-50);color:var(--primary);'; ?>">
            <?php echo $cv['icon'] . ' ' . $cv['title']; ?>
          </a>
          <?php endforeach; ?>
        </nav>
        <!-- 子类切换 -->
        <nav style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;">
          <?php foreach ($cat_data['subs'] as $sk => $sv): ?>
          <a href="?cat=<?php echo $active_cat; ?>&sub=<?php echo $sk; ?>" style="padding:4px 10px;border-radius:16px;font-size:.7rem;text-decoration:none;
            <?php echo $sk === $active_sub ? 'background:var(--accent);color:#fff;' : 'background:#fff;color:var(--gray-500);border:1px solid var(--gray-200);'; ?>">
            <?php echo $sv; ?>
          </a>
          <?php endforeach; ?>
        </nav>
      </div>
      <!-- 产品图片 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px;">
        <?php for ($i = 1; $i <= 4; $i++): ?>
        <div style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);">
          <div style="height:150px;background:#f8fafc;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            <img src="<?php echo $img_base . $active_cat . '/' . $active_sub . ($i > 1 ? '-' . $i : '') . '.jpg'; ?>" alt="<?php echo $sub_name; ?>" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:2rem>📦</span>'">
          </div>
        </div>
        <?php endfor; ?>
      </div>
    </div>
    <?php
    include get_template_directory() . '/h5/footer.php';
    return;
endif;

get_header(); ?>

<section class="product-catalog-page" style="padding-top:100px;padding-bottom:60px;">
  <div class="container" style="display:flex;gap:40px;">

    <!-- ===== 左侧导航 ===== -->
    <aside class="catalog-sidebar">
      <h2 class="catalog-sidebar-title"><?php echo dflc_t('产品中心'); ?></h2>
      
      <?php foreach ($all_cats as $ck => $cv): 
        $is_open = ($ck === $active_cat);
      ?>
      <div class="catalog-cat-group <?php echo $is_open ? 'open' : ''; ?>">
        <button class="catalog-cat-toggle" onclick="this.parentElement.classList.toggle('open')">
          <span class="catalog-cat-icon"><?php echo $cv['icon']; ?></span>
          <span class="catalog-cat-label"><?php echo $cv['title']; ?></span>
          <span class="catalog-cat-arrow">▾</span>
        </button>
        <div class="catalog-sub-list">
          <?php foreach ($cv['subs'] as $sk => $sv):
            $is_active = ($ck === $active_cat && $sk === $active_sub);
          ?>
          <a href="?cat=<?php echo $ck; ?>&sub=<?php echo $sk; ?>" 
             class="catalog-sub-link <?php echo $is_active ? 'active' : ''; ?>">
            <?php echo $sv; ?>
          </a>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </aside>

    <!-- ===== 右侧内容 ===== -->
    <main class="catalog-main" style="flex:1;">
      <div class="section-title" style="margin-bottom:8px;">
        <span class="en"><?php echo $cat_data['title']; ?></span>
        <span class="cn"><?php echo $sub_name; ?></span>
        <span class="line"></span>
      </div>
      <p style="color:var(--gray-400);font-size:.85rem;margin-bottom:24px;">
        <?php echo $cat_data['title']; ?> — <?php echo $sub_name; ?> · <?php echo dflc_t('精选产品展示'); ?>
      </p>
      
      <div class="catalog-grid">
        <?php for ($i = 1; $i <= 4; $i++): ?>
        <div class="catalog-card">
          <div class="catalog-thumb">
            <img src="<?php echo $img_base . $active_cat . '/' . $active_sub . ($i > 1 ? '-' . $i : '') . '.jpg'; ?>" 
                 alt="<?php echo $sub_name; ?>" loading="lazy"
                 onerror="this.style.display='none';this.parentElement.innerHTML='<div style=display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem>📦</div>'">
          </div>
          <div class="catalog-info">
            <h3><?php echo $sub_name . ($i > 1 ? ' ' . $i : ''); ?></h3>
            <p><?php echo $cat_data['title']; ?> — <?php echo dflc_t('青岛东方丽彩'); ?></p>
          </div>
        </div>
        <?php endfor; ?>
      </div>
    </main>

  </div>
</section>

<?php get_footer(); ?>
