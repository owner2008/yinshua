<?php
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/cases-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;
get_header(); ?>
<section style="padding-top: 120px;">
  <div class="container">
    <div class="section-title"><span class="en">Cases</span><span class="cn"><?php echo dflc_t('产品案例'); ?></span><span class="line"></span></div>
    <div class="cases-grid" style="margin-top:40px;">
      <?php
      $case_colors = ['fef3c7-fde68a', 'dbeafe-bfdbfe', 'd1fae5-a7f3d0', 'fce7f3-fbcfe8', 'ede9fe-d8b4fe', 'fef9c3-fef08a'];
      $ci = 0;
      if (have_posts()) : while (have_posts()) : the_post();
        $colors = explode('-', $case_colors[$ci % 6]);
        $craft = get_post_meta(get_the_ID(), 'case_craft', true);
        $ci++; ?>
        <a href="<?php the_permalink(); ?>" class="case-card">
          <div class="thumb" style="background:linear-gradient(135deg,#<?php echo $colors[0]; ?>,#<?php echo $colors[1]; ?>);">
            <?php if (has_post_thumbnail()): the_post_thumbnail('medium'); else: ?><span style="font-weight:600;color:var(--text-muted);"><?php the_title(); ?></span><?php endif; ?>
          </div>
          <div class="info"><h3><?php the_title(); ?></h3><p><?php echo $craft; ?></p></div>
        </a>
      <?php endwhile; endif; ?>
    </div>
  </div>
</section>
<?php get_footer(); ?>
