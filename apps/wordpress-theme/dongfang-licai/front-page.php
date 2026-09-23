<?php
// Device detection: serve H5 version for mobile
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/home-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;

get_header(); ?>

<!-- ===== Hero ===== -->
<section class="dflc-hero" id="home">
  <div class="dflc-hero-copy">
    <h1><?php echo dflc_t('专业印刷'); ?><span><?php echo dflc_t('品质传递价值'); ?></span></h1>
    <p><?php echo dflc_t('专注标签 · 包装 · 说明书 · 宣传册印刷'); ?></p>
    <div class="dflc-hero-features">
      <article>
        <span>▧</span>
        <strong><?php echo dflc_t('先进设备'); ?></strong>
        <small><?php echo dflc_t('精密印刷工艺'); ?></small>
      </article>
      <article>
        <span>✦</span>
        <strong><?php echo dflc_t('品质稳定'); ?></strong>
        <small><?php echo dflc_t('严格品控流程'); ?></small>
      </article>
      <article>
        <span>▢</span>
        <strong><?php echo dflc_t('定制方案'); ?></strong>
        <small><?php echo dflc_t('满足多样需求'); ?></small>
      </article>
    </div>
    <div class="dflc-hero-actions">
      <a href="<?php echo dflc_nav_url(32, '/products/'); ?>" class="btn btn-primary"><?php echo dflc_t('查看产品'); ?></a>
      <a href="#contact" class="btn btn-outline"><?php echo dflc_t('联系我们'); ?></a>
    </div>
  </div>
  <div class="dflc-hero-media">
    <div class="hero-carousel" aria-label="Printing Equipment & Product Showcase">
      <img src="<?php echo home_url('/wp-content/uploads/2026/05/hero-slide-1.jpg'); ?>" alt="Printing Equipment Display">
      <img src="<?php echo home_url('/wp-content/uploads/2026/05/hero-slide-2.jpg'); ?>" alt="Printing Equipment Display" loading="lazy">
      <img src="<?php echo home_url('/wp-content/uploads/2026/05/hero-slide-3.jpg'); ?>" alt="Printing Equipment Display" loading="lazy">
    </div>
    <div class="hero-carousel-dots">
      <span></span><span></span><span></span>
    </div>
  </div>
</section>

<!-- ===== 产品中心 / Products ===== -->
<section id="products">
  <div class="container">
    <div class="section-title"><span class="en">Products</span><span class="cn"><?php echo dflc_t('产品中心'); ?></span><span class="line"></span></div>
    <p class="section-subtitle"><?php echo dflc_t('一站式满足您的包装印刷需求'); ?></p>

    <?php
    $home_cats = [
      ['title' => dflc_t('标签印刷'), 'slug' => 'label-printing', 'subs' => [
        ['name' => dflc_t('食品饮料标签'), 'img' => 'food-beverage.jpg', 'sub' => 'food-beverage'],
        ['name' => dflc_t('酒水标签'), 'img' => 'wine-liquor.jpg', 'sub' => 'wine-liquor'],
        ['name' => dflc_t('日化化妆品标签'), 'img' => 'cosmetics.jpg', 'sub' => 'cosmetics'],
        ['name' => dflc_t('电子电器标签'), 'img' => 'electronics.jpg', 'sub' => 'electronics'],
      ]],
      ['title' => dflc_t('宣传物料印刷'), 'slug' => 'marketing-materials', 'subs' => [
        ['name' => dflc_t('企业画册'), 'img' => 'company-brochure.jpg', 'sub' => 'company-brochure'],
        ['name' => dflc_t('产品画册'), 'img' => 'product-catalog.jpg', 'sub' => 'product-catalog'],
        ['name' => dflc_t('海报'), 'img' => 'poster.jpg', 'sub' => 'poster'],
        ['name' => dflc_t('说明书'), 'img' => 'manual.jpg', 'sub' => 'manual'],
      ]],
      ['title' => dflc_t('包装盒印刷'), 'slug' => 'box-packaging', 'subs' => [
        ['name' => dflc_t('白卡纸盒'), 'img' => 'white-cardboard-box.jpg', 'sub' => 'white-cardboard-box'],
        ['name' => dflc_t('彩盒包装'), 'img' => 'color-box.jpg', 'sub' => 'color-box'],
        ['name' => dflc_t('礼品盒'), 'img' => 'gift-box.jpg', 'sub' => 'gift-box'],
        ['name' => dflc_t('食品包装盒'), 'img' => 'food-box.jpg', 'sub' => 'food-box'],
      ]],
      ['title' => dflc_t('纸制品印刷'), 'slug' => 'paper-products', 'subs' => [
        ['name' => dflc_t('手提袋'), 'img' => 'hand-bag.jpg', 'sub' => 'hand-bag'],
        ['name' => dflc_t('纸袋'), 'img' => 'paper-bag.jpg', 'sub' => 'paper-bag'],
        ['name' => dflc_t('纸杯'), 'img' => 'paper-cup.jpg', 'sub' => 'paper-cup'],
        ['name' => dflc_t('信封信纸'), 'img' => 'envelope-letter.jpg', 'sub' => 'envelope-letter'],
      ]],
    ];

    $img_base = home_url('/wp-content/uploads/products/');
    foreach ($home_cats as $cat):
    ?>
    <div class="home-cat-row">
      <div class="home-cat-header">
        <h3 class="home-cat-title"><?php echo $cat['title']; ?></h3>
        <a href="<?php echo home_url('/products/'); ?>?cat=<?php echo $cat['slug']; ?>" class="home-cat-more"><?php echo dflc_t('查看更多'); ?> →</a>
      </div>
      <div class="home-cat-grid">
        <?php foreach ($cat['subs'] as $sub): ?>
        <a href="<?php echo home_url('/products/?cat=' . $cat['slug'] . '&sub=' . $sub['sub']); ?>" class="home-cat-card">
          <div class="home-cat-thumb">
            <img src="<?php echo $img_base . $cat['slug'] . '/' . $sub['img']; ?>" alt="<?php echo $sub['name']; ?>" loading="lazy">
          </div>
          <span class="home-cat-label"><?php echo $sub['name']; ?></span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>

  </div>
