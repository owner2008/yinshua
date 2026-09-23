<?php
/**
 * Single post view — 文章详情
 */

if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/article-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;

get_header(); ?>

<?php while (have_posts()): the_post(); ?>

<section style="padding-top: 120px; padding-bottom: 60px;">
  <div class="container" style="max-width: 800px;">

    <!-- Breadcrumb -->
    <div style="margin-bottom: 24px; font-size: 0.875rem; color: var(--text-muted);">
      <a href="<?php echo home_url('/'); ?>" style="color: var(--text-muted);">首页</a>
      &nbsp;›&nbsp;
      <a href="<?php echo home_url('/news/'); ?>" style="color: var(--text-muted);">行业资讯</a>
      &nbsp;›&nbsp;
      <span style="color: var(--primary);"><?php the_title(); ?></span>
    </div>

    <!-- Article -->
    <article>
      <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text); line-height: 1.4; margin-bottom: 16px;">
        <?php the_title(); ?>
      </h1>

      <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
        <span>📅 <?php echo get_the_date('Y年m月d日'); ?></span>
        <span style="margin-left: 16px;">✍️ <?php the_author(); ?></span>
      </div>

      <div style="font-size: 1rem; line-height: 2; color: var(--gray-600);">
        <?php the_content(); ?>
      </div>

      <!-- Back -->
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border);">
        <a href="<?php echo home_url('/news/'); ?>" style="display: inline-flex; align-items: center; gap: 6px; color: var(--primary); font-weight: 500; text-decoration: none;">
          ← 返回资讯列表
        </a>
      </div>
    </article>

  </div>
</section>

<?php endwhile; ?>

<?php get_footer(); ?>
