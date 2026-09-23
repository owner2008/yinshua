<section class="section" style="padding-top:68px;">
  <div class="px">
    <div class="section-label">Industries</div>
    <h2 class="section-heading">行业应用</h2>
    <p class="section-sub">左右滑动查看 →</p>
  </div>
  <div class="industry-scroll">
    <?php
    if (have_posts()) : while (have_posts()) : the_post();
      $icon = get_post_meta(get_the_ID(), 'industry_icon', true) ?: '🏭';
      $desc = get_post_meta(get_the_ID(), 'industry_desc', true) ?: get_the_excerpt(); ?>
      <a href="<?php the_permalink(); ?>" class="industry-item" style="text-align:center;">
        <div class="icon"><?php echo $icon; ?></div>
        <h3><?php the_title(); ?></h3>
        <p><?php echo $desc; ?></p>
      </a>
    <?php endwhile; endif; ?>
  </div>
</section>
