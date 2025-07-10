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

export const UPGRADE_SHIELD_COST = {
  "armor":{
    1: 8,
    2: 14,
    3: 20,
    4: 26,
    5: 30,
    6: 36,
    7: 42,
    8: 48,
    9: 54,
    10: 62,
    11: 72,
    12: 112,
    13: 224,
    14: 315,
    15: 812,
  },
  "helmet":{
    1: 4,
    2: 14,
    3: 20,
    4: 26,
    5: 30,
    6: 36,
    7: 42,
    8: 48,
    9: 54,
    10: 62,
    11: 72,
    12: 112,
    13: 224,
    14: 315,
    15: 812,
  }
} as const; 