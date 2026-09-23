<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<nav class="nav" id="nav">
  <div class="container">
    <a href="<?php echo function_exists('dflc_home_url') ? dflc_home_url() : home_url('/'); ?>" class="nav-logo">
      <span class="logo-icon">DF</span>
      <span><?php echo dflc_t('青岛东方丽彩'); ?></span>
    </a>
    <div class="nav-links" id="navLinks">
      <!-- 首页 -->
      <a href="<?php echo function_exists('dflc_home_url') ? dflc_home_url() : home_url('/'); ?>"
         <?php if (is_front_page()): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('首页'); ?>
      </a>
      <!-- 主营产品 ID=32 -->
      <a href="<?php echo dflc_nav_url(32, '/products/'); ?>"
         <?php if (dflc_nav_active('/products/') || dflc_nav_active('/product/') || dflc_nav_active('/products-en/')): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('主营产品'); ?>
      </a>
      <!-- 生产实力 ID=130 -->
      <a href="<?php echo dflc_nav_url(130, '/production/'); ?>"
         <?php if (dflc_nav_active('/production/') || dflc_nav_active('/production-capability/')): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('生产实力'); ?>
      </a>
      <!-- 关于我们 ID=52 -->
      <a href="<?php echo dflc_nav_url(52, '/about/'); ?>"
         <?php if (dflc_nav_active('/about/') || dflc_nav_active('/about-us/')): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('关于我们'); ?>
      </a>
      <!-- 人才招聘 ID=123 -->
      <a href="<?php echo dflc_nav_url(123, '/jobs/'); ?>"
         <?php if (dflc_nav_active('/jobs/') || dflc_nav_active('/join-us/')): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('人才招聘'); ?>
      </a>
      <!-- 行业应用 CPT archive -->
      <a href="<?php echo home_url(dflc_t('行业应用') === 'Industries' ? '/en/industries/' : '/industries/'); ?>"
         <?php if (dflc_nav_active('/industries/') || dflc_nav_active('/industry/')): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('行业应用'); ?>
      </a>
      <!-- 行业资讯 ID=116 -->
      <a href="<?php echo dflc_nav_url(116, '/news/'); ?>"
         <?php if (dflc_nav_active('/news/') || dflc_nav_active('/news-en/')): ?>class="active"<?php endif; ?>>
         <?php echo dflc_t('行业资讯'); ?>
      </a>
      <!-- 联系我们 ID=54 -->
      <a href="<?php echo dflc_nav_url(54, '/contact/'); ?>" class="nav-contact-btn">
         <?php echo dflc_t('联系我们'); ?>
      </a>
      <?php if (function_exists('pll_the_languages')): ?>
      <span class="lang-switch">
        <?php
        $langs = pll_the_languages(['raw' => 1]);
        if ($langs) foreach ($langs as $l):
          $name = $l['slug'] === 'zh' ? '中文' : 'EN';
          echo '<a href="' . esc_url($l['url']) . '"' . ($l['current_lang'] ? ' class="active"' : '') . '>' . $name . '</a>';
        endforeach;
        ?>
      </span>
      <?php endif; ?>
    </div>
    <button class="menu-toggle" id="menuToggle" aria-label="<?php echo dflc_t('菜单'); ?>">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
