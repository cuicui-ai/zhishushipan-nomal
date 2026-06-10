export interface IndexInfo {
  code: string;
  name: string;
  price: number;
  change: number;
  category: 'Equity' | 'Bond' | 'Cash' | 'Gold';
  tags: string[];
}

export interface Holding {
  code: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  change: number;
  tags: string[];
  lastUpdate: string;
  dailyPnl: number;
  accumPnl: number;
}

export interface Trade {
  id: string;
  date: string;
  code: string;
  name: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
}

export interface PerformanceSnapshot {
  date: string;
  nav: number; // Net Asset Value
  pnl: number;
  benchmarkNav: number;
}

export interface YearlyPerformance {
  year: number;
  monthlyReturns: number[]; // 12 months
  annualReturn: number;
  volatility: number;
  sharpe: number;
  maxDrawdown: number;
  infoRatio: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  isPublic: boolean;
  principal: number;
  benchmarkId: string;
  createdAt: string;
  holdings: Holding[];
  trades: Trade[];
  history: PerformanceSnapshot[];
  isDefault?: boolean;
}

export interface RawParsedData {
  headers: {
    tickers: string[];
    names: string[];
  };
  rows: {
    date: string;
    weights: number[];
  }[];
}

export interface IndexWeight {
  code: string;
  weight: number;
}
