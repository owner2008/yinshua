<?php
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/case-single.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;
get_header(); ?>

<?php while (have_posts()) : the_post();
    $case_id = get_the_ID();
    $client    = get_post_meta($case_id, 'case_client', true);
    $craft     = get_post_meta($case_id, 'case_craft', true);
    $material  = get_post_meta($case_id, 'case_material', true);
    $industry  = get_post_meta($case_id, 'case_industry', true);
    $before    = get_post_meta($case_id, 'case_before', true);
    $after     = get_post_meta($case_id, 'case_after', true);
    $related   = get_post_meta($case_id, 'case_related', true) ?: [];

    // 收集案例图片
    $images = [];
    for ($i = 1; $i <= 5; $i++) {
        $img = get_post_meta($case_id, "case_image_{$i}", true);
        if ($img) $images[] = $img;
    }
    if (!$images && has_post_thumbnail()) {
        $images[] = get_the_post_thumbnail_url($case_id, 'large');
    }
?>

<section id="case-hero" style="padding-top: 120px;">
  <div class="container" style="max-width: 1100px;">

    <!-- 面包屑 -->
    <div style="margin-bottom: 24px; font-size: 0.875rem; color: var(--text-muted);">
      <a href="<?php echo home_url(); ?>" style="color: var(--text-muted);"><?php echo dflc_t('首页'); ?></a>
      &nbsp;›&nbsp;
      <a href="<?php echo home_url('/cases/'); ?>" style="color: var(--text-muted);"><?php echo dflc_t('案例展示'); ?></a>
      &nbsp;›&nbsp;
      <span style="color: var(--primary);"><?php the_title(); ?></span>
    </div>

    <!-- 标题 + 标签 -->
    <h1 style="font-size: 2rem; margin: 0 0 16px 0;"><?php the_title(); ?></h1>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px;">
      <?php if ($industry): ?>
        <span style="background: #eff6ff; color: #1a73e8; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem;">🏭 <?php echo esc_html($industry); ?></span>
      <?php endif; ?>
      <?php if ($material): ?>
        <span style="background: #f0fdf4; color: #16a34a; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem;">📄 <?php echo esc_html($material); ?></span>
      <?php endif; ?>
      <?php if ($client): ?>
        <span style="background: #fef3c7; color: #d97706; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem;">👤 <?php echo esc_html($client); ?></span>
      <?php endif; ?>
    </div>

    <!-- 图片轮播 -->
    <?php if ($images): ?>
    <div class="case-gallery" style="margin-bottom: 40px; position: relative;">
      <div id="caseGalleryMain" style="background: var(--gray-50); border-radius: 16px; overflow: hidden; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;">
        <img id="caseMainImg" src="<?php echo esc_url($images[0]); ?>" alt="<?php the_title(); ?>" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: opacity 0.3s;">
      </div>
      <?php if (count($images) > 1): ?>
      <div style="display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding-bottom: 4px;">
        <?php foreach ($images as $idx => $img): ?>
        <div onclick="document.getElementById('caseMainImg').src='<?php echo esc_url($img); ?>'"
             style="flex-shrink: 0; width: 80px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer;
                    border: 2px solid <?php echo $idx===0 ? 'var(--primary)' : 'transparent'; ?>;
                    opacity: <?php echo $idx===0 ? '1' : '0.6'; ?>;
                    transition: all 0.2s;"
             class="case-thumb"
             onmouseover="this.style.opacity='1'"
             onmouseout="this.style.opacity='<?php echo $idx===0 ? '1' : '0.6'; ?>'">
          <img src="<?php echo esc_url($img); ?>" alt="" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <?php endforeach; ?>
      </div>
      <!-- 左右箭头 -->
      <button onclick="casePrevImg()" style="position: absolute; left: 16px; top: 40%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 2;">‹</button>
      <button onclick="caseNextImg()" style="position: absolute; right: 16px; top: 40%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 2;">›</button>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- 工艺标签列表 -->
    <?php if ($craft): ?>
    <div style="background: var(--gray-50); border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
      <h3 style="font-size: 1rem; margin: 0 0 12px 0; color: var(--text-muted);">🔧 <?php echo dflc_t('使用工艺'); ?></h3>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <?php foreach (explode(',', $craft) as $tag): ?>
          <span style="background: #fff; border: 1px solid var(--border); padding: 6px 14px; border-radius: 6px; font-size: 0.9rem;"><?php echo esc_html(trim($tag)); ?></span>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endif; ?>

    <!-- 案例描述 -->
    <div style="font-size: 1.05rem; line-height: 2; color: var(--gray-600); margin-bottom: 48px;">
      <h2 style="font-size: 1.4rem; color: var(--gray-800); margin-bottom: 16px;">📋 <?php echo dflc_t('项目介绍'); ?></h2>
      <?php the_content(); ?>
    </div>

    <!-- 前后对比 -->
    <?php if ($before || $after): ?>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px;">
      <?php if ($before): ?>
      <div style="background: #fef2f2; border-radius: 12px; padding: 24px;">
        <h3 style="font-size: 1rem; color: #dc2626; margin: 0 0 12px 0;">❓ <?php echo dflc_t('客户需求'); ?></h3>
        <p style="line-height: 1.8; color: var(--gray-600); margin: 0;"><?php echo nl2br(esc_html($before)); ?></p>
      </div>
      <?php endif; ?>
      <?php if ($after): ?>
      <div style="background: #f0fdf4; border-radius: 12px; padding: 24px;">
        <h3 style="font-size: 1rem; color: #16a34a; margin: 0 0 12px 0;">✅ <?php echo dflc_t('解决方案'); ?></h3>
        <p style="line-height: 1.8; color: var(--gray-600); margin: 0;"><?php echo nl2br(esc_html($after)); ?></p>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- 关联产品 -->
    <?php
    $related_products = [];
    if ($related) {
        $related_products = array_map(function($id) { return wc_get_product($id); }, (array)$related);
        $related_products = array_filter($related_products);
    }
    if ($related_products): ?>
    <div style="margin-bottom: 48px;">
      <h2 style="font-size: 1.4rem; color: var(--gray-800); margin-bottom: 20px;">📦 <?php echo dflc_t('相关产品'); ?></h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
        <?php foreach ($related_products as $rp): ?>
        <a href="<?php echo get_permalink($rp->get_id()); ?>" style="text-decoration: none; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
          <div style="background: var(--gray-50); height: 160px; display: flex; align-items: center; justify-content: center;">
            <?php echo $rp->get_image('medium', ['style' => 'max-height:150px; object-fit:contain;']); ?>
          </div>
          <div style="padding: 12px 16px;">
            <div style="font-weight: 600; color: var(--gray-700); font-size: 0.95rem;"><?php echo $rp->get_name(); ?></div>
            <div style="color: var(--primary); font-size: 0.85rem; margin-top: 4px;"><?php echo dflc_t('查看详情'); ?> →</div>
          </div>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endif; ?>

    <!-- 返回 -->
    <a href="<?php echo home_url('/cases/'); ?>" style="display: inline-flex; align-items: center; gap: 6px; color: var(--primary); font-weight: 500;">
      ← <?php echo dflc_t('返回案例列表'); ?>
    </a>

  </div>
</section>

<?php
// 图片轮播 JS
$imgs_json = json_encode($images);
?>
<script>
(function(){
    var caseImages = <?php echo $imgs_json; ?>;
    var currentIdx = 0;
    var mainImg = document.getElementById('caseMainImg');
    var thumbs = document.querySelectorAll('.case-thumb');

    window.caseNextImg = function() {
        currentIdx = (currentIdx + 1) % caseImages.length;
        updateGallery();
    };
    window.casePrevImg = function() {
        currentIdx = (currentIdx - 1 + caseImages.length) % caseImages.length;
        updateGallery();
    };
    function updateGallery() {
        if (mainImg) { mainImg.style.opacity = '0.3'; setTimeout(function(){ mainImg.src = caseImages[currentIdx]; mainImg.style.opacity = '1'; }, 150); }
        thumbs.forEach(function(t, i) {
            t.style.borderColor = i === currentIdx ? 'var(--primary)' : 'transparent';
            t.style.opacity = i === currentIdx ? '1' : '0.6';
        });
    }
    // Keyboard nav
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') casePrevImg();
        if (e.key === 'ArrowRight') caseNextImg();
    });
})();
</script>

<?php endwhile; ?>
<?php get_footer(); ?>
