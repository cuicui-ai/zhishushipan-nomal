import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, BarChart2, Shield, Activity, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Info, Search, List, PieChart as PieChartIcon,
  Filter, Calendar, ChevronRight, FileText, Download, Share2, Edit2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie, ComposedChart, Line, ReferenceLine
} from 'recharts';
import { formatCurrency, formatPercent, cn } from '../lib/utils';
import { Portfolio, Holding, Trade, PerformanceSnapshot, YearlyPerformance } from '../types';
import { MOCK_INDICES, MARKET_EVENTS } from '../constants';

interface PortfolioDetailProps {
  portfolio: Portfolio;
  onTrade: (pId: string, trade: Partial<Trade>) => void;
  onUpdate: (p: Portfolio) => void;
  defaultTab?: 'holdings' | 'performance' | 'risk' | 'analysis';
}

const COLORS = ['#3C82E7', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

export default function PortfolioDetail({ portfolio, onTrade, onUpdate, defaultTab }: PortfolioDetailProps) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'performance' | 'risk' | 'analysis'>(defaultTab || 'holdings');

  // Sync tab if prop changes
  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [tradeModal, setTradeModal] = useState<{ open: boolean; type: 'BUY' | 'SELL'; holding?: Holding }>({ open: false, type: 'BUY' });
  const [tradeAmount, setTradeAmount] = useState(0);

  // Stats calculation
  const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0) + (portfolio.principal - portfolio.trades.reduce((sum, t) => sum + (t.type === 'BUY' ? t.price * t.quantity : -t.price * t.quantity), 0));
  const totalPnl = totalValue - portfolio.principal;
  const pnlPercent = totalPnl / portfolio.principal;

  const latestStats = [
    { label: '最新市值', value: formatCurrency(totalValue), trend: pnlPercent >= 0 ? 'up' : 'down', sub: `${pnlPercent >= 0 ? '+' : ''}${formatPercent(pnlPercent)}` },
    { label: '累计盈亏', value: formatCurrency(totalPnl), trend: totalPnl >= 0 ? 'up' : 'down', sub: '从创建至今' },
    { label: '昨日收益', value: '+¥1,250.00', trend: 'up', sub: '+1.25%' },
    { label: '业绩基准表现', value: '+4.20%', trend: 'up', sub: '中证全债' },
  ];

  // Yield Contribution Trend Data
  const contributionTrendData = useMemo(() => {
    const years = Array.from({ length: 11 }, (_, i) => 2016 + i);
    const assets = ['债券指数', '股票指数', '货币基金指数', '黄金指数'];
    
    return years.map((year) => {
      const entry: any = { date: year.toString() };
      assets.forEach((asset, idx) => {
        // Generate realistic looking simulated contribution data
        const baseReturn = Math.random() * 2 - 0.5; // -0.5% to 1.5%
        const volatility = Math.sin(year + idx) * 0.8;
        entry[asset] = baseReturn + volatility;
      });
      return entry;
    });
  }, []);

  const handleTradeAction = () => {
    if (!tradeModal.holding) return;
    onTrade(portfolio.id, {
      code: tradeModal.holding.code,
      name: tradeModal.holding.name,
      type: tradeModal.type,
      quantity: tradeAmount,
      price: tradeModal.holding.currentPrice
    });
    setTradeModal({ ...tradeModal, open: false });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">{portfolio.name}</h1>
            <span className="px-2 py-0.5 bg-brand-light text-brand text-[10px] font-black rounded uppercase tracking-widest border border-brand/10">模拟实盘</span>
          </div>
          <p className="text-slate-500 max-w-xl">{portfolio.description || '这是您的专属投资组合。通过模拟交易来验证您的投资策略并追踪市场表现。'}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
            <Share2 className="w-5 h-5" />
            分享组合
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
            <Edit2 className="w-5 h-5" />
            管理设置
          </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {latestStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-brand transition-all">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              {stat.label}
              {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
            <div className={cn("text-sm font-bold", stat.trend === 'up' ? "text-emerald-500" : "text-rose-500")}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Side: Detail Tabs */}
        <div className="xl:col-span-3 space-y-8">
          {/* Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
            {[
              { id: 'holdings', label: '持仓明细', icon: List },
              { id: 'performance', label: '绩效评估', icon: TrendingUp },
              { id: 'risk', label: '风险分析', icon: Shield },
              { id: 'analysis', label: '组合穿透', icon: BarChart2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                  activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Holdings */}
          {activeTab === 'holdings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 italic tracking-tight">标的持仓列表</h3>
                  <div className="flex gap-2">
                    <button className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors text-slate-500">
                      <Search className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors text-slate-500">
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">指数 / 代码</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">昨日收盘</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">日涨跌</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">持仓数量</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">当前市值</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">损益统计 (日/累)</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {portfolio.holdings.map((holding) => (
                        <tr key={holding.code} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{holding.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-tighter">{holding.code}</span>
                                <span className="text-[10px] text-slate-300 font-bold">{holding.lastUpdate || '2024-05-15'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right font-bold text-slate-700">¥{holding.currentPrice.toFixed(2)}</td>
                          <td className={cn("px-6 py-6 text-right font-black", holding.change >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {holding.change >= 0 ? '+' : ''}{formatPercent(holding.change)}
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-slate-900">{holding.quantity.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">权重 {formatPercent((holding.quantity * holding.currentPrice) / totalValue)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right font-black text-slate-900">{formatCurrency(holding.quantity * holding.currentPrice)}</td>
                          <td className="px-6 py-6 text-right">
                             <div className="flex flex-col items-end">
                               <span className={cn("font-bold text-xs", (holding.dailyPnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                 日: ¥{(holding.dailyPnl || (holding.quantity * holding.currentPrice * holding.change)).toFixed(2)}
                               </span>
                               <span className={cn("text-[10px] font-black uppercase", (holding.accumPnl || 0) >= 0 ? "text-emerald-600/60" : "text-rose-600/60")}>
                                 累: ¥{(holding.accumPnl || (holding.quantity * (holding.currentPrice - holding.avgCost))).toFixed(2)}
                               </span>
                             </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setTradeModal({ open: true, type: 'BUY', holding })}
                                className="px-3 py-1.5 bg-brand-light text-brand font-black text-[10px] rounded-lg hover:bg-brand hover:text-white transition-all uppercase tracking-widest"
                              >
                                买入
                              </button>
                              <button 
                                onClick={() => setTradeModal({ open: true, type: 'SELL', holding })}
                                className="px-3 py-1.5 bg-slate-100 text-slate-500 font-black text-[10px] rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all uppercase tracking-widest"
                              >
                                卖出
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Performance */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Main Line Chart */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black italic text-slate-900">累计收益走势</h3>
                    <p className="text-sm text-slate-500">对比当前组合与业绩基准 (中证全债) 的收益表现</p>
                  </div>
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map(range => (
                      <button key={range} className={cn("px-3 py-1 text-[10px] font-black rounded-lg transition-all", range === 'ALL' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolio.history.length > 10 ? portfolio.history : [
                      { date: '2024-01-01', nav: 100, benchmarkNav: 100, pnl: 0 },
                      { date: '2024-01-15', nav: 102.5, benchmarkNav: 101.2, pnl: 0 },
                      { date: '2024-02-01', nav: 101.8, benchmarkNav: 102.0, pnl: 0 },
                      { date: '2024-02-15', nav: 105.2, benchmarkNav: 103.5, pnl: 0 },
                      { date: '2024-03-01', nav: 104.8, benchmarkNav: 104.2, pnl: 0 },
                      { date: '2024-03-15', nav: 112.5, benchmarkNav: 105.8, pnl: 0 },
                      { date: '2024-04-01', nav: 110.1, benchmarkNav: 106.3, pnl: 0 },
                      { date: '2024-04-15', nav: 108.5, benchmarkNav: 106.8, pnl: 0 },
                      { date: '2024-05-01', nav: 115.2, benchmarkNav: 107.5, pnl: 0 },
                      { date: '2024-05-15', nav: 120.4, benchmarkNav: 108.2, pnl: 0 },
                    ] as PerformanceSnapshot[]}>
                      <defs>
                        <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3C82E7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3C82E7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v - 100).toFixed(0)}%`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(v: number) => [`${(v - 100).toFixed(2)}%`, '']}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" />
                      {MARKET_EVENTS.map((event, idx) => (
                        <ReferenceLine 
                          key={idx}
                          x={event.date} 
                          stroke={event.type === 'PORTFOLIO' ? "#F59E0B" : "#94a3b8"} 
                          strokeDasharray="3 3"
                          label={{ position: 'top', value: event.label, fill: '#64748b', fontSize: 8 }} 
                        />
                      ))}
                      <Area name="组合收益" type="monotone" dataKey="nav" stroke="#3C82E7" strokeWidth={3} fillOpacity={1} fill="url(#colorNav)" />
                      <Area name="基准指数" type="monotone" dataKey="benchmarkNav" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-12">
                   {[
                     { l: '近一周', v: '+2.45%' },
                     { l: '近一月', v: '+5.12%' },
                     { l: '近三月', v: '+12.80%' },
                     { l: '近六月', v: '+18.42%' },
                     { l: '近一年', v: '+22.15%' },
                     { l: '近三年', v: '+45.20%' },
                     { l: '成立以来', v: '+58.12%' },
                   ].map(period => (
                     <div key={period.l} className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 hover:bg-brand-light hover:border-brand/20 transition-all cursor-default">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{period.l}</span>
                       <span className="text-sm font-black text-emerald-500">{period.v}</span>
                     </div>
                   ))}
                </div>
              </div>

              {/* Yearly Table with Monthly Matrix */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black italic text-slate-900 mb-8">年度业绩矩阵 (月度收益率 %)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">年份</th>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(m => (
                          <th key={m} className="px-2 py-4 text-[10px] font-black text-slate-400 text-center">{m}月</th>
                        ))}
                        <th className="px-4 py-4 text-[10px] font-black text-brand uppercase tracking-widest text-right">年度</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/30">
                      {[
                        { y: 2024, m: [1.2, 0.5, -2.1, 4.3, 2.1, 0, 0, 0, 0, 0, 0, 0], a: 6.0 },
                        { y: 2023, m: [3.4, -1.2, 0.8, 1.5, -3.2, 2.1, 4.5, -0.8, -2.1, 1.2, 5.4, 1.8], a: 13.4 },
                        { y: 2022, m: [-4.5, -2.1, -8.4, 2.3, 4.5, 6.2, -1.2, -3.4, -6.5, 1.2, 8.4, 2.1], a: -1.2 },
                      ].map(row => (
                        <tr key={row.y} className="hover:bg-slate-50/20">
                          <td className="px-4 py-4 font-bold text-slate-900">{row.y}</td>
                          {row.m.map((val, i) => (
                            <td key={i} className="px-2 py-4 text-center">
                              <span className={cn(
                                "inline-block w-full py-1 rounded text-[10px] font-bold",
                                val > 0 ? "bg-emerald-50 text-emerald-600" : val < 0 ? "bg-rose-50 text-rose-600" : "text-slate-300"
                              )}>
                                {val === 0 ? '-' : (val > 0 ? '+' : '') + val.toFixed(1)}
                              </span>
                            </td>
                          ))}
                          <td className={cn("px-4 py-4 text-right font-black text-sm italic", row.a > 0 ? "text-emerald-500" : "text-rose-500")}>
                            {row.a > 0 ? '+' : ''}{row.a.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Yield Contribution Analysis */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black italic text-slate-900 mb-8">收益贡献分析</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contributionTrendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `${(v).toFixed(1)}%`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(v: number) => [`${v.toFixed(2)}%`, '收益贡献']}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px' }} />
                      {['债券指数', '股票指数', '货币基金指数', '黄金指数'].map((asset, i) => (
                        <Bar 
                          key={asset} 
                          dataKey={asset} 
                          fill={COLORS[i % COLORS.length]} 
                          radius={[2, 2, 0, 0]}
                          barSize={8}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Advanced Indicators */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black italic text-slate-900 mb-8">年度核心绩效评价</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">年份</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">年度收益</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">年化波动</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">夏普比率</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">最大回撤</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">信息比率</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {[
                        { year: 2024, ret: 12.5, vol: 15.2, sharpe: 0.85, mdd: -8.5, ir: 0.45 },
                        { year: 2023, ret: -4.2, vol: 12.8, sharpe: -0.32, mdd: -15.4, ir: 0.12 },
                        { year: 2022, ret: 18.4, vol: 14.5, sharpe: 1.25, mdd: -6.2, ir: 0.88 },
                      ].map((perf) => (
                        <tr key={perf.year} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-5 font-bold text-slate-900">{perf.year}</td>
                          <td className={cn("px-6 py-5 text-right font-black", perf.ret >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {perf.ret >= 0 ? '+' : ''}{perf.ret.toFixed(2)}%
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-slate-600">{perf.vol.toFixed(2)}%</td>
                          <td className="px-6 py-5 text-right font-bold text-slate-900">{perf.sharpe.toFixed(2)}</td>
                          <td className="px-6 py-5 text-right font-bold text-rose-500">{perf.mdd.toFixed(2)}%</td>
                          <td className="px-6 py-5 text-right font-bold text-slate-600">{perf.ir.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Risk */}
          {activeTab === 'risk' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Max Drawdown */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black italic text-slate-900 mb-6">最大回撤曲线</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                         { d: '1', v: 0 }, { d: '2', v: -1.2 }, { d: '3', v: -2.5 }, { d: '4', v: -0.5 }, { d: '5', v: 0 }, { d: '6', v: -4.5 }, { d: '7', v: -8.5 }, { d: '8', v: -5.2 }, { d: '9', v: -3.1 }, { d: '10', v: 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis hide dataKey="d" />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip />
                        <Area type="step" dataKey="v" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700">当前周期最大回撤</span>
                    <span className="text-2xl font-black text-rose-500">-8.50%</span>
                  </div>
                </div>

                {/* Volatility */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black italic text-slate-900 mb-6">年化波动率趋势</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                         { d: '1', v: 12 }, { d: '2', v: 13 }, { d: '3', v: 15 }, { d: '4', v: 14 }, { d: '5', v: 12 }, { d: '6', v: 18 }, { d: '7', v: 22 }, { d: '8', v: 20 }, { d: '9', v: 16 }, { d: '10', v: 14 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis hide dataKey="d" />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="v" fill="#3C82E7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700">当前年化波动率</span>
                    <span className="text-2xl font-black text-blue-600">15.20%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Analysis (Look-through) */}
          {activeTab === 'analysis' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-1">
                    <h3 className="text-xl font-black italic text-slate-900 mb-6">资产大类分布</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: '权益类', value: 65 },
                              { name: '固定收益', value: 25 },
                              { name: '现金管理', value: 10 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {COLORS.slice(0, 3).map((color, i) => <Cell key={i} fill={color} />)}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2">
                    <h3 className="text-xl font-black italic text-slate-900 mb-6">风格与行业标签穿透</h3>
                    <div className="flex flex-wrap gap-3">
                       {[
                         { l: '大盘风格', v: 45, c: 'bg-blue-50 text-blue-600' },
                         { l: '医药行业', v: 15, c: 'bg-emerald-50 text-emerald-600' },
                         { l: '高股息', v: 12, c: 'bg-amber-50 text-amber-600' },
                         { l: '科技成长', v: 22, c: 'bg-purple-50 text-purple-600' },
                         { l: '港股配置', v: 6, c: 'bg-rose-50 text-rose-600' },
                       ].map(tag => (
                         <div key={tag.l} className={cn("px-6 py-4 rounded-3xl flex flex-col gap-1 border border-transparent hover:border-current transition-all cursor-default", tag.c)}>
                           <span className="text-[10px] font-black uppercase tracking-widest">{tag.l}</span>
                           <span className="text-2xl font-black">{tag.v}%</span>
                         </div>
                       ))}
                    </div>
                    <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-sm text-slate-500">
                      "组合当前主要配置于大盘股权重，显示出防御型较强的特征。医药与科技成长板块提供了额外的弹性。"
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right Side: Quick Actions & Key Info */}
        <div className="space-y-8">
           {/* Principal Summary */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/30 blur-3xl -translate-y-12 translate-x-12" />
              <div className="relative z-10">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">账户状态</div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-black italic">资产安全运行</div>
                    <div className="text-[10px] text-slate-500 font-bold">最后更新: 2024-05-15</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">初始本金</div>
                    <div className="text-2xl font-black tracking-tight">{formatCurrency(portfolio.principal)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">可用现金</div>
                    <div className="text-xl font-bold text-emerald-400">¥12,450.00</div>
                  </div>
                </div>
              </div>
           </div>

           {/* Benchmarks Quick View */}
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black italic text-slate-900">核心基准对比</h4>
                <RefreshCw className="w-4 h-4 text-slate-300 animate-spin-slow" />
              </div>
              <div className="space-y-4">
                {[
                  { n: '全债指数', v: '105.42', c: '+0.42%' },
                  { n: '沪深300', v: '3,850.42', c: '+1.20%' },
                  { n: 'Au99.99', v: '550.25', c: '-0.12%' },
                ].map(b => (
                  <div key={b.n} className="flex items-center justify-between group">
                    <div>
                      <div className="text-xs font-bold text-slate-500 group-hover:text-brand transition-colors">{b.n}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.v}</div>
                    </div>
                    <span className={cn("text-xs font-black", b.c.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>{b.c}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                查看更多基准
                <ChevronRight className="w-3 h-3" />
              </button>
           </div>

           {/* Data Export */}
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h4 className="text-lg font-black italic text-slate-900 mb-6">报告导出</h4>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-brand-light group transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-brand" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">持仓明细</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-brand-light group transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Activity className="w-5 h-5 text-slate-400 group-hover:text-brand" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">绩效评估</span>
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Trade Modal */}
      {tradeModal.open && tradeModal.holding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 italic">模拟交易</h3>
                <p className="text-slate-500 text-sm">正在{tradeModal.type === 'BUY' ? '买入' : '卖出'} <span className="font-bold text-brand">{tradeModal.holding.name}</span></p>
              </div>
              <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", tradeModal.type === 'BUY' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                {tradeModal.type === 'BUY' ? '买入份额' : '卖出份额'}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">当前价格</div>
                  <div className="text-lg font-black text-slate-800">¥{tradeModal.holding.currentPrice.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">持有数量</div>
                  <div className="text-lg font-black text-slate-800">{tradeModal.holding.quantity.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">交易数量</label>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="请输入份额数量"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-2xl font-black outline-none focus:border-brand transition-all"
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                />
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">预估交易金额</div>
                <div className="text-3xl font-black italic">¥{(tradeAmount * tradeModal.holding.currentPrice).toLocaleString()}</div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setTradeModal({ ...tradeModal, open: false })}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleTradeAction}
                  className={cn("flex-1 py-4 text-white font-bold rounded-2xl transition-all shadow-lg", tradeModal.type === 'BUY' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20")}
                >
                  确认{tradeModal.type === 'BUY' ? '买入' : '卖出'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
