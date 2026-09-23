<!-- Bottom Tab Bar -->
<nav class="bottom-bar">
  <a href="<?php echo home_url('/'); ?>" class="active"><span class="ico">🏠</span><?php echo dflc_t('首页'); ?></a>
  <a href="<?php echo dflc_nav_url(32, '/products/'); ?>"><span class="ico">📦</span><?php echo dflc_t('产品中心'); ?></a>
  <a href="tel:18705328806" class="contact-tab"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
  <a href="<?php echo dflc_nav_url(116, '/news/'); ?>"><span class="ico">📰</span><?php echo dflc_t('行业资讯'); ?></a>
  <a href="javascript:dflc_open_inquiry(0)"><span class="ico">📋</span><?php echo dflc_t('立即咨询'); ?></a>
</nav>

<footer class="footer">
  <h3><?php echo dflc_t('青岛东方丽彩包装有限公司'); ?></h3>
  <p><?php echo dflc_t('专业不干胶标签印刷定制专家'); ?></p>
  <address class="footer-contact">
    <div><span><?php echo dflc_t('手机'); ?></span><a href="tel:18705328806">18705328806</a></div>
    <div><span><?php echo dflc_t('办公室电话'); ?></span><a href="tel:053288860880">0532-8886 0880</a></div>
    <div><span><?php echo dflc_t('电子邮箱'); ?></span><a href="mailto:79927940@qq.com">79927940@qq.com</a></div>
    <div><span><?php echo dflc_t('地址'); ?></span><span><?php echo dflc_t('青岛市城阳区书雨路118号'); ?></span></div>
    <div><span>QQ</span><span>551933467 / 79927940</span></div>
  </address>
</footer>

<script>
function openNav() { document.getElementById('slideNav').classList.add('open'); document.getElementById('overlay').classList.add('open'); }
function closeNav() { document.getElementById('slideNav').classList.remove('open'); document.getElementById('overlay').classList.remove('open'); }
// Active tab
var sections = document.querySelectorAll('section[id]');
var tabs = document.querySelectorAll('.bottom-bar a:not(.contact-tab)');
window.addEventListener('scroll', function() {
  var cur = '';
  sections.forEach(function(s) { if (window.scrollY >= s.offsetTop - 100) cur = s.getAttribute('id'); });
  tabs.forEach(function(t) { t.classList.toggle('active', t.getAttribute('href') === '#' + cur); });
});
</script>

<?php wp_footer(); ?>
</body>
</html>
