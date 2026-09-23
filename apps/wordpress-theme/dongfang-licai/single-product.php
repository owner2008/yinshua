<?php
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/product-single.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;
get_header(); ?>

<?php while (have_posts()) : the_post();
    $pid = get_the_ID();
    $product = wc_get_product($pid);
    $size     = get_post_meta($pid, 'product_size', true);
    $moq      = get_post_meta($pid, 'product_moq', true);
    $leadtime = get_post_meta($pid, 'product_leadtime', true);
    $sample   = get_post_meta($pid, 'product_sample', true);
    $feature  = get_post_meta($pid, 'product_feature_title', true);
    $apps     = get_post_meta($pid, 'product_applications', true);
    $apps = $apps ? array_filter(array_map('trim', explode("\n", $apps))) : [];

    // Detail images
    $detail_imgs = [];
    for ($i = 1; $i <= 4; $i++) {
        $img = get_post_meta($pid, "product_detail_{$i}", true);
        if ($img) $detail_imgs[] = $img;
    }
?>

<section style="padding-top: 120px; padding-bottom: 60px;">
  <div class="container" style="max-width: 1100px;">

    <!-- 面包屑 -->
    <div style="margin-bottom: 20px; font-size: 0.875rem; color: var(--text-muted);">
      <a href="<?php echo home_url(); ?>" style="color: var(--text-muted);">首页</a>
      &nbsp;›&nbsp;
      <a href="<?php echo home_url('/products/'); ?>" style="color: var(--text-muted);">产品中心</a>
      &nbsp;›&nbsp;
      <span style="color: var(--primary);"><?php the_title(); ?></span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">

      <!-- 左：产品图 -->
      <div>
        <?php if ($detail_imgs): ?>
        <!-- 多图展示 -->
        <div id="prodGallery" style="position: relative;">
          <div style="background: var(--blue-50); border-radius: var(--radius-lg); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img id="prodMainImg" src="<?php echo esc_url($detail_imgs[0]); ?>" alt="<?php the_title(); ?>" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: opacity 0.3s;">
          </div>
          <?php if (count($detail_imgs) > 1): ?>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <?php foreach ($detail_imgs as $idx => $img): ?>
            <div onclick="document.getElementById('prodMainImg').src='<?php echo esc_url($img); ?>'"
                 style="width: 64px; height: 64px; border-radius: 8px; overflow: hidden; cursor: pointer;
                        border: 2px solid <?php echo $idx===0 ? 'var(--primary)' : 'transparent'; ?>;
                        opacity: <?php echo $idx===0 ? '1' : '0.6'; ?>;
                        transition: all 0.2s;"
                 class="prod-thumb"
                 onmouseover="this.style.opacity='1'"
                 onmouseout="this.style.opacity='<?php echo $idx===0 ? '1' : '0.6'; ?>'">
              <img src="<?php echo esc_url($img); ?>" alt="" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>
        <?php else: ?>
        <div style="background: var(--blue-50); border-radius: var(--radius-lg); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
          <?php the_post_thumbnail('large', ['style'=>'max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;']); ?>
        </div>
        <?php endif; ?>
      </div>

      <!-- 右：产品信息 -->
      <div>
        <h1 style="font-size: 2rem; margin: 0 0 12px 0;"><?php the_title(); ?></h1>

        <?php if ($feature): ?>
        <div style="color: var(--primary); font-size: 1.05rem; margin-bottom: 20px; padding: 10px 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid var(--primary);">
          <?php echo esc_html($feature); ?>
        </div>
        <?php endif; ?>

        <!-- 规格参数表 -->
        <div class="product-params" style="background: var(--gray-50); border-radius: var(--radius); padding: 20px; margin-bottom: 24px;">
          <h3 style="font-size: 1rem; margin: 0 0 12px 0; color: var(--gray-700);">📋 产品规格</h3>
          <?php
          $attrs = [
            'pa_cailiao' => '材质', 'pa_gongyi' => '工艺',
            'pa_xingzhuang' => '形状', 'pa_yongtu' => '用途',
          ];
          foreach ($attrs as $tax => $label):
            $terms = wp_get_post_terms($pid, $tax, ['fields' => 'names']);
            if (!is_wp_error($terms) && $terms): ?>
            <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem;">
              <span style="color: var(--text-muted); width: 70px; flex-shrink: 0;"><?php echo $label; ?></span>
              <span style="font-weight: 600;"><?php echo implode('、', $terms); ?></span>
            </div>
          <?php endif; endforeach; ?>

          <?php if ($size): ?>
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem;">
            <span style="color: var(--text-muted); width: 70px;">常规尺寸</span>
            <span style="font-weight: 600;"><?php echo esc_html($size); ?></span>
          </div>
          <?php endif; ?>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 4px;">
            <?php if ($moq): ?>
            <div style="padding: 6px 0; font-size: 0.9rem;">
              <span style="color: var(--text-muted);">起订量</span><br>
              <span style="font-weight: 600;"><?php echo esc_html($moq); ?></span>
            </div>
            <?php endif; ?>
            <?php if ($leadtime): ?>
            <div style="padding: 6px 0; font-size: 0.9rem;">
              <span style="color: var(--text-muted);">交货周期</span><br>
              <span style="font-weight: 600;"><?php echo esc_html($leadtime); ?></span>
            </div>
            <?php endif; ?>
            <?php if ($sample): ?>
            <div style="padding: 6px 0; font-size: 0.9rem;">
              <span style="color: var(--text-muted);">打样政策</span><br>
              <span style="font-weight: 600; color: #16a34a;"><?php echo esc_html($sample); ?></span>
            </div>
            <?php endif; ?>
          </div>
        </div>

        <!-- 适用场景 -->
        <?php if ($apps): ?>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">🎯 适用场景</h3>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <?php foreach ($apps as $app): ?>
            <span style="background: #f0fdf4; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem;"><?php echo esc_html($app); ?></span>
            <?php endforeach; ?>
          </div>
        </div>
        <?php endif; ?>

        <!-- 联系方式 -->
        <div style="background: var(--gray-50); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 1.3rem;">📞</span>
            <a href="tel:18705328806" style="font-size: 1.1rem; font-weight: 700; color: var(--primary); text-decoration: none;">18705328806</a>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 1.3rem;">☎️</span>
            <a href="tel:053288860880" style="font-size: 1.1rem; font-weight: 700; color: var(--primary); text-decoration: none;">0532-8886 0880</a>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px;">
            <span style="font-size: 1.3rem;">💬</span>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">微信咨询</div>
              <img src="<?php echo home_url('/wp-content/uploads/2026/05/wechat-qr.jpg'); ?>" 
                   alt="微信二维码" style="width: 120px; height: auto; border-radius: 8px; border: 1px solid var(--border);">
            </div>
          </div>
        </div>

        <!-- 咨询按钮 -->
        <button onclick="dflc_open_inquiry(<?php the_ID(); ?>)" class="btn btn-primary" style="display: inline-flex; cursor: pointer; width: 100%; max-width: 320px; justify-content: center;">
          📋 立即咨询
        </button>
        <p style="margin-top: 8px; color: #888; font-size: 0.82rem;">提交需求后我们会在24h内联系你</p>
      </div>
    </div>

    <!-- 产品描述 -->
    <?php if (get_the_content()): ?>
    <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border);">
      <h2 style="font-size: 1.4rem; margin-bottom: 16px;">📝 产品详情</h2>
      <div style="font-size: 1rem; line-height: 2; color: var(--gray-600); max-width: 800px;"><?php the_content(); ?></div>
    </div>
    <?php endif; ?>

  </div>
</section>
<?php endwhile; ?><?php get_footer(); ?>
