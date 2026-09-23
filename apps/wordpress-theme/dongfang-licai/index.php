<?php
/**
 * Blog / News listing — 行业资讯
 * Shows article titles list with excerpts.
 */

if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/news-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;

get_header(); ?>

<section style="padding-top: 120px; padding-bottom: 60px;">
  <div class="container" style="max-width: 860px;">

    <div class="section-title">
      <span class="en">News</span>
      <span class="cn">行业资讯</span>
      <span class="line"></span>
    </div>
    <p class="section-subtitle">标签印刷行业动态、技术分享与政策解读</p>

    <?php if (have_posts()): ?>
    <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 0;">
      <?php while (have_posts()): the_post(); ?>
      <article style="padding: 24px 0; border-bottom: 1px solid var(--border); transition: background .2s;">
        <div style="display: flex; gap: 20px; align-items: flex-start;">
          <!-- Date -->
          <div style="flex-shrink: 0; width: 60px; text-align: center; padding-top: 2px;">
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--primary); line-height: 1;">
              <?php echo get_the_date('d'); ?>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              <?php echo get_the_date('Y.m'); ?>
            </div>
          </div>
          <!-- Content -->
          <div style="flex: 1; min-width: 0;">
            <a href="<?php the_permalink(); ?>" style="text-decoration: none;">
              <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text); margin-bottom: 8px; transition: color .2s; line-height: 1.5;">
                <?php the_title(); ?>
              </h2>
            </a>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 10px;">
              <?php echo wp_trim_words(get_the_excerpt() ?: get_the_content(), 40); ?>
            </p>
            <a href="<?php the_permalink(); ?>" style="font-size: 0.85rem; color: var(--primary); font-weight: 500; text-decoration: none;">
              阅读全文 →
            </a>
          </div>
        </div>
      </article>
      <?php endwhile; ?>
    </div>

    <!-- Pagination -->
    <?php
    $total = $wp_query->max_num_pages;
    if ($total > 1):
      $current = max(1, get_query_var('paged'));
    ?>
    <div style="text-align: center; margin-top: 40px;">
      <?php
      echo paginate_links([
        'total'     => $total,
        'current'   => $current,
        'prev_text' => '‹ 上一页',
        'next_text' => '下一页 ›',
        'mid_size'  => 2,
      ]);
      ?>
    </div>
    <?php endif; ?>

    <?php else: ?>
    <div style="text-align: center; padding: 60px 0; color: var(--text-muted);">
      <p style="font-size: 1.1rem;">暂无资讯文章</p>
    </div>
    <?php endif; ?>

  </div>
</section>

<?php get_footer(); ?>
