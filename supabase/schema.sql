-- ==============================================================================
-- Supabase PostgreSQL Schema for Samdech Chea Sim Primary School Uniform Shop
-- Project: ShopTrack Inventory & Online Uniform Ordering System
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id SERIAL PRIMARY KEY,
  shop_name TEXT NOT NULL DEFAULT 'ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម',
  location TEXT NOT NULL DEFAULT 'ខាងក្នុងបរិវេណសាលាបឋមសិក្សា សម្តេចជាស៊ីម (មុខអគាររដ្ឋបាល)',
  phone1 VARCHAR(50) NOT NULL DEFAULT '012 345 678',
  phone2 VARCHAR(50) DEFAULT '098 765 432',
  telegram VARCHAR(100) DEFAULT 'bNha_dev',
  bakong_id VARCHAR(100) DEFAULT 'cheasim_primary@acleda',
  custom_qr_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_kh TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'boy', 'girl', 'sport', 'supplies'
  base_price_khr INTEGER NOT NULL,
  base_price_usd NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  description_kh TEXT NOT NULL,
  badge TEXT,
  is_variant_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Variants & Sizes (Real Inventory Stock)
CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(120) PRIMARY KEY,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
  color_code VARCHAR(20), -- 'blue', 'orange', 'green', or null
  grade_group TEXT,       -- 'ថ្នាក់ទី១ - ទី២', etc.
  size_label VARCHAR(50) NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  price_khr INTEGER NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  student_name TEXT,
  student_grade VARCHAR(50) NOT NULL,
  pickup_method VARCHAR(100) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  total_khr INTEGER NOT NULL,
  total_usd NUMERIC(10,2) NOT NULL,
  shipping_fee_khr INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'confirmed', 'ready', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100),
  variant_id VARCHAR(120),
  item_name_kh TEXT NOT NULL,
  size_or_color VARCHAR(100) NOT NULL,
  unit_price_khr INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal_khr INTEGER NOT NULL
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 8. Public Read & Write Policies for Customer Orders & Admin
CREATE POLICY "Public can read store settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read order items" ON order_items FOR SELECT USING (true);

-- Enable Realtime for orders and stock
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE product_variants;

-- 9. Initial Seed Data
INSERT INTO store_settings (id, shop_name, location, phone1, phone2, telegram, bakong_id)
VALUES (1, 'ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម', 'ខាងក្នុងបរិវេណសាលាបឋមសិក្សា សម្តេចជាស៊ីម (មុខអគាររដ្ឋបាល)', '012 345 678', '098 765 432', 'bNha_dev', 'cheasim_primary@acleda')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name_en, name_kh, category, base_price_khr, base_price_usd, image_url, description_kh, badge, is_variant_group) VALUES
('cs-boy-shirt', 'Primary Boy Uniform Shirt (White)', 'អាវសិស្សប្រុសដៃខ្លី ពណ៌ស', 'boy', 18000, 4.39, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=700&auto=format&fit=crop&q=80', 'អាវសិស្សប្រុសពណ៌សដៃខ្លី កត្រង់ មានប៉ាក់ស្លាកសញ្ញាសាលាបឋមសិក្សាសម្តេចជាស៊ីមនៅលើហោប៉ៅ', 'លក់ដាច់បំផុត', false),
('cs-boy-pant', 'Primary Boy Uniform Short Pants (Navy)', 'ខោខ្លីសិស្សប្រុស ពណ៌ខៀវចាស់', 'boy', 16000, 3.90, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=700&auto=format&fit=crop&q=80', 'ខោខ្លីសិស្សប្រុសពណ៌ខៀវចាស់ ចង្កេះកៅស៊ូយឺតចំហៀង ផាសុកភាពខ្ពស់ ធន់នឹងការបោកគក់', 'ស្តង់ដាររដ្ឋ', false),
('cs-boy-tie', 'School Boy Uniform Necktie', 'ក្រវ៉ាត់កសិស្សប្រុស (Tie)', 'boy', 6000, 1.46, 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=700&auto=format&fit=crop&q=80', 'ក្រវ៉ាត់កពណ៌ខៀវចាស់ផ្លូវការ មានខ្សែយឺតពាក់កស្រួល មិនពិបាកចង', 'ចាំបាច់', false),
('cs-girl-shirt', 'Primary Girl Uniform Shirt (Lotus Collar)', 'អាវសិស្សស្រីដៃខ្លី កឈូក ពណ៌ស', 'girl', 18000, 4.39, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80', 'អាវសិស្សស្រីពណ៌សម៉ូដកឈូកទន់ភ្លន់ ដៃខ្លី មានប៉ាក់ឡូហ្គោសាលា', 'លក់ដាច់បំផុត', false),
('cs-girl-skirt', 'Primary Girl Uniform Pleated Skirt (Navy)', 'សំពត់ផ្នត់សិស្សស្រី ពណ៌ខៀវចាស់', 'girl', 16000, 3.90, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=700&auto=format&fit=crop&q=80', 'សំពត់សិស្សស្រីពណ៌ខៀវចាស់ មានផ្នត់ជុំវិញ ចង្កេះកៅស៊ូយឺត មិនងាយជ្រីវជ្រួញ', 'ស្តង់ដាររដ្ឋ', false),
('cs-sport-uniform', 'School Sport Uniform Set (Unisex)', 'ឈុតកីឡាសាលា (អាវយឺត + ខោកីឡា)', 'sport', 26000, 6.34, 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=700&auto=format&fit=crop&q=80', 'ឈុតកីឡាផ្លូវការសម្រាប់សិស្សបឋមសិក្សា (អាវយឺត + ខោកីឡា) សាច់ក្រណាត់យឺតទន់ត្រជាក់', 'ពណ៌តាមកម្រិតថ្នាក់', true),
('cs-id-holder', 'School ID Card Holder & Lanyard', 'ប្រអប់កាតសិស្ស និងខ្សែពាក់ក', 'supplies', 6500, 1.59, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80', 'ប្រអប់ជ័រការពារកាតសិស្ស និងខ្សែពាក់កមានព្រីនឈ្មោះ បឋមសិក្សា សម្តេចជាស៊ីម បែងចែកពណ៌តាមកម្រិតថ្នាក់ (១ ឈុត ៦,៥០០៛ / តែប្រអប់ ១,៥០០៛ / តែខ្សែ ៥,០០០៛)។', 'ឡូហ្គោសាលា', false)
ON CONFLICT (id) DO NOTHING;
