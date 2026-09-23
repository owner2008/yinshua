<section class="section section-white" style="padding-top:68px;">
  <div class="px">
    <div class="section-label">Cases</div>
    <h2 class="section-heading">产品案例</h2>
    <p class="section-sub">左右滑动查看 →</p>
  </div>
  <div class="case-scroll">
    <?php
    $colors = ['fef3c7-fde68a','dbeafe-bfdbfe','d1fae5-a7f3d0','fce7f3-fbcfe8','ede9fe-d8b4fe','fef9c3-fef08a'];
    $ci = 0;
    if (have_posts()) : while (have_posts()) : the_post();
      $cols = explode('-', $colors[$ci % 6]);
      $craft = get_post_meta(get_the_ID(), 'case_craft', true); $ci++; ?>
      <a href="<?php the_permalink(); ?>" class="case-card">
        <div class="thumb" style="background:linear-gradient(135deg,#<?php echo $cols[0]; ?>,#<?php echo $cols[1]; ?>);"><?php the_title(); ?></div>
        <div class="info"><h3><?php the_title(); ?></h3><p><?php echo $craft; ?></p></div>
      </a>
    <?php endwhile; endif; ?>
  </div>
</section>
