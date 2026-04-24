CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wx_openid VARCHAR(128) NULL,
  unionid VARCHAR(128) NULL,
  mobile VARCHAR(32) NULL,
  nickname VARCHAR(128) NULL,
  avatar VARCHAR(512) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_wx_openid (wx_openid),
  UNIQUE KEY uk_users_mobile (mobile)
);

CREATE TABLE member_levels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  discount_rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
  priority INT NOT NULL DEFAULT 0,
  remark VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_member_levels_code (code)
);

CREATE TABLE member_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  member_no VARCHAR(64) NOT NULL,
  customer_type VARCHAR(32) NOT NULL DEFAULT 'personal',
  company_name VARCHAR(128) NULL,
  contact_name VARCHAR(64) NULL,
  tax_no VARCHAR(64) NULL,
  industry VARCHAR(64) NULL,
  source VARCHAR(64) NULL,
  sales_owner_id BIGINT NULL,
  level_id BIGINT NULL,
  default_discount_rate DECIMAL(10, 4) NULL,
  remark TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_member_profiles_member_no (member_no),
  KEY idx_member_profiles_user_id (user_id)
);

CREATE TABLE product_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT NULL,
  name VARCHAR(128) NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE company_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(128) NOT NULL,
  subtitle VARCHAR(255) NULL,
  cover_image VARCHAR(512) NULL,
  gallery_json JSON NULL,
  content TEXT NULL,
  contact_phone VARCHAR(32) NULL,
  contact_wechat VARCHAR(64) NULL,
  address VARCHAR(255) NULL,
  sort INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_company_profiles_status_sort (status, sort)
);

CREATE TABLE homepage_branding (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(128) NOT NULL,
  site_subtitle VARCHAR(255) NULL,
  logo_image VARCHAR(512) NULL,
  header_notice VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_homepage_branding_status (status)
);

CREATE TABLE homepage_banners (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(128) NOT NULL,
  subtitle VARCHAR(255) NULL,
  image_url VARCHAR(512) NOT NULL,
  mobile_image_url VARCHAR(512) NULL,
  link_type VARCHAR(32) NOT NULL DEFAULT 'none',
  link_value VARCHAR(255) NULL,
  button_text VARCHAR(64) NULL,
  sort INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_homepage_banners_status_sort (status, sort)
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NULL,
  name VARCHAR(128) NOT NULL,
  code VARCHAR(64) NOT NULL,
  cover_image VARCHAR(512) NULL,
  gallery_json JSON NULL,
  description TEXT NULL,
  application_scenario TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  sort INT NOT NULL DEFAULT 0,
  is_hot BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_products_code (code),
  KEY idx_products_category_id (category_id)
);

CREATE TABLE category_equipment_showcases (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  name VARCHAR(128) NOT NULL,
  title VARCHAR(128) NULL,
  description TEXT NULL,
  image_url VARCHAR(512) NULL,
  gallery_json JSON NULL,
  specs_json JSON NULL,
  sort INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category_equipment_showcases_category_status_sort (category_id, status, sort)
);

CREATE TABLE product_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  template_name VARCHAR(128) NOT NULL,
  width_min DECIMAL(10, 2) NOT NULL,
  width_max DECIMAL(10, 2) NOT NULL,
  height_min DECIMAL(10, 2) NOT NULL,
  height_max DECIMAL(10, 2) NOT NULL,
  quantity_min INT NOT NULL,
  quantity_max INT NOT NULL,
  allow_custom_shape BOOLEAN NOT NULL DEFAULT FALSE,
  allow_lamination BOOLEAN NOT NULL DEFAULT FALSE,
  allow_hot_stamping BOOLEAN NOT NULL DEFAULT FALSE,
  allow_uv BOOLEAN NOT NULL DEFAULT FALSE,
  allow_die_cut BOOLEAN NOT NULL DEFAULT FALSE,
  allow_proofing BOOLEAN NOT NULL DEFAULT FALSE,
  default_loss_rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
  min_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_product_templates_product_id (product_id)
);

CREATE TABLE product_template_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  template_id BIGINT NOT NULL,
  option_type VARCHAR(32) NOT NULL,
  option_value VARCHAR(128) NOT NULL,
  option_label VARCHAR(128) NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_product_template_options_template_id (template_id)
);

CREATE TABLE materials (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  material_type VARCHAR(32) NOT NULL,
  unit VARCHAR(32) NOT NULL,
  spec VARCHAR(128) NULL,
  brand VARCHAR(128) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_materials_code (code)
);

