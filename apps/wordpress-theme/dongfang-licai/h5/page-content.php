<!-- H5 通用页面（关于我们、联系我们等） -->
<?php while (have_posts()): the_post(); ?>
<div class="section" style="padding-top:16px;">
  <div class="px">
    <div class="section-heading" style="margin-bottom:16px;"><?php the_title(); ?></div>
    <div style="font-size:.92rem;line-height:2;color:var(--gray-600);">
      <?php the_content(); ?>
    </div>
  </div>
</div>
<?php endwhile; ?>
