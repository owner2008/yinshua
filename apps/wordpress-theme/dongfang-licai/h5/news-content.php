<!-- H5 行业资讯列表 -->
<div class="section" style="padding-top:16px;">
  <div class="px">
    <div class="section-label">行业资讯</div>
    <div class="section-heading">标签印刷动态</div>
    <div class="section-sub">技术分享 · 政策解读 · 行业趋势</div>
  </div>

  <?php if (have_posts()): ?>
  <div style="display:flex;flex-direction:column;gap:12px;padding:0 16px;">
    <?php while (have_posts()): the_post(); ?>
    <a href="<?php the_permalink(); ?>" style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;gap:14px;">
      <div style="flex-shrink:0;width:44px;text-align:center;padding-top:2px;">
        <div style="font-size:1.4rem;font-weight:800;color:var(--primary);line-height:1;"><?php echo get_the_date('d'); ?></div>
        <div style="font-size:.65rem;color:var(--gray-400);"><?php echo get_the_date('Y.m'); ?></div>
      </div>
      <div style="flex:1;min-width:0;">
        <h3 style="font-size:.92rem;font-weight:700;color:var(--text);margin-bottom:6px;line-height:1.5;"><?php the_title(); ?></h3>
        <p style="font-size:.78rem;color:var(--gray-500);line-height:1.7;">
          <?php echo wp_trim_words(get_the_excerpt() ?: get_the_content(), 30); ?>
        </p>
      </div>
    </a>
    <?php endwhile; ?>
  </div>

  <!-- Pagination -->
  <?php if ($wp_query->max_num_pages > 1): ?>
  <div style="text-align:center;margin-top:24px;padding:0 16px;">
    <?php
    echo paginate_links([
      'total'     => $wp_query->max_num_pages,
      'current'   => max(1, get_query_var('paged')),
      'prev_text' => '‹ 上一页',
      'next_text' => '下一页 ›',
      'mid_size'  => 1,
    ]);
    ?>
  </div>
  <?php endif; ?>

  <?php else: ?>
  <div style="text-align:center;padding:60px 16px;color:var(--gray-400);">
    <p>暂无资讯文章</p>
  </div>
  <?php endif; ?>
</div>
