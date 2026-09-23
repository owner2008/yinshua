<!-- Hero -->
<section class="h5-hero" id="home">
  <div class="h5-hero-copy">
    <h1><?php echo dflc_t('专业印刷'); ?><span><?php echo dflc_t('品质传递价值'); ?></span></h1>
    <p><?php echo dflc_t('专注标签 · 包装 · 说明书 · 宣传册印刷'); ?></p>
    <div class="h5-hero-feat">
      <article><span>▧</span><div><strong><?php echo dflc_t('先进设备'); ?></strong><small><?php echo dflc_t('精密印刷工艺'); ?></small></div></article>
      <article><span>✦</span><div><strong><?php echo dflc_t('品质稳定'); ?></strong><small><?php echo dflc_t('严格品控流程'); ?></small></div></article>
      <article><span>▢</span><div><strong><?php echo dflc_t('按需定制'); ?></strong><small><?php echo dflc_t('满足多样需求'); ?></small></div></article>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="<?php echo home_url('/products/'); ?>" class="btn btn-primary"><?php echo dflc_t('查看产品'); ?></a>
      <a href="#contact" class="btn btn-outline"><?php echo dflc_t('联系我们'); ?></a>
    </div>
  </div>
  <div class="h5-hero-media">
    <div class="h5-carousel">
      <img src="<?php echo home_url('/wp-content/uploads/2026/05/hero-slide-1.jpg'); ?>" alt="<?php echo dflc_t('印刷设备展示'); ?>">
      <img src="<?php echo home_url('/wp-content/uploads/2026/05/hero-slide-2.jpg'); ?>" alt="<?php echo dflc_t('印刷设备展示'); ?>" loading="lazy">
      <img src="<?php echo home_url('/wp-content/uploads/2026/05/hero-slide-3.jpg'); ?>" alt="<?php echo dflc_t('印刷设备展示'); ?>" loading="lazy">
    </div>
    <div class="h5-carousel-dots">
      <span></span><span></span><span></span>
    </div>
  </div>
</section><!-- 产品中心 -->
<section class="section section-white" id="products">
  <div class="px">
    <div class="section-label">Products</div>
    <h2 class="section-heading"><?php echo dflc_t('产品中心'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('覆盖标签、包装、商务印刷全品类'); ?></p>

    <?php
    $h5_cats = [
      ['title' => '标签印刷', 'slug' => 'label-printing', 'subs' => [
        ['name' => '食品饮料标签', 'img' => 'food-beverage.jpg', 'sub' => 'food-beverage'],
        ['name' => '酒水标签', 'img' => 'wine-liquor.jpg', 'sub' => 'wine-liquor'],
        ['name' => '日化化妆品标签', 'img' => 'cosmetics.jpg', 'sub' => 'cosmetics'],
        ['name' => '电子电器标签', 'img' => 'electronics.jpg', 'sub' => 'electronics'],
      ]],
      ['title' => '宣传物料印刷', 'slug' => 'marketing-materials', 'subs' => [
        ['name' => '企业画册', 'img' => 'company-brochure.jpg', 'sub' => 'company-brochure'],
        ['name' => '产品画册', 'img' => 'product-catalog.jpg', 'sub' => 'product-catalog'],
        ['name' => '海报', 'img' => 'poster.jpg', 'sub' => 'poster'],
        ['name' => '说明书', 'img' => 'manual.jpg', 'sub' => 'manual'],
      ]],
      ['title' => '包装盒印刷', 'slug' => 'box-packaging', 'subs' => [
        ['name' => '白卡纸盒', 'img' => 'white-cardboard-box.jpg', 'sub' => 'white-cardboard-box'],
        ['name' => '彩盒包装', 'img' => 'color-box.jpg', 'sub' => 'color-box'],
        ['name' => '礼品盒', 'img' => 'gift-box.jpg', 'sub' => 'gift-box'],
        ['name' => '食品包装盒', 'img' => 'food-box.jpg', 'sub' => 'food-box'],
      ]],
      ['title' => '纸制品印刷', 'slug' => 'paper-products', 'subs' => [
        ['name' => '手提袋', 'img' => 'hand-bag.jpg', 'sub' => 'hand-bag'],
        ['name' => '纸袋', 'img' => 'paper-bag.jpg', 'sub' => 'paper-bag'],
        ['name' => '纸杯', 'img' => 'paper-cup.jpg', 'sub' => 'paper-cup'],
        ['name' => '信封信纸', 'img' => 'envelope-letter.jpg', 'sub' => 'envelope-letter'],
      ]],
    ];

    $h5_img_base = home_url('/wp-content/uploads/products/');
    foreach ($h5_cats as $cat):
    ?>
    <div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="font-size:.95rem;font-weight:800;color:var(--text);"><?php echo dflc_t($cat['title']); ?></h3>
        <a href="<?php echo home_url('/products/?cat=' . $cat['slug']); ?>" style="font-size:.75rem;color:var(--primary);"><?php echo dflc_t('查看更多'); ?> →</a>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <?php foreach ($cat['subs'] as $sub): ?>
        <a href="<?php echo home_url('/products/?cat=' . $cat['slug'] . '&sub=' . $sub['sub']); ?>" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);">
          <div style="height:100px;overflow:hidden;">
            <img src="<?php echo $h5_img_base . $cat['slug'] . '/' . $sub['img']; ?>" alt="<?php echo dflc_t($sub['name']); ?>" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
          </div>
          <div style="padding:6px 8px;text-align:center;">
            <span style="font-size:.7rem;color:var(--gray-600);"><?php echo dflc_t($sub['name']); ?></span>
          </div>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>

  </div>
