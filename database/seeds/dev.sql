INSERT INTO member_levels (id, name, code, discount_rate, priority)
VALUES
  (1, '普通会员', 'normal', 1.0000, 1),
  (2, '企业客户', 'company', 0.9500, 2);

INSERT INTO product_categories (id, parent_id, name, sort, status)
VALUES
  (1, NULL, '不干胶标签', 10, 'active'),
  (2, NULL, '卷标标签', 20, 'active'),
  (3, NULL, '食品饮料标签', 30, 'active'),
  (4, NULL, '日化美妆标签', 40, 'active'),
  (5, NULL, '可变二维码 / 一物一码标签', 50, 'active');

INSERT INTO products (id, category_id, name, code, description, status)
VALUES
  (1, 1, '不干胶标签', 'STICKER-LABEL', '适用于食品、日化、工业等多场景标签印刷。', 'active'),
  (2, 2, '卷标标签', 'ROLL-LABEL', '适合自动贴标和批量生产，交付稳定。', 'active'),
  (3, 3, '食品饮料标签', 'FOOD-DRINK-LABEL', '耐冷藏、防潮，贴合瓶罐和外包装。', 'active'),
  (4, 4, '日化美妆标签', 'COSMETIC-LABEL', '支持透明膜、烫金和局部 UV，提升货架质感。', 'active'),
  (5, 5, '可变二维码标签', 'QR-TRACEABILITY-LABEL', '支持一物一码、溯源、防伪和营销活动。', 'active');

INSERT INTO product_templates (
  id,
  product_id,
  template_name,
  width_min,
  width_max,
  height_min,
  height_max,
  quantity_min,
  quantity_max,
  allow_custom_shape,
  allow_lamination,
  allow_uv,
  allow_die_cut,
  allow_proofing,
  default_loss_rate,
  min_price,
  status
) VALUES
  (1, 1, '不干胶标签标准报价模板', 20, 420, 20, 420, 500, 300000, TRUE, TRUE, TRUE, TRUE, TRUE, 1.0800, 220, 'active'),
  (2, 2, '卷标标签批量报价模板', 20, 420, 20, 420, 500, 300000, TRUE, TRUE, TRUE, TRUE, TRUE, 1.0800, 220, 'active'),
  (3, 3, '食品饮料标签报价模板', 20, 420, 20, 420, 500, 300000, TRUE, TRUE, TRUE, TRUE, TRUE, 1.0800, 220, 'active'),
  (4, 4, '日化美妆标签报价模板', 20, 420, 20, 420, 500, 300000, TRUE, TRUE, TRUE, TRUE, TRUE, 1.0800, 220, 'active'),
  (5, 5, '可变二维码标签报价模板', 20, 420, 20, 420, 500, 300000, TRUE, TRUE, TRUE, TRUE, TRUE, 1.0800, 220, 'active');

INSERT INTO materials (id, code, name, material_type, unit, status)
VALUES
  (1, 'COATED-PAPER', '铜版纸', 'face', 'm2', 'active'),
  (2, 'PET-CLEAR', 'PET / 透明膜', 'face', 'm2', 'active'),
  (3, 'PP-FILM', 'PP 合成膜', 'face', 'm2', 'active'),
  (4, 'SILVER-PET', '哑银 PET', 'face', 'm2', 'active'),
  (5, 'FRAGILE-SECURITY-PAPER', '防伪易碎纸', 'face', 'm2', 'active');

INSERT INTO material_prices (material_id, price_type, unit_price, effective_from, is_current)
VALUES
  (1, 'calc', 0.8000, '2026-04-21 00:00:00', TRUE),
  (2, 'calc', 1.5000, '2026-04-21 00:00:00', TRUE),
  (3, 'calc', 1.2000, '2026-04-21 00:00:00', TRUE),
  (4, 'calc', 1.6000, '2026-04-21 00:00:00', TRUE),
  (5, 'calc', 1.8000, '2026-04-21 00:00:00', TRUE);

INSERT INTO processes (id, code, name, process_type, fee_mode, status)
VALUES
  (1, 'lamination', '覆膜', 'surface', 'per_area', 'active'),
  (2, 'die_cut', '模切', 'cutting', 'fixed_plus_qty', 'active'),
  (3, 'uv', '局部 UV', 'surface', 'per_area', 'active'),
  (4, 'proofing', '打样', 'proof', 'fixed', 'active'),
  (5, 'hot_stamp', '烫金', 'surface', 'per_area', 'active'),
  (6, 'variable_data', '可变二维码', 'data', 'fixed_plus_qty', 'active');

INSERT INTO process_prices (process_id, fee_mode, unit_price, min_fee, setup_fee, effective_from, is_current)
VALUES
  (1, 'per_area', 0.2000, 0, 0, '2026-04-21 00:00:00', TRUE),
  (2, 'fixed_plus_qty', 0.0100, 0, 80, '2026-04-21 00:00:00', TRUE),
  (3, 'per_area', 0.3000, 0, 0, '2026-04-21 00:00:00', TRUE),
  (4, 'fixed', 100.0000, 0, 0, '2026-04-21 00:00:00', TRUE),
  (5, 'per_area', 1.2000, 50, 100, '2026-04-21 00:00:00', TRUE),
  (6, 'fixed_plus_qty', 0.0060, 80, 80, '2026-04-21 00:00:00', TRUE);

INSERT INTO print_prices (print_mode, fee_mode, unit_price, setup_fee, effective_from, is_current)
VALUES
  ('four_color', 'per_qty', 0.0300, 50, '2026-04-21 00:00:00', TRUE),
  ('single_color', 'per_qty', 0.0200, 50, '2026-04-21 00:00:00', TRUE),
  ('white_ink', 'per_qty', 0.0400, 80, '2026-04-21 00:00:00', TRUE);
