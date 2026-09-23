<?php
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/industries-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;
get_header(); ?>
<section style="padding-top: 120px;">
  <div class="container">
    <div class="section-title"><span class="en">Industries</span><span class="cn">行业应用</span><span class="line"></span></div>
    <p class="section-subtitle">产品覆盖多行业领域，为不同行业客户提供定制化包装印刷解决方案</p>
    <div class="industries-grid" style="margin-top:40px;">
      <?php
      $n = 0;
      if (have_posts()) : while (have_posts()) : the_post(); $n++;
        $icon = get_post_meta(get_the_ID(), 'industry_icon', true) ?: '🏭';
        $desc = get_post_meta(get_the_ID(), 'industry_desc', true) ?: get_the_excerpt(); ?>
        <a href="<?php the_permalink(); ?>" class="industry-card" style="text-decoration:none;">
          <div class="idx"><?php echo $icon; ?></div>
          <div><h3><?php the_title(); ?></h3><p><?php echo $desc; ?></p></div>
        </a>
      <?php endwhile; endif; ?>
    </div>
  </div>
</section>
<?php get_footer(); ?>
