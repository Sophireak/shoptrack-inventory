// Vercel Serverless Function: /api/inventory
// Real-Time Multi-Device Inventory Sync for Samdech Chea Sim School Store

const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join('/tmp', 'cheasim_inventory.json');

const DEFAULT_CATALOG = [
  {
    id: 'cs-boy-shirt',
    name: 'Boy Student Shirt',
    nameKh: 'អាវសិស្សប្រុស (សាច់ក្រណាត់ស)',
    category: 'boy',
    priceKhr: 18000,
    priceUsd: 4.39,
    badge: 'ពេញនិយមបំផុត',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=700&auto=format&fit=crop&q=80',
    description: 'សាច់ក្រណាត់កាតុងស ទន់ត្រជាក់ ស្រួលពាក់ មិនបែកព្រុយ ត្រឹមត្រូវតាមស្តង់ដារក្រសួងអប់រំ។',
    sizes: [
      { size: '24', stock: 25 },
      { size: '26', stock: 32 },
      { size: '28', stock: 18 },
      { size: '30', stock: 15 },
      { size: '32', stock: 9 },
      { size: '34', stock: 4 }
    ]
  },
  {
    id: 'cs-boy-pants',
    name: 'Boy Student Pants',
    nameKh: 'ខោខ្លីសិស្សប្រុស (ពណ៌ខៀវចាស់)',
    category: 'boy',
    priceKhr: 20000,
    priceUsd: 4.88,
    badge: 'កៅស៊ូយឺតចង្កេះ',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=700&auto=format&fit=crop&q=80',
    description: 'ខោខ្លីពណ៌ខៀវចាស់ មានហោប៉ៅសងខាង ចង្កេះកៅស៊ូយឺតងាយស្រួលស្លៀកសម្រាប់កុមារ។',
    sizes: [
      { size: '22', stock: 14 },
      { size: '24', stock: 20 },
      { size: '26', stock: 28 },
      { size: '28', stock: 12 },
      { size: '30', stock: 8 },
      { size: '32', stock: 3 }
    ]
  },
  {
    id: 'cs-boy-tie',
    name: 'Boy Student Tie',
    nameKh: 'ក្រវ៉ាត់កសិស្សប្រុស (មានកៅស៊ូយឺត)',
    category: 'boy',
    priceKhr: 5000,
    priceUsd: 1.22,
    badge: 'ងាយពាក់',
    image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=700&auto=format&fit=crop&q=80',
    description: 'ក្រវ៉ាត់កពណ៌ខៀវចាស់ មានកៅស៊ូយឺតពាក់ក កុមារអាចពាក់ និងដោះដោយខ្លួនឯងបានរហ័ស។',
    sizes: [
      { size: 'Free Size', stock: 65 }
    ]
  },
  {
    id: 'cs-girl-shirt',
    name: 'Girl Student Shirt',
    nameKh: 'អាវសិស្សស្រី (សាច់ក្រណាត់ស កបត់)',
    category: 'girl',
    priceKhr: 18000,
    priceUsd: 4.39,
    badge: 'ពេញនិយមបំផុត',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&auto=format&fit=crop&q=80',
    description: 'អាវសិស្សស្រីកបត់ សាច់ក្រណាត់កាតុងសទន់ត្រជាក់ មានហោប៉ៅខាងមុខ និងខ្សែរឹតចង្កេះស្អាត។',
    sizes: [
      { size: '24', stock: 20 },
      { size: '26', stock: 26 },
      { size: '28', stock: 22 },
      { size: '30', stock: 14 },
      { size: '32', stock: 7 },
      { size: '34', stock: 2 }
    ]
  },
  {
    id: 'cs-girl-skirt',
    name: 'Girl Student Skirt',
    nameKh: 'សំពត់សិស្សស្រី (ពណ៌ខៀវចាស់ មានផ្នត់)',
    category: 'girl',
    priceKhr: 20000,
    priceUsd: 4.88,
    badge: 'ផ្នត់ស្អាត',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=700&auto=format&fit=crop&q=80',
    description: 'សំពត់សិស្សស្រីពណ៌ខៀវចាស់ មានផ្នត់ជុំវិញ ចង្កេះកៅស៊ូយឺត មិនងាយជ្រីវជ្រួញ ងាយស្រួលបោកគក់។',
    sizes: [
      { size: '22', stock: 16 },
      { size: '24', stock: 24 },
      { size: '26', stock: 30 },
      { size: '28', stock: 15 },
      { size: '30', stock: 10 },
      { size: '32', stock: 4 }
    ]
  },
  {
    id: 'cs-sport-blue',
    name: 'Sport Uniform Set - Blue (Grade 1-2)',
    nameKh: 'ឈុតកីឡាសាលា ពណ៌ខៀវ (ថ្នាក់ទី១ - ទី២)',
    category: 'sport',
    priceKhr: 26000,
    priceUsd: 6.34,
    badge: 'ថ្នាក់ទី១ - ទី២ (ខៀវ)',
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=700&auto=format&fit=crop&q=80',
    description: 'ឈុតកីឡាពណ៌ខៀវផ្លូវការសម្រាប់សិស្សថ្នាក់ទី១ និងទី២ (អាវយឺតកីឡា + ខោកីឡា) ស្រួលរត់លេង។',
    sizes: [
      { size: '20', stock: 15 },
      { size: '22', stock: 22 },
      { size: '24', stock: 25 },
      { size: '26', stock: 18 },
      { size: '28', stock: 12 },
      { size: '30', stock: 8 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 4 },
      { size: 'XL', stock: 3 }
    ]
  },
  {
    id: 'cs-sport-orange',
    name: 'Sport Uniform Set - Orange (Grade 3-4)',
    nameKh: 'ឈុតកីឡាសាលា ពណ៌ទឹកក្រូច (ថ្នាក់ទី៣ - ទី៤)',
    category: 'sport',
    priceKhr: 26000,
    priceUsd: 6.34,
    badge: 'ថ្នាក់ទី៣ - ទី៤ (ទឹកក្រូច)',
    color: 'orange',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=700&auto=format&fit=crop&q=80',
    description: 'ឈុតកីឡាពណ៌ទឹកក្រូចផ្លូវការសម្រាប់សិស្សថ្នាក់ទី៣ និងទី៤ (អាវយឺតកីឡា + ខោកីឡា) ស្រួលរត់លេង។',
    sizes: [
      { size: '20', stock: 8 },
      { size: '22', stock: 12 },
      { size: '24', stock: 20 },
      { size: '26', stock: 28 },
      { size: '28', stock: 24 },
      { size: '30', stock: 16 },
      { size: 'M', stock: 10 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 4 }
    ]
  },
  {
    id: 'cs-sport-green',
    name: 'Sport Uniform Set - Green (Grade 5-6)',
    nameKh: 'ឈុតកីឡាសាលា ពណ៌បៃតង (ថ្នាក់ទី៥ - ទី៦)',
    category: 'sport',
    priceKhr: 26000,
    priceUsd: 6.34,
    badge: 'ថ្នាក់ទី៥ - ទី៦ (បៃតង)',
    color: 'green',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=700&auto=format&fit=crop&q=80',
    description: 'ឈុតកីឡាពណ៌បៃតងផ្លូវការសម្រាប់សិស្សថ្នាក់ទី៥ និងទី៦ (អាវយឺតកីឡា + ខោកីឡា) ស្រួលរត់លេង។',
    sizes: [
      { size: '20', stock: 4 },
      { size: '22', stock: 6 },
      { size: '24', stock: 10 },
      { size: '26', stock: 18 },
      { size: '28', stock: 26 },
      { size: '30', stock: 30 },
      { size: 'M', stock: 22 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 8 }
    ]
  },
  {
    id: 'cs-id-holder',
    name: 'School ID Card Holder & Lanyard',
    nameKh: 'ប្រអប់កាតសិស្ស និងខ្សែពាក់ក',
    category: 'supplies',
    priceKhr: 4000,
    priceUsd: 0.98,
    badge: 'ឡូហ្គោសាលា',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80',
    description: 'ប្រអប់ជ័រការពារកាតសិស្ស និងខ្សែពាក់កមានព្រីនឈ្មោះ បឋមសិក្សា សម្តេចជាស៊ីម បែងចែកពណ៌តាមកម្រិតថ្នាក់។',
    sizes: [
      { size: 'ពណ៌ខៀវ (ថ្នាក់ទី១-២)', stock: 120 },
      { size: 'ពណ៌ទឹកក្រូច (ថ្នាក់ទី៣-៤)', stock: 95 },
      { size: 'ពណ៌បៃតង (ថ្នាក់ទី៥-៦)', stock: 80 }
    ]
  }
];

function readCatalog() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not read storage file, falling back to default:', err.message);
  }
  return DEFAULT_CATALOG;
}

function writeCatalog(catalog) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write storage file:', err.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch current inventory
  if (req.method === 'GET') {
    const current = readCatalog();
    return res.status(200).json({ success: true, data: current });
  }

  // POST: Update inventory (restock or after sales)
  if (req.method === 'POST') {
    try {
      const { catalog, action, productId, size, qty } = req.body || {};

      let current = readCatalog();

      if (catalog && Array.isArray(catalog)) {
        current = catalog;
      } else if (action === 'adjust' && productId && size && typeof qty === 'number') {
        const prod = current.find(p => p.id === productId);
        if (prod) {
          const sObj = prod.sizes.find(s => s.size === size);
          if (sObj) {
            sObj.stock = Math.max(0, sObj.stock + qty);
          }
        }
      }

      writeCatalog(current);
      return res.status(200).json({ success: true, data: current });
    } catch (err) {
      console.error('Inventory update error:', err);
      return res.status(500).json({ error: 'Failed to update inventory.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
