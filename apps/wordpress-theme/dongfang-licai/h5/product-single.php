<?php while (have_posts()) : the_post();
    $pid = get_the_ID();
    $size     = get_post_meta($pid, 'product_size', true);
    $moq      = get_post_meta($pid, 'product_moq', true);
    $leadtime = get_post_meta($pid, 'product_leadtime', true);
    $sample   = get_post_meta($pid, 'product_sample', true);
    $feature  = get_post_meta($pid, 'product_feature_title', true);
    $apps     = get_post_meta($pid, 'product_applications', true);
    $apps = $apps ? array_filter(array_map('trim', explode("\n", $apps))) : [];

    $detail_imgs = [];
    for ($i = 1; $i <= 4; $i++) {
        $img = get_post_meta($pid, "product_detail_{$i}", true);
        if ($img) $detail_imgs[] = $img;
    }
?>

<section class="section section-white" style="padding-top: 68px;">
  <div class="px">

    <!-- 图片横向滑动 -->
    <?php if ($detail_imgs): ?>
    <div style="margin-bottom: 16px;">
      <div id="h5ProdGallery" style="display: flex; gap: 0; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; border-radius: 12px;">
        <?php foreach ($detail_imgs as $img): ?>
        <div style="flex: 0 0 100%; scroll-snap-align: start; background: var(--gray-50); aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
          <img src="<?php echo esc_url($img); ?>" alt="" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <?php endforeach; ?>
      </div>
      <?php if (count($detail_imgs) > 1): ?>
      <div style="display: flex; justify-content: center; gap: 6px; margin-top: 8px;">
        <?php for ($i = 0; $i < count($detail_imgs); $i++): ?>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: <?php echo $i===0 ? 'var(--primary)' : '#ddd'; ?>;" class="h5-prod-dot"></div>
        <?php endfor; ?>
      </div>
      <?php endif; ?>
    </div>
    <?php elseif (has_post_thumbnail()): ?>
    <div style="background: var(--blue-50); border-radius: 12px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <?php the_post_thumbnail('medium', ['style'=>'max-width:100%;max-height:100%;object-fit:contain;']); ?>
    </div>
    <?php endif; ?>

    <h1 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 6px;"><?php the_title(); ?></h1>

    <?php if ($feature): ?>
    <div style="color: var(--primary); font-size: 0.9rem; margin-bottom: 16px; padding: 8px 12px; background: #eff6ff; border-radius: 8px; border-left: 3px solid var(--primary);">
      <?php echo esc_html($feature); ?>
    </div>
    <?php endif; ?>

    <!-- 规格参数 -->
    <div style="background: var(--gray-50); border-radius: 10px; padding: 14px; margin-bottom: 16px;">
      <?php
      $attrs = ['pa_cailiao'=>'材质','pa_gongyi'=>'工艺','pa_xingzhuang'=>'形状','pa_yongtu'=>'用途'];
      foreach ($attrs as $tax => $label):
        $terms = wp_get_post_terms($pid, $tax, ['fields'=>'names']);
        if (!is_wp_error($terms) && $terms): ?>
        <div style="display: flex; padding: 5px 0; border-bottom: 1px solid var(--border); font-size: 0.82rem;">
          <span style="color: var(--gray-400); width: 56px; flex-shrink: 0;"><?php echo $label; ?></span>
          <span style="font-weight: 600;"><?php echo implode('、', $terms); ?></span>
        </div>
      <?php endif; endforeach; ?>

      <?php if ($size): ?>
      <div style="display: flex; padding: 5px 0; border-bottom: 1px solid var(--border); font-size: 0.82rem;">
        <span style="color: var(--gray-400); width: 56px;">尺寸</span><span style="font-weight: 600;"><?php echo esc_html($size); ?></span>
      </div>
      <?php endif; ?>

      <div style="display: flex; flex-wrap: wrap; gap: 4px 0; padding-top: 4px;">
        <?php if ($moq): ?><div style="flex: 1; font-size: 0.8rem;"><span style="color: var(--gray-400);">起订量</span><br><span style="font-weight: 600;"><?php echo esc_html($moq); ?></span></div><?php endif; ?>
        <?php if ($leadtime): ?><div style="flex: 1; font-size: 0.8rem;"><span style="color: var(--gray-400);">交期</span><br><span style="font-weight: 600;"><?php echo esc_html($leadtime); ?></span></div><?php endif; ?>
        <?php if ($sample): ?><div style="flex: 1; font-size: 0.8rem;"><span style="color: var(--gray-400);">打样</span><br><span style="font-weight: 600; color: #16a34a;"><?php echo esc_html($sample); ?></span></div><?php endif; ?>
      </div>
    </div>

    <!-- 适用场景 -->
    <?php if ($apps): ?>
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.82rem; color: var(--gray-400); margin-bottom: 6px;">🎯 适用场景</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <?php foreach ($apps as $app): ?>
        <span style="background: #f0fdf4; color: #16a34a; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem;"><?php echo esc_html($app); ?></span>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endif; ?>

    <!-- 联系方式 -->
    <div style="background: var(--gray-50); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 1.1rem;">📞</span>
        <a href="tel:18705328806" style="font-size: 1.05rem; font-weight: 700; color: var(--primary); text-decoration: none;">18705328806</a>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <span style="font-size: 1.1rem;">☎️</span>
        <a href="tel:053288860880" style="font-size: 1.05rem; font-weight: 700; color: var(--primary); text-decoration: none;">0532-8886 0880</a>
      </div>
      <div style="display: flex; align-items: flex-start; gap: 8px;">
        <span style="font-size: 1.1rem;">💬</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;">微信咨询</div>
          <img src="<?php echo home_url('/wp-content/uploads/2026/05/wechat-qr.jpg'); ?>" 
               alt="微信二维码" style="width: 100px; height: auto; border-radius: 8px; border: 1px solid var(--border);">
        </div>
      </div>
    </div>

    <!-- 咨询按钮 -->
    <button onclick="dflc_open_inquiry(<?php the_ID(); ?>)" class="btn" style="width: 100%; display: flex; justify-content: center; align-items: center; cursor: pointer; background: linear-gradient(135deg, #1a73e8, #00a8b5); color: #fff; border: none; padding: 14px; border-radius: 10px; font-size: 1rem; font-weight: 600;">
      📋 立即咨询
    </button>

    <!-- 产品描述 -->
    <?php if (get_the_content()): ?>
    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
      <h2 style="font-size: 1.1rem; margin-bottom: 12px;">📝 产品详情</h2>
      <div style="font-size: 0.9rem; line-height: 1.9; color: var(--gray-600);"><?php the_content(); ?></div>
    </div>
    <?php endif; ?>

  </div>
</section>
<?php endwhile; ?>

<?php if (count($detail_imgs) > 1): ?>
<script>
(function(){
    var track = document.getElementById('h5ProdGallery');
    var dots = document.querySelectorAll('.h5-prod-dot');
    if (!track || !dots.length) return;
    track.addEventListener('scroll', function(){
        var idx = Math.round(track.scrollLeft / track.offsetWidth);
        dots.forEach(function(d, i){ d.style.background = i === idx ? 'var(--primary)' : '#ddd'; });
    });
})();
</script>
<?php endif; ?>
