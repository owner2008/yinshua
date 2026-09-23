<?php while (have_posts()) : the_post();
    $case_id = get_the_ID();
    $client    = get_post_meta($case_id, 'case_client', true);
    $craft     = get_post_meta($case_id, 'case_craft', true);
    $material  = get_post_meta($case_id, 'case_material', true);
    $industry  = get_post_meta($case_id, 'case_industry', true);
    $before    = get_post_meta($case_id, 'case_before', true);
    $after     = get_post_meta($case_id, 'case_after', true);

    // 收集图片
    $images = [];
    for ($i = 1; $i <= 5; $i++) {
        $img = get_post_meta($case_id, "case_image_{$i}", true);
        if ($img) $images[] = $img;
    }
    if (!$images && has_post_thumbnail()) {
        $images[] = get_the_post_thumbnail_url($case_id, 'medium');
    }
?>

<section class="section section-white" style="padding-top: 68px;">
  <div class="px">

    <h1 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 8px;"><?php the_title(); ?></h1>

    <!-- 标签 -->
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
      <?php if ($industry): ?>
        <span style="background: #eff6ff; color: #1a73e8; padding: 2px 10px; border-radius: 20px; font-size: 0.72rem;">🏭 <?php echo esc_html($industry); ?></span>
      <?php endif; ?>
      <?php if ($material): ?>
        <span style="background: #f0fdf4; color: #16a34a; padding: 2px 10px; border-radius: 20px; font-size: 0.72rem;">📄 <?php echo esc_html($material); ?></span>
      <?php endif; ?>
      <?php if ($client): ?>
        <span style="background: #fef3c7; color: #d97706; padding: 2px 10px; border-radius: 20px; font-size: 0.72rem;">👤 <?php echo esc_html($client); ?></span>
      <?php endif; ?>
    </div>

    <!-- 图片横向滑动 -->
    <?php if ($images): ?>
    <div class="h5-gallery" style="margin-bottom: 20px; position: relative;">
      <div id="h5GalleryTrack" style="display: flex; gap: 0; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; border-radius: 12px;">
        <?php foreach ($images as $img): ?>
        <div style="flex: 0 0 100%; scroll-snap-align: start; background: var(--gray-50); aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center;">
          <img src="<?php echo esc_url($img); ?>" alt="" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <?php endforeach; ?>
      </div>
      <?php if (count($images) > 1): ?>
      <div style="display: flex; justify-content: center; gap: 6px; margin-top: 10px;">
        <?php for ($i = 0; $i < count($images); $i++): ?>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: <?php echo $i===0 ? 'var(--primary)' : '#ddd'; ?>;" class="h5-gallery-dot"></div>
        <?php endfor; ?>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- 工艺标签 -->
    <?php if ($craft): ?>
    <div style="background: var(--gray-50); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">🔧 使用工艺</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <?php foreach (explode(',', $craft) as $tag): ?>
          <span style="background: #fff; border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; font-size: 0.78rem;"><?php echo esc_html(trim($tag)); ?></span>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endif; ?>

    <!-- 描述 -->
    <div style="font-size: 0.92rem; line-height: 1.9; color: var(--gray-600); margin-bottom: 24px;">
      <h2 style="font-size: 1.1rem; color: var(--gray-800); margin-bottom: 12px;">📋 项目介绍</h2>
      <?php the_content(); ?>
    </div>

    <!-- 前后对比 -->
    <?php if ($before || $after): ?>
    <div style="margin-bottom: 24px;">
      <?php if ($before): ?>
      <div style="background: #fef2f2; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <div style="font-size: 0.85rem; color: #dc2626; font-weight: 600; margin-bottom: 8px;">❓ 客户需求</div>
        <p style="font-size: 0.85rem; line-height: 1.7; color: var(--gray-600); margin: 0;"><?php echo nl2br(esc_html($before)); ?></p>
      </div>
      <?php endif; ?>
      <?php if ($after): ?>
      <div style="background: #f0fdf4; border-radius: 10px; padding: 16px;">
        <div style="font-size: 0.85rem; color: #16a34a; font-weight: 600; margin-bottom: 8px;">✅ 解决方案</div>
        <p style="font-size: 0.85rem; line-height: 1.7; color: var(--gray-600); margin: 0;"><?php echo nl2br(esc_html($after)); ?></p>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <a href="<?php echo home_url('/cases/'); ?>" style="display: inline-block; margin-top: 8px; color: var(--primary); font-size: 0.85rem; font-weight: 500;">← 返回案例列表</a>

  </div>
</section>

<?php if (count($images) > 1): ?>
<script>
(function(){
    var track = document.getElementById('h5GalleryTrack');
    var dots = document.querySelectorAll('.h5-gallery-dot');
    if (!track || !dots.length) return;
    track.addEventListener('scroll', function(){
        var idx = Math.round(track.scrollLeft / track.offsetWidth);
        dots.forEach(function(d, i){ d.style.background = i === idx ? 'var(--primary)' : '#ddd'; });
    });
})();
</script>
<?php endif; ?>

<?php endwhile; ?>