</section><!-- 生产实力 -->
<section class="section" id="production">
  <div class="px">
    <div class="section-label">Production</div>
    <h2 class="section-heading"><?php echo dflc_t('生产实力'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('先进设备保障品质与效率'); ?></p>
    <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;">
      <?php
      $h5_prod_imgs = [
        ['/wp-content/uploads/2026/05/equipment/1565414671.jpg', '德国博世Rexroth六色UV印刷生产线'],
        ['/wp-content/uploads/2026/05/equipment/1565412427.jpg', '海德堡多色胶印机'],
        ['/wp-content/uploads/2026/05/equipment/1565408204.jpg', '全自动模切设备'],
        ['/wp-content/uploads/2026/05/equipment/1565409756.jpg', '数码印刷产线'],
        ['/wp-content/uploads/2026/05/equipment/1565411248.jpg', '后道加工中心'],
        ['/wp-content/uploads/2026/05/equipment/1565406568.jpg', '品检分条设备'],
      ];
      foreach ($h5_prod_imgs as $img): ?>
      <a href="<?php echo home_url('/production/'); ?>" style="display:block; border-radius:10px; overflow:hidden; aspect-ratio:4/3; background:#e2e8f0; position:relative;">
        <img src="<?php echo $img[0]; ?>" alt="<?php echo dflc_t($img[1]); ?>" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.5));padding:28px 8px 8px;color:#fff;font-size:.68rem;font-weight:600;"><?php echo dflc_t($img[1]); ?></div>
      </a>
      <?php endforeach; ?>
      <a href="<?php echo home_url('/production/'); ?>" style="display:flex;align-items:center;justify-content:center;flex-direction:column;background:#fff;border:2px dashed #1a73e8;border-radius:10px;aspect-ratio:4/3;color:#1a73e8;font-size:.85rem;font-weight:600;text-decoration:none;gap:4px;">
        <span><?php echo dflc_t('查看更多'); ?></span>
        <span style="font-size:1.2rem;">→</span>
      </a>
    </div>
  </div>