</section>

<!-- ===== 生产实力 / Production ===== -->
<section id="production" class="section-alt">
  <div class="container">
    <div class="section-title"><span class="en">Production</span><span class="cn"><?php echo dflc_t('生产实力'); ?></span><span class="line"></span></div>
    <p class="section-subtitle"><?php echo dflc_t('先进印刷与后道设备，保障每一步品质'); ?></p>
    <div class="production-img-grid">
      <?php
      $prod_imgs = [
        ['/wp-content/uploads/2026/05/equipment/1565414671.jpg', dflc_t('德国博世Rexroth六色UV印刷生产线')],
        ['/wp-content/uploads/2026/05/equipment/1565412427.jpg', dflc_t('海德堡多色胶印机')],
        ['/wp-content/uploads/2026/05/equipment/1565408204.jpg', dflc_t('全自动模切设备')],
        ['/wp-content/uploads/2026/05/equipment/1565409756.jpg', dflc_t('数码印刷产线')],
        ['/wp-content/uploads/2026/05/equipment/1565411248.jpg', dflc_t('后道加工中心')],
        ['/wp-content/uploads/2026/05/equipment/1565406568.jpg', dflc_t('品检分条设备')],
      ];
      foreach ($prod_imgs as $img): ?>
      <a href="<?php echo dflc_nav_url(130, '/production/'); ?>" class="production-img-card">
        <img src="<?php echo $img[0]; ?>" alt="<?php echo $img[1]; ?>" loading="lazy">
        <div class="overlay"><?php echo $img[1]; ?></div>
      </a>
      <?php endforeach; ?>
      <a href="<?php echo dflc_nav_url(130, '/production/'); ?>" class="production-img-more">
        <span><?php echo dflc_t('查看更多'); ?></span>
        <span class="arrow">→</span>
      </a>
    </div>
  </div>
</section>

<!-- ===== 行业应用 / Industries ===== -->
<section id="industries" class="section-alt">
  <div class="container">
    <div class="section-title"><span class="en">Industries</span><span class="cn"><?php echo dflc_t('行业应用'); ?></span><span class="line"></span></div>
    <p class="section-subtitle"><?php echo dflc_t('服务多元行业，提供定制化包装印刷方案'); ?></p>
    <div class="industries-grid">
      <?php
      $industry_query = new WP_Query(['post_type' => 'industry', 'posts_per_page' => 6, 'orderby' => 'date', 'order' => 'ASC']);
      $n = 0;
      if ($industry_query->have_posts()):
        while ($industry_query->have_posts()): $industry_query->the_post(); $n++; ?>
        <div class="industry-card">
          <div class="idx"><?php echo str_pad($n, 2, '0', STR_PAD_LEFT); ?></div>
          <div>
            <h3><?php the_title(); ?></h3>
            <p><?php echo get_post_meta(get_the_ID(), 'industry_desc', true) ?: get_the_excerpt(); ?></p>
          </div>
        </div>
      <?php endwhile; wp_reset_postdata(); endif; ?>
    </div>
  </div>
