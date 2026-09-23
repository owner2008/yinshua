<?php
/**
 * Default Page Template
 */

if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/page-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;

get_header(); ?>

<?php while (have_posts()): the_post(); ?>

<section style="padding-top: 120px; padding-bottom: 60px;">
  <div class="container">
    <div class="section-title">
      <span class="en"><?php echo get_post_meta(get_the_ID(), '_dflc_en_title', true) ?: 'Page'; ?></span>
      <span class="cn"><?php the_title(); ?></span>
      <span class="line"></span>
    </div>
    <?php the_content(); ?>
  </div>
</section>

<?php endwhile; ?>

<?php get_footer(); ?>
