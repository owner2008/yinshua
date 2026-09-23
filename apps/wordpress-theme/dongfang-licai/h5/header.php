<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="format-detection" content="telephone=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<?php wp_head(); ?>
<!-- WeChat Share Meta -->
<meta property="og:title" content="<?php echo dflc_t('青岛东方丽彩'); ?> — <?php echo dflc_t('专业不干胶标签印刷定制专家'); ?>">
<meta property="og:description" content="Label Printing · Packaging · Handbags · Manuals · Brochures · Commercial Printing">
<meta property="og:image" content="<?php echo get_template_directory_uri(); ?>/h5/og-image.png">
<meta property="og:url" content="<?php echo home_url('/'); ?>">
<meta property="og:type" content="website">
<meta itemprop="name" content="<?php echo dflc_t('青岛东方丽彩'); ?>">
<meta itemprop="description" content="<?php echo dflc_t('专业不干胶标签印刷定制专家'); ?>">
<!-- WeChat browser detection -->
<script>
(function(){var ua=navigator.userAgent.toLowerCase();if(ua.indexOf('micromessenger')!==-1){document.body.classList.add('is-wechat');}})();
</script>
<style>
.is-wechat .bottom-bar { padding-bottom: 0; }
.is-wechat input, .is-wechat textarea { font-size: 16px !important; }
</style>
</head>
<body <?php body_class('h5'); ?>>
<?php wp_body_open(); ?>

<header class="header">
  <a href="<?php echo function_exists('dflc_home_url') ? dflc_home_url() : home_url('/'); ?>" class="header-logo">
    <span class="dot">DF</span><?php echo dflc_t('青岛东方丽彩'); ?>
  </a>
  <div class="header-menu" onclick="openNav()"><span></span><span></span><span></span></div>
</header>

<nav class="slide-nav" id="slideNav">
  <button class="close" onclick="closeNav()">✕</button>
  <a href="<?php echo function_exists('dflc_home_url') ? dflc_home_url() : home_url('/'); ?>" onclick="closeNav()"><?php echo dflc_t('首页'); ?></a>
  <a href="<?php echo dflc_nav_url(32, '/products/'); ?>" onclick="closeNav()"><?php echo dflc_t('主营产品'); ?></a>
  <a href="<?php echo dflc_nav_url(130, '/production/'); ?>" onclick="closeNav()"><?php echo dflc_t('生产实力'); ?></a>
  <a href="<?php echo dflc_nav_url(52, '/about/'); ?>" onclick="closeNav()"><?php echo dflc_t('关于我们'); ?></a>
  <a href="<?php echo dflc_nav_url(123, '/jobs/'); ?>" onclick="closeNav()"><?php echo dflc_t('人才招聘'); ?></a>
  <a href="<?php echo home_url(dflc_t('行业应用') === 'Industries' ? '/en/industries/' : '/industries/'); ?>" onclick="closeNav()"><?php echo dflc_t('行业应用'); ?></a>
  <a href="<?php echo dflc_nav_url(116, '/news/'); ?>" onclick="closeNav()"><?php echo dflc_t('行业资讯'); ?></a>
  <a href="<?php echo dflc_nav_url(54, '/contact/'); ?>" class="contact-btn" onclick="closeNav()"><?php echo dflc_t('联系我们'); ?></a>
  <?php if (function_exists('pll_the_languages')): ?>
  <div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--gray-200)">
    <?php
    $langs = pll_the_languages(['raw' => 1]);
    if ($langs) foreach ($langs as $l):
      $name = $l['slug'] === 'zh' ? '中文' : 'EN';
      echo '<a href="' . esc_url($l['url']) . '" style="padding:8px 14px;border-radius:8px;font-size:.85rem;' . ($l['current_lang'] ? 'background:var(--primary);color:#fff;' : 'background:var(--gray-100);color:var(--gray-600);') . '">' . $name . '</a>';
    endforeach;
    ?>
  </div>
  <?php endif; ?>
</nav>

<div class="overlay" id="overlay" onclick="closeNav()"></div>