</section><!-- 行业应用 -->
<section class="section" id="industries">
  <div class="px">
    <div class="section-label">Industries</div>
    <h2 class="section-heading"><?php echo dflc_t('行业应用'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('左右滑动查看 →'); ?></p>
  </div>
  <div class="industry-scroll">
    <?php
    $industry_query = new WP_Query(['post_type'=>'industry','posts_per_page'=>6,'orderby'=>'date','order'=>'ASC']);
    if ($industry_query->have_posts()):
      while ($industry_query->have_posts()): $industry_query->the_post();
        $icon = get_post_meta(get_the_ID(), 'industry_icon', true) ?: '🏭'; ?>
        <div class="industry-item"><div class="icon"><?php echo $icon; ?></div><h3><?php the_title(); ?></h3><p><?php echo get_post_meta(get_the_ID(), 'industry_desc', true) ?: get_the_excerpt(); ?></p></div>
      <?php endwhile; wp_reset_postdata(); endif; ?>
  </div>
</section><!-- 材质与工艺 -->
<section class="section section-white" id="materials">
  <div class="px">
    <div class="section-label">Materials &amp; Craft</div>
    <h2 class="section-heading"><?php echo dflc_t('材质与工艺'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('精选优质材料，先进印刷工艺'); ?></p>
    <div class="material-grid">
      <div class="material-item"><div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/coated-paper.jpg'); ?>" alt="<?php echo dflc_t('表面整饰'); ?>" loading="lazy"></div><div class="info"><h3><?php echo dflc_t('表面整饰'); ?></h3><p><?php echo dflc_t('烫金/击凸/压纹'); ?></p></div></div>
      <div class="material-item"><div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/synthetic.jpg'); ?>" alt="<?php echo dflc_t('防护工艺'); ?>" loading="lazy"></div><div class="info"><h3><?php echo dflc_t('防护工艺'); ?></h3><p><?php echo dflc_t('覆膜/上光'); ?></p></div></div>
      <div class="material-item"><div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/cardboard.jpg'); ?>" alt="<?php echo dflc_t('卡纸材料系列'); ?>" loading="lazy"></div><div class="info"><h3><?php echo dflc_t('卡纸材料系列'); ?></h3><p><?php echo dflc_t('白卡/灰底白板'); ?></p></div></div>
      <div class="material-item"><div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/surface-finish.jpg'); ?>" alt="<?php echo dflc_t('合成材料系列'); ?>" loading="lazy"></div><div class="info"><h3><?php echo dflc_t('合成材料系列'); ?></h3><p>PET/PP/PE</p></div></div>
      <div class="material-item"><div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/protective.jpg'); ?>" alt="<?php echo dflc_t('涂层纸系列'); ?>" loading="lazy"></div><div class="info"><h3><?php echo dflc_t('涂层纸系列'); ?></h3><p><?php echo dflc_t('铜版纸/哑粉纸'); ?></p></div></div>
      <div class="material-item"><div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/digital-craft.jpg'); ?>" alt="<?php echo dflc_t('数字工艺'); ?>" loading="lazy"></div><div class="info"><h3><?php echo dflc_t('数字工艺'); ?></h3><p><?php echo dflc_t('可变码精准溯源'); ?></p></div></div>
    </div>
  </div>
</section><!-- 企业优势 -->
<section class="section" id="advantages">
  <div class="px">
    <div class="section-label">Advantages</div>
    <h2 class="section-heading"><?php echo dflc_t('企业优势'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('十五年深耕，以专业赢得信赖'); ?></p>
    <div class="adv-grid">
      <div class="adv-card"><div class="icon">🏭</div><h3><?php echo dflc_t('规模生产'); ?></h3><p><?php echo dflc_t('6000㎡厂房，全自动产线'); ?></p></div>
      <div class="adv-card"><div class="icon">🎯</div><h3><?php echo dflc_t('品质管控'); ?></h3><p><?php echo dflc_t('ISO认证，合格率99.8%'); ?></p></div>
      <div class="adv-card"><div class="icon">⚡</div><h3><?php echo dflc_t('快速响应'); ?></h3><p><?php echo dflc_t('打样48h，紧急优先排产'); ?></p></div>
      <div class="adv-card"><div class="icon">💡</div><h3><?php echo dflc_t('专业团队'); ?></h3><p><?php echo dflc_t('资深设计+印刷技师团队'); ?></p></div>
    </div>
  </div>
</section><!-- 关于我们 -->
<section class="section section-white" id="about">
  <div class="px">
    <div class="section-label">About Us</div>
    <h2 class="section-heading"><?php echo dflc_t('关于我们'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('专业标签与包装印刷服务商'); ?></p>
    <div class="about-block">
      <p><?php echo dflc_t('青岛东方丽彩包装有限公司成立于2010年，集设计、印刷、后道加工于一体，拥有6000㎡现代化生产基地，配海德堡多色胶印机、全自动模切机、HP Indigo数字印刷机等先进设备。'); ?></p>
      <p><?php echo dflc_t('秉持「品质为本、客户至上」理念，为客户提供从设计到成品的一站式包装印刷解决方案。'); ?></p>
    </div>
  </div>
</section><!-- 联系我们 -->
<section class="section" id="contact">
  <div class="px">
    <div class="section-label">Contact</div>
    <h2 class="section-heading"><?php echo dflc_t('联系我们'); ?></h2>
    <p class="section-sub"><?php echo dflc_t('期待与您合作'); ?></p>
    <div class="contact-info">
      <div class="contact-row"><div class="icon">📍</div><div><h3><?php echo dflc_t('公司地址'); ?></h3><p><?php echo dflc_t('青岛市城阳区书雨路118号'); ?></p></div></div>
      <div class="contact-row contact-row--phone">
        <div class="icon">📞</div>
        <div>
          <h3><?php echo dflc_t('联系电话'); ?></h3>
          <dl class="contact-phone-list">
            <div><dt><?php echo dflc_t('手机'); ?></dt><dd><a href="tel:18705328806">18705328806</a></dd></div>
            <div><dt><?php echo dflc_t('办公室电话'); ?></dt><dd><a href="tel:053288860880">0532-8886 0880</a></dd></div>
          </dl>
        </div>
      </div>
      <div class="contact-row"><div class="icon">✉️</div><div><h3><?php echo dflc_t('电子邮箱'); ?></h3><div class="contact-email-links"><a href="mailto:79927940@qq.com">79927940@qq.com</a><a href="mailto:qd7931@126.com">qd7931@126.com</a></div></div></div>
    </div>
    <form class="contact-form" onsubmit="return dflc_submit_contact(event)">
      <input type="text" name="customer_name" placeholder="<?php echo dflc_t('您的姓名'); ?>" required>
      <input type="tel" name="customer_phone" placeholder="<?php echo dflc_t('联系电话'); ?>" required>
      <textarea name="notes" placeholder="<?php echo dflc_t('请描述您的需求'); ?>"></textarea>
      <button type="submit" class="btn btn-primary"><?php echo dflc_t('提交留言'); ?></button>
    </form>
  </div>
</section>

<script>
async function dflc_submit_contact(e) {
  e.preventDefault();
  var form = e.target;
  var data = new FormData(form);
  data.append('action', 'dflc_submit_inquiry');
  data.append('nonce', '<?php echo wp_create_nonce("dflc_inquiry_nonce"); ?>');
  data.append('product_id', '0');
  try {
    var resp = await fetch('<?php echo admin_url("admin-ajax.php"); ?>', {method:'POST', body:data});
    var json = await resp.json();
    if (json.success) {
      form.innerHTML = '<div style="text-align:center;padding:32px"><p style="font-size:2rem">✅</p><h3><?php echo dflc_t('提交成功'); ?>！</h3><p style="color:var(--gray-400);margin-top:8px;"><?php echo dflc_t('我们会在24小时内与你联系'); ?></p></div>';
    } else {
      alert(json.data?.message || '<?php echo dflc_t('提交失败，请重试'); ?>');
    }
  } catch(e) {
    alert('<?php echo dflc_t('网络错误，请稍后重试'); ?>');
  }
}
</script>
