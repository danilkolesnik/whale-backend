export const API_URL = 'http://45.66.11.45:3000';

export const SHOP_TYPES = ['helmet', 'armor', 'leg'];

export const UPGRADE_CHANCES = {
  '1-5': 0.95,    // 95% success rate
  '6-10': 0.85,   // 85% success rate
  '11-15': 0.70,  // 70% success rate
  '16-20': 0.50,  // 50% success rate
  '21-25': 0.30,  // 30% success rate
  '26-30': 0.15   // 15% success rate
} as const;