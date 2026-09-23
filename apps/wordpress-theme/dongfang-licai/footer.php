<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <h3><?php echo dflc_t('青岛东方丽彩包装有限公司'); ?></h3>
        <p><?php echo dflc_t('专业标签与包装印刷服务商。主营不干胶标签、包装盒、手提袋、说明书、宣传画册等全品类印刷。'); ?></p>
        <address class="footer-contact">
          <div><span><?php echo dflc_t('手机'); ?></span><a href="tel:18705328806">18705328806</a></div>
          <div><span><?php echo dflc_t('办公室电话'); ?></span><a href="tel:053288860880">0532-8886 0880</a></div>
          <div><span><?php echo dflc_t('电子邮箱'); ?></span><a href="mailto:79927940@qq.com">79927940@qq.com</a></div>
          <div><span><?php echo dflc_t('地址'); ?></span><span><?php echo dflc_t('青岛市城阳区书雨路118号'); ?></span></div>
          <div><span>QQ</span><span>551933467 / 79927940</span></div>
        </address>
      </div>
      <div class="footer-col">
        <h3><?php echo dflc_t('产品中心'); ?></h3>
        <a href="<?php echo home_url('/products/?cat=label-printing'); ?>"><?php echo dflc_t('标签印刷'); ?></a>
        <a href="<?php echo home_url('/products/?cat=box-packaging'); ?>"><?php echo dflc_t('包装盒印刷'); ?></a>
        <a href="<?php echo home_url('/products/?cat=marketing-materials'); ?>"><?php echo dflc_t('宣传物料印刷'); ?></a>
        <a href="<?php echo home_url('/products/?cat=paper-products'); ?>"><?php echo dflc_t('纸制品印刷'); ?></a>
      </div>
      <div class="footer-col">
        <h3><?php echo dflc_t('关于我们'); ?></h3>
        <a href="<?php echo dflc_nav_url(52, '/about/'); ?>"><?php echo dflc_t('公司简介'); ?></a>
        <a href="<?php echo dflc_nav_url(130, '/production/'); ?>"><?php echo dflc_t('生产实力'); ?></a>
        <a href="<?php echo dflc_nav_url(116, '/news/'); ?>"><?php echo dflc_t('行业资讯'); ?></a>
        <a href="<?php echo dflc_nav_url(54, '/contact/'); ?>"><?php echo dflc_t('联系我们'); ?></a>
      </div>
      <div class="footer-col">
        <h3><?php echo dflc_t('客户服务'); ?></h3>
        <a href="<?php echo dflc_nav_url(32, '/products/'); ?>"><?php echo dflc_t('产品目录'); ?></a>
        <a href="<?php echo dflc_nav_url(54, '/contact/'); ?>"><?php echo dflc_t('在线询价'); ?></a>
        <a href="<?php echo dflc_nav_url(123, '/jobs/'); ?>"><?php echo dflc_t('人才招聘'); ?></a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; <?php echo date('Y'); ?> <?php echo dflc_t('青岛东方丽彩包装有限公司'); ?>. All Rights Reserved. <a href="https://beian.miit.gov.cn/#/Integrated/recordQuery" target="_blank" rel="nofollow" style="color:var(--text-muted);">鲁ICP备19044317号-1</a></p>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
