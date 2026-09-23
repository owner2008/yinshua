<?php
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/industry-single.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;
get_header(); ?>
<?php while (have_posts()) : the_post();
  $icon = get_post_meta(get_the_ID(), 'industry_icon', true) ?: '🏭';
  $desc = get_post_meta(get_the_ID(), 'industry_desc', true); ?>
<section style="padding-top:120px;padding-bottom:60px;">
  <div class="container" style="max-width:900px;">
    <div style="text-align:center;font-size:4rem;margin-bottom:16px;"><?php echo $icon; ?></div>
    <h1 style="font-size:2rem;text-align:center;margin-bottom:16px;"><?php the_title(); ?></h1>
    <?php if ($desc): ?><p style="text-align:center;color:var(--text-muted);margin-bottom:32px;"><?php echo $desc; ?></p><?php endif; ?>
    <div style="font-size:1.05rem;line-height:2;color:var(--gray-600);"><?php the_content(); ?></div>
    <a href="<?php echo home_url('/industries/'); ?>" style="display:inline-flex;margin-top:32px;color:var(--primary);">&larr; <?php echo dflc_t('返回行业列表'); ?></a>
  </div>
</section>
<?php endwhile; ?>
<?php get_footer(); ?>
