INSERT INTO member_levels (id, name, code, discount_rate, priority)
VALUES
  (1, '普通会员', 'normal', 1.0000, 1),
  (2, '企业客户', 'company', 0.9500, 2);

INSERT INTO product_categories (id, parent_id, name, sort, status)
VALUES (1, NULL, '不干胶标签', 1, 'active');

INSERT INTO products (id, category_id, name, code, description, status)
VALUES (1, 1, '透明 PET 标签', 'PET-LABEL', '透明 PET 不干胶标签，可选覆膜、模切、UV。', 'active');

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
) VALUES (
  1,
  1,
  '透明 PET 标准报价模板',
  20,
  500,
  20,
  500,
  100,
  100000,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  1.0800,
  300,
  'active'
);

INSERT INTO materials (id, code, name, material_type, unit, status)
VALUES
  (1, 'COATED-PAPER', '铜版纸', 'face', 'm2', 'active'),
  (2, 'PET-CLEAR', '透明 PET', 'face', 'm2', 'active'),
  (3, 'LAMINATION-FILM', '覆膜材料', 'lamination', 'm2', 'active');

INSERT INTO material_prices (material_id, price_type, unit_price, effective_from, is_current)
VALUES
  (1, 'calc', 0.8000, '2026-04-21 00:00:00', TRUE),
  (2, 'calc', 1.5000, '2026-04-21 00:00:00', TRUE),
  (3, 'calc', 0.2500, '2026-04-21 00:00:00', TRUE);

INSERT INTO processes (id, code, name, process_type, fee_mode, status)
VALUES
  (1, 'lamination', '覆膜', 'surface', 'per_area', 'active'),
  (2, 'die_cut', '模切', 'cutting', 'fixed_plus_qty', 'active'),
  (3, 'uv', 'UV', 'surface', 'per_area', 'active'),
  (4, 'proofing', '打样', 'proof', 'fixed', 'active');

INSERT INTO process_prices (process_id, fee_mode, unit_price, min_fee, setup_fee, effective_from, is_current)
VALUES
  (1, 'per_area', 0.2000, 0, 0, '2026-04-21 00:00:00', TRUE),
  (2, 'fixed_plus_qty', 0.0100, 0, 80, '2026-04-21 00:00:00', TRUE),
  (3, 'per_area', 0.3000, 0, 0, '2026-04-21 00:00:00', TRUE),
  (4, 'fixed', 100.0000, 0, 0, '2026-04-21 00:00:00', TRUE);

INSERT INTO print_prices (print_mode, fee_mode, unit_price, setup_fee, effective_from, is_current)
VALUES
  ('four_color', 'per_qty', 0.0300, 50, '2026-04-21 00:00:00', TRUE),
  ('single_color', 'per_qty', 0.0200, 50, '2026-04-21 00:00:00', TRUE);

INSERT INTO quote_rule_sets (
  id,
  product_template_id,
  name,
  scene,
  status,
  priority,
  version_no,
  effective_from
) VALUES
  (1, 1, '普通客户标准规则', 'retail', 'active', 1, 'RULE-RETAIL-V1', '2026-04-21 00:00:00'),
  (2, 1, '企业客户标准规则', 'enterprise', 'active', 2, 'RULE-COMPANY-V1', '2026-04-21 00:00:00');

INSERT INTO quote_rules (rule_set_id, condition_json, config_json, enabled)
VALUES
  (
    1,
    JSON_OBJECT(
      'quantityRange', JSON_ARRAY(100, 100000),
      'widthRange', JSON_ARRAY(20, 500),
      'heightRange', JSON_ARRAY(20, 500),
      'customerTypes', JSON_ARRAY('personal')
    ),
    JSON_OBJECT(
      'lossRate', 1.08,
      'profitRate', 1.35,
      'memberRate', 1,
      'minPrice', 300,
      'packageFee', 20,
      'urgentFeeRate', 0.15
    ),
    TRUE
  ),
  (
    2,
    JSON_OBJECT(
      'quantityRange', JSON_ARRAY(100, 100000),
      'widthRange', JSON_ARRAY(20, 500),
      'heightRange', JSON_ARRAY(20, 500),
      'customerTypes', JSON_ARRAY('company')
    ),
    JSON_OBJECT(
      'lossRate', 1.08,
      'profitRate', 1.35,
      'memberRate', 0.95,
      'minPrice', 300,
      'packageFee', 20,
      'urgentFeeRate', 0.15
    ),
    TRUE
  );
