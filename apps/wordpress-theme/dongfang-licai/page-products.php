<?php
/**
 * Template Name: 产品中心
 */
if (dflc_is_mobile()):
    include get_template_directory() . '/h5/header.php';
    include get_template_directory() . '/h5/products-content.php';
    include get_template_directory() . '/h5/footer.php';
    return;
endif;
get_header(); ?>
<section style="padding-top: 120px;">
  <div class="container">
    <div class="section-title"><span class="en">Products</span><span class="cn">产品中心</span><span class="line"></span></div>
    <div class="products-grid" style="margin-top:40px;">
      <?php
      $products = new WP_Query(['post_type' => 'product', 'posts_per_page' => 20, 'post_status' => 'publish']);
      if ($products->have_posts()) : while ($products->have_posts()) : $products->the_post(); ?>
        <a href="<?php the_permalink(); ?>" class="product-card" style="text-align:center;">
          <?php if (has_post_thumbnail()): ?>
            <div class="thumb"><?php the_post_thumbnail('medium'); ?></div>
          <?php else: ?>
            <div class="icon">📦</div>
          <?php endif; ?>
          <h3><?php the_title(); ?></h3>
          <?php
          $material = wp_get_post_terms(get_the_ID(), 'pa_material', ['fields' => 'names']);
          $craft    = wp_get_post_terms(get_the_ID(), 'pa_craft', ['fields' => 'names']);
          ?>
          <p>
            <?php if ($material) echo '材质：' . implode('/', $material); ?>
            <?php if ($craft) echo '<br>工艺：' . implode('、', $craft); ?>
          </p>
        </a>
      <?php endwhile; wp_reset_postdata(); endif; ?>
    </div>
  </div>
</section>
<?php get_footer(); ?>