CREATE TABLE material_prices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  material_id BIGINT NOT NULL,
  price_type VARCHAR(32) NOT NULL DEFAULT 'calc',
  unit_price DECIMAL(12, 4) NOT NULL,
  currency VARCHAR(16) NOT NULL DEFAULT 'CNY',
  effective_from DATETIME NOT NULL,
  effective_to DATETIME NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  source VARCHAR(64) NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_material_prices_material_current (material_id, is_current)
);

CREATE TABLE processes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  process_type VARCHAR(64) NOT NULL,
  fee_mode VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_processes_code (code)
);

CREATE TABLE process_prices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  process_id BIGINT NOT NULL,
  fee_mode VARCHAR(32) NOT NULL,
  unit_price DECIMAL(12, 4) NOT NULL DEFAULT 0,
  min_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  setup_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  effective_from DATETIME NOT NULL,
  effective_to DATETIME NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_process_prices_process_current (process_id, is_current)
);

CREATE TABLE print_prices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  print_mode VARCHAR(64) NOT NULL,
  fee_mode VARCHAR(32) NOT NULL,
  unit_price DECIMAL(12, 4) NOT NULL DEFAULT 0,
  setup_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  effective_from DATETIME NOT NULL,
  effective_to DATETIME NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_print_prices_mode_current (print_mode, is_current)
);

CREATE TABLE quote_rule_sets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_template_id BIGINT NOT NULL,
  name VARCHAR(128) NOT NULL,
  scene VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  priority INT NOT NULL DEFAULT 0,
  version_no VARCHAR(64) NOT NULL,
  effective_from DATETIME NOT NULL,
  effective_to DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_quote_rule_sets_template (product_template_id, status, priority)
);

CREATE TABLE quote_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rule_set_id BIGINT NOT NULL,
  condition_json JSON NOT NULL,
  config_json JSON NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_quote_rules_rule_set_id (rule_set_id)
);

CREATE TABLE quotes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quote_no VARCHAR(64) NOT NULL,
  user_id BIGINT NULL,
  product_id BIGINT NOT NULL,
  product_template_id BIGINT NOT NULL,
  member_level_id BIGINT NULL,
  customer_type VARCHAR(32) NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  material_id BIGINT NOT NULL,
  process_options_json JSON NULL,
  price_subtotal DECIMAL(12, 2) NOT NULL,
  fixed_fee_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  final_price DECIMAL(12, 2) NOT NULL,
  unit_price DECIMAL(12, 4) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  valid_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_quotes_quote_no (quote_no),
  KEY idx_quotes_user_id (user_id)
);

CREATE TABLE quote_snapshots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quote_id BIGINT NOT NULL,
  rule_set_id BIGINT NOT NULL,
  rule_version VARCHAR(64) NOT NULL,
  material_price_snapshot_json JSON NOT NULL,
  process_price_snapshot_json JSON NOT NULL,
  print_price_snapshot_json JSON NOT NULL,
  formula_snapshot_json JSON NOT NULL,
  full_snapshot_json JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_quote_snapshots_quote_id (quote_id)
);

CREATE TABLE warehouses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  code VARCHAR(64) NOT NULL,
  warehouse_type VARCHAR(32) NOT NULL,
  manager_id BIGINT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_warehouses_code (code)
);

CREATE TABLE stock_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  material_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  qty DECIMAL(14, 4) NOT NULL DEFAULT 0,
  reserved_qty DECIMAL(14, 4) NOT NULL DEFAULT 0,
  available_qty DECIMAL(14, 4) NOT NULL DEFAULT 0,
  safety_qty DECIMAL(14, 4) NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_stock_items_material_warehouse (material_id, warehouse_id)
);

CREATE TABLE stock_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movement_no VARCHAR(64) NOT NULL,
  movement_type VARCHAR(32) NOT NULL,
  warehouse_id BIGINT NOT NULL,
  material_id BIGINT NOT NULL,
  qty DECIMAL(14, 4) NOT NULL,
  unit_cost DECIMAL(12, 4) NULL,
  ref_type VARCHAR(64) NULL,
  ref_id BIGINT NULL,
  operator_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_stock_movements_no (movement_no)
);

CREATE TABLE admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(64) NOT NULL,
  mobile VARCHAR(32) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admins_username (username)
);

CREATE TABLE operation_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  operator_id BIGINT NULL,
  module VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id BIGINT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_operation_logs_module_target (module, target_type, target_id)
);
