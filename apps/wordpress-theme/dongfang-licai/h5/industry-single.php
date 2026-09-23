<?php while (have_posts()) : the_post();
  $icon = get_post_meta(get_the_ID(), 'industry_icon', true) ?: '🏭'; ?>
<section class="section section-white" style="padding-top:68px;">
  <div class="px" style="text-align:center;">
    <div style="font-size:4rem;margin-bottom:12px;"><?php echo $icon; ?></div>
    <h1 style="font-size:1.35rem;font-weight:800;margin-bottom:12px;"><?php the_title(); ?></h1>
    <div style="font-size:.92rem;line-height:1.9;color:var(--gray-600);text-align:left;"><?php the_content(); ?></div>
    <a href="<?php echo home_url('/industries/'); ?>" style="display:inline-block;margin-top:24px;color:var(--primary);font-size:.85rem;">&larr; 返回行业列表</a>
  </div>
</section>
<?php endwhile; ?>
