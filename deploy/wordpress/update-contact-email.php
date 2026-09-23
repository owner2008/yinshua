<?php

if (!defined('ABSPATH')) {
    exit(1);
}

$changes = [
    123 => [
        'before' => '<div style="margin-bottom: 8px">📞 <strong style="color: #1e6b9e">18705328806</strong>（尚经理）</div>',
        'after' => '<div style="margin-bottom: 8px">📞 <strong style="color: #1e6b9e">18705328806</strong>（尚经理）</div>' . "\n" .
            '    <div style="margin-bottom: 8px">✉️ 邮箱：<a href="mailto:qd7931@126.com">qd7931@126.com</a></div>',
    ],
    54 => [
        'before' => "  <p>座机：0532-8886 0880</p>\n</div>",
        'after' => "  <p>座机：0532-8886 0880</p>\n</div>\n\n" .
            '<div style="background:#f5f7fa;padding:24px;border-radius:12px;margin-bottom:24px">' . "\n" .
            '  <p><strong>✉️ 电子邮箱</strong></p>' . "\n" .
            '  <p><a href="mailto:79927940@qq.com">79927940@qq.com</a><br><a href="mailto:qd7931@126.com">qd7931@126.com</a></p>' . "\n" .
            '</div>',
    ],
    153 => [
        'before' => 'Send your resume to: <strong>sales@dongfanglicai.com</strong>',
        'after' => 'Send your resume to: <a href="mailto:qd7931@126.com"><strong>qd7931@126.com</strong></a>',
    ],
    151 => [
        'before' => "    <p>QQ: 551933467 / 79927940<br>WeChat: 18705328806</p>\n  </div>",
        'after' => "    <p>QQ: 551933467 / 79927940<br>WeChat: 18705328806</p>\n  </div>\n" .
            '  <div style="flex:1; min-width:250px;">' . "\n" .
            '    <h4>✉️ Email</h4>' . "\n" .
            '    <p><a href="mailto:79927940@qq.com">79927940@qq.com</a><br><a href="mailto:qd7931@126.com">qd7931@126.com</a></p>' . "\n" .
            '  </div>',
    ],
];

$updates = [];
foreach ($changes as $id => $change) {
    $post = get_post($id);
    if (!$post || $post->post_type !== 'page') {
        throw new RuntimeException("Page {$id} is missing");
    }
    if (str_contains($post->post_content, $change['after'])) {
        echo "Page {$id}: already updated\n";
        continue;
    }
    if (substr_count($post->post_content, $change['before']) !== 1) {
        throw new RuntimeException("Page {$id} no longer matches the expected content");
    }
    $updates[$id] = str_replace($change['before'], $change['after'], $post->post_content);
}

global $wpdb;
$wpdb->query('START TRANSACTION');
try {
    foreach ($updates as $id => $content) {
        $result = $wpdb->update(
            $wpdb->posts,
            [
                'post_content' => $content,
                'post_modified' => current_time('mysql'),
                'post_modified_gmt' => current_time('mysql', true),
            ],
            ['ID' => $id],
            ['%s', '%s', '%s'],
            ['%d']
        );
        if ($result !== 1) {
            throw new RuntimeException("Failed to update page {$id}: {$wpdb->last_error}");
        }
    }
    $wpdb->query('COMMIT');
} catch (Throwable $error) {
    $wpdb->query('ROLLBACK');
    throw $error;
}

foreach (array_keys($updates) as $id) {
    clean_post_cache($id);
    echo "Page {$id}: updated\n";
}
