<section class="section section-white" style="padding-top:68px;">
  <div class="px">
    <div class="section-label">Products</div>
    <h2 class="section-heading">产品中心</h2>
    <div class="product-grid" style="margin-top:4px;">
      <?php
      $products = new WP_Query(['post_type'=>'product','posts_per_page'=>20,'post_status'=>'publish']);
      if ($products->have_posts()) : while ($products->have_posts()) : $products->the_post(); ?>
        <a href="<?php the_permalink(); ?>" class="product-item">
          <?php if (has_post_thumbnail()): ?>
            <div class="thumb"><?php the_post_thumbnail('medium'); ?></div>
          <?php else: ?>
            <div class="icon">📦</div>
          <?php endif; ?>
          <h3><?php the_title(); ?></h3>
          <?php
          $material = wp_get_post_terms(get_the_ID(), 'pa_material', ['fields'=>'names']);
          $craft = wp_get_post_terms(get_the_ID(), 'pa_craft', ['fields'=>'names']);
          ?>
          <p><?php if($material) echo implode('/',$material); ?></p>
        </a>
      <?php endwhile; wp_reset_postdata(); endif; ?>
    </div>
  </div>
</section>
