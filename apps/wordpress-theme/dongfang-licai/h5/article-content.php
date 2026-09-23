<!-- H5 文章详情 -->
<?php while (have_posts()): the_post(); ?>
<div class="section" style="padding-top:16px;">
  <div class="px">
    <!-- Breadcrumb -->
    <div style="margin-bottom:16px;font-size:.75rem;">
      <a href="<?php echo home_url('/'); ?>" style="color:var(--gray-400);">首页</a>
      <span style="color:var(--gray-300);margin:0 6px;">›</span>
      <a href="<?php echo home_url('/news/'); ?>" style="color:var(--gray-400);">行业资讯</a>
    </div>

    <h1 style="font-size:1.35rem;font-weight:800;color:var(--text);line-height:1.5;margin-bottom:12px;"><?php the_title(); ?></h1>

    <div style="font-size:.75rem;color:var(--gray-400);margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--gray-200);">
      <span>📅 <?php echo get_the_date('Y年m月d日'); ?></span>
      <span style="margin-left:12px;">✍️ <?php the_author(); ?></span>
    </div>

    <div style="font-size:.92rem;line-height:2;color:var(--gray-600);">
      <?php the_content(); ?>
    </div>

    <!-- Back -->
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--gray-200);">
      <a href="<?php echo home_url('/news/'); ?>" style="display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-weight:600;font-size:.9rem;">
        ← 返回资讯列表
      </a>
    </div>
  </div>
</div>
<?php endwhile; ?>
