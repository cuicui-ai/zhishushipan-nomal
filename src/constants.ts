import { IndexInfo } from './types';

export const MOCK_INDICES: IndexInfo[] = [
  { code: '000300.SH', name: '沪深300', price: 3850.42, change: 0.012, category: 'Equity', tags: ['大盘风格', '核心资产'] },
  { code: '000001.SH', name: '上证指数', price: 3120.15, change: -0.005, category: 'Equity', tags: ['宽基'] },
  { code: '399006.SZ', name: '创业板指', price: 1845.30, change: 0.021, category: 'Equity', tags: ['成长风格', '科技'] },
  { code: '932000.CSI', name: '中证2000', price: 2150.12, change: 0.008, category: 'Equity', tags: ['小盘风格', '微盘'] },
  { code: '980092.CNI', name: '自由现金流', price: 1540.22, change: 0.003, category: 'Equity', tags: ['价值风格', '高分红'] },
  { code: 'HSI', name: '恒生指数', price: 19200.50, change: 0.015, category: 'Equity', tags: ['港股', '国际化'] },
  { code: 'HSTECH', name: '恒生科技', price: 3950.40, change: 0.032, category: 'Equity', tags: ['港股', '互联网'] },
  { code: 'AU0004', name: 'Au99.99', price: 550.25, change: -0.002, category: 'Gold', tags: ['避险', '商品'] },
  { code: 'H11015', name: '中证短债', price: 105.12, change: 0.0001, category: 'Bond', tags: ['低风险', '收息'] },
  { code: 'H11001', name: '中证全债', price: 215.45, change: 0.0005, category: 'Bond', tags: ['利率债', '信用债'] },
  { code: 'H11025', name: '货币基金指数', price: 1.0543, change: 0.00008, category: 'Cash', tags: ['流动性', '无风险'] },
  { code: 'CSI300医药', name: '300医药', price: 8450.20, change: -0.012, category: 'Equity', tags: ['行业', '医药'] },
];

export const MOCK_BENCHMARKS = [
  { id: 'all_equity', name: '股票基准 (80%沪深300+20%中证500)' },
  { id: 'all_bond', name: '债券基准 (中证全债)' },
  { id: 'balanced', name: '均衡基准 (50%股+50%债)' },
  { id: 'cash', name: '货币基准 (货币基金指数)' },
  { id: 'gold', name: '黄金基准 (Au99.99)' },
];

export const MARKET_EVENTS: { date: string, label: string, type: 'MARKET' | 'PORTFOLIO' }[] = [
  { date: '2024-01-15', label: '开年首降息', type: 'MARKET' },
  { date: '2024-03-20', label: '科技股爆发', type: 'MARKET' },
  { date: '2024-05-10', label: '地产政策松绑', type: 'MARKET' },
];