</section>

<!-- ===== 材质与工艺 / Materials & Craft ===== -->
<section id="materials">
  <div class="container">
    <div class="section-title"><span class="en">Materials &amp; Craft</span><span class="cn"><?php echo dflc_t('材质与工艺'); ?></span><span class="line"></span></div>
    <p class="section-subtitle"><?php echo dflc_t('精选优质材料，结合先进印刷与表面处理工艺'); ?></p>
    <div class="materials-grid">
      <div class="material-card">
        <div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/coated-paper.jpg'); ?>" alt="Surface Finishing" loading="lazy"></div>
        <div class="info"><h3><?php echo dflc_t('表面整饰'); ?></h3><p><?php echo dflc_t('烫金 · 击凸 · 压凹。高端3D触感工艺，提升品牌质感'); ?></p></div>
      </div>
      <div class="material-card">
        <div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/synthetic.jpg'); ?>" alt="Protective Coatings" loading="lazy"></div>
        <div class="info"><h3><?php echo dflc_t('防护工艺'); ?></h3><p><?php echo dflc_t('覆膜 · 上光。增强光泽与耐用性，延长产品寿命'); ?></p></div>
      </div>
      <div class="material-card">
        <div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/cardboard.jpg'); ?>" alt="Cardboard Series" loading="lazy"></div>
        <div class="info"><h3><?php echo dflc_t('卡纸材料系列'); ?></h3><p><?php echo dflc_t('白卡 · 灰板。高挺度与印刷适性优异，适用于包装盒与吊牌'); ?></p></div>
      </div>
      <div class="material-card">
        <div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/surface-finish.jpg'); ?>" alt="Synthetic Material Series" loading="lazy"></div>
        <div class="info"><h3><?php echo dflc_t('合成材料系列'); ?></h3><p><?php echo dflc_t('PET/PP/PE材料。防水防油耐撕，适用于严苛使用场景'); ?></p></div>
      </div>
      <div class="material-card">
        <div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/protective.jpg'); ?>" alt="Coated Paper Series" loading="lazy"></div>
        <div class="info"><h3><?php echo dflc_t('涂层纸系列'); ?></h3><p><?php echo dflc_t('铜版纸 · 哑粉纸。色彩鲜艳细节丰富，适用于高端标签与包装'); ?></p></div>
      </div>
      <div class="material-card">
        <div class="preview"><img src="<?php echo home_url('/wp-content/uploads/materials/digital-craft.jpg'); ?>" alt="Digital Finishing" loading="lazy"></div>
        <div class="info"><h3><?php echo dflc_t('数字工艺'); ?></h3><p><?php echo dflc_t('可变二维码 · 条形码 · 序列号。精准溯源，每件产品可追踪'); ?></p></div>
      </div>
    </div>
  </div>
</section>

<!-- ===== 企业优势 / Advantages ===== -->
<section id="advantages" class="section-alt">
  <div class="container">
    <div class="section-title"><span class="en">Advantages</span><span class="cn"><?php echo dflc_t('企业优势'); ?></span><span class="line"></span></div>
    <p class="section-subtitle"><?php echo dflc_t('深耕行业十五年，以专业赢得客户信赖'); ?></p>
    <div class="advantages-grid">
      <div class="advantage-card">
        <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/icons/scale-production.svg" alt="<?php echo dflc_t('规模生产'); ?>" width="64" height="64"></div>
        <h3><?php echo dflc_t('规模生产'); ?></h3>
        <p><?php echo dflc_t('6000㎡现代化车间，多条自动化产线，稳定产能保障交期'); ?></p>
      </div>
      <div class="advantage-card">
        <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/icons/quality-control.svg" alt="<?php echo dflc_t('品质管控'); ?>" width="64" height="64"></div>
        <h3><?php echo dflc_t('品质管控'); ?></h3>
        <p><?php echo dflc_t('ISO认证质量管理体系，全流程在线检测，高合格率保障'); ?></p>
      </div>
      <div class="advantage-card">
        <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/icons/fast-response.svg" alt="<?php echo dflc_t('快速响应'); ?>" width="64" height="64"></div>
        <h3><?php echo dflc_t('快速响应'); ?></h3>
        <p><?php echo dflc_t('7×24小时在线响应，最快48小时出样，紧急订单优先排产'); ?></p>
      </div>
      <div class="advantage-card">
        <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/icons/professional-team.svg" alt="<?php echo dflc_t('专业团队'); ?>" width="64" height="64"></div>
        <h3><?php echo dflc_t('专业团队'); ?></h3>
        <p><?php echo dflc_t('资深印前设计师与经验丰富的印刷技师，提供全方位技术支持'); ?></p>
      </div>
    </div>
  </div>
</section>

<!-- ===== 关于我们 / About Us ===== -->
<section id="about">
  <div class="container">
    <div class="about-content">
      <div class="about-text">
        <div class="section-title" style="text-align:left;margin-bottom:24px;"><span class="en">About Us</span><span class="cn"><?php echo dflc_t('关于我们'); ?></span></div>
        <p><?php echo dflc_t('公司成立于2010年，青岛东方丽彩包装有限公司是集设计、印刷、后道加工于一体的专业包装印刷企业。公司位于青岛，拥有6000㎡现代化生产基地，配备海德堡多色胶印机、全自动模切机、HP Indigo数码印刷机等先进设备。'); ?></p>
        <p><?php echo dflc_t('主营卷筒不干胶标签、包装盒、手提袋、说明书、宣传画册、可变二维码标签等。服务客户涵盖食品饮料、日化美妆、医药健康、电子电器、酒类茶叶、电商物流等多个行业。'); ?></p>
        <p><?php echo dflc_t('东方丽彩秉持「品质为本、客户至上」的理念，以专业的技术和用心的服务，为客户提供从设计到成品的一站式包装印刷解决方案。'); ?></p>
      </div>
      <div class="about-visual">
        <div class="factory-icon">🏭</div>
      </div>
    </div>
  </div>
</section>

<!-- ===== 联系我们 / Contact ===== -->
<section id="contact" class="section-alt">
  <div class="container">
    <div class="section-title"><span class="en">Contact</span><span class="cn"><?php echo dflc_t('联系我们'); ?></span><span class="line"></span></div>
    <p class="section-subtitle"><?php echo dflc_t('期待与您合作，提供专业的包装印刷解决方案'); ?></p>
    <div class="contact-content">
      <div class="contact-info">
        <div class="contact-info-item">
          <div class="icon">📍</div>
          <div><h3><?php echo dflc_t('地址'); ?></h3><p><?php echo dflc_t('青岛市城阳区书雨路118号'); ?></p></div>
        </div>
        <div class="contact-info-item">
          <div class="icon">📞</div>
          <div>
            <h3><?php echo dflc_t('联系电话'); ?></h3>
            <dl class="contact-phone-list">
              <div><dt><?php echo dflc_t('手机'); ?></dt><dd><a href="tel:18705328806">18705328806</a></dd></div>
              <div><dt><?php echo dflc_t('办公室电话'); ?></dt><dd><a href="tel:053288860880">0532-8886 0880</a></dd></div>
            </dl>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="icon">✉️</div>
          <div><h3><?php echo dflc_t('电子邮箱'); ?></h3><p>79927940@qq.com</p></div>
        </div>
      </div>
      <form class="contact-form" onsubmit="return dflc_submit_contact(event)">
        <input type="text" name="customer_name" placeholder="<?php echo dflc_t('您的姓名'); ?>" required>
        <input type="tel" name="customer_phone" placeholder="<?php echo dflc_t('联系电话'); ?>" required>
        <input type="email" name="customer_email" placeholder="<?php echo dflc_t('电子邮箱'); ?>">
        <textarea name="notes" placeholder="<?php echo dflc_t('请描述您的需求，我们会尽快与您联系'); ?>"></textarea>
        <button type="submit" class="btn btn-primary"><?php echo dflc_t('提交留言'); ?></button>
      </form>
    </div>
  </div>
</section>

<script>
var DFLCT = {
  success_msg: '<?php echo dflc_t('提交成功'); ?>',
  success_desc: '<?php echo dflc_t('我们会在24小时内与你联系'); ?>',
  fail_msg: '<?php echo dflc_t('提交失败，请重试'); ?>',
  network_err: '<?php echo dflc_t('网络错误，请稍后重试'); ?>',
};
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
      form.innerHTML = '<div style="text-align:center;padding:32px"><p style="font-size:2rem">✅</p><h3>' + DFLCT.success_msg + '</h3><p style="color:var(--gray-400);margin-top:8px;">' + DFLCT.success_desc + '</p></div>';
    } else {
      alert(json.data?.message || DFLCT.fail_msg);
    }
  } catch(e) {
    alert(DFLCT.network_err);
  }
}
</script>

<?php get_footer(); ?>
