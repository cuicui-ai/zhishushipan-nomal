/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  TrendingUp, 
  LayoutDashboard, 
  ChevronRight, 
  Bell, 
  User,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Plus,
  BarChart2,
  Upload,
  FileText
} from 'lucide-react';
import { cn } from './lib/utils';
import { Portfolio, Trade, IndexWeight, RawParsedData } from './types';
import PortfolioList from './components/PortfolioList';
import PortfolioDetail from './components/PortfolioDetail';
import CreatePortfolio from './components/CreatePortfolio';

export default function App() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dragActive, setDragActive] = useState(false);

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  // Initialize with mock data if empty
  useEffect(() => {
    const saved = localStorage.getItem('index_sim_portfolios');
    if (saved && JSON.parse(saved).length > 0) {
      try {
        const parsed = JSON.parse(saved);
        setPortfolios(parsed);
        const defaultP = parsed.find((p: Portfolio) => p.isDefault) || parsed[0];
        setActivePortfolioId(defaultP.id);
      } catch (e) {
        console.error('Failed to load portfolios', e);
      }
    } else {
      // Create initial mock portfolio
      const mockPortfolio: Portfolio = {
        id: 'mock_default',
        name: '示例平衡型投资组合',
        description: '这是一个预设的模拟组合，展示了股债平衡配置策略（如沪深300+中证全债）。您可以参考此组合的绩效指标与风险分析。',
        keywords: ['股债平衡', '核心资产', '稳健'],
        isPublic: true,
        principal: 100000000,
        benchmarkId: 'balanced',
        createdAt: new Date().toISOString(),
        isDefault: true,
        holdings: [
          { code: '000300.SH', name: '沪深300', quantity: 15600, avgCost: 3500.5, currentPrice: 3850.42, change: 0.012, tags: ['大盘风格'], lastUpdate: '2024-05-15', dailyPnl: 1560.5, accumPnl: 8540.2 },
          { code: 'H11001', name: '中证全债', quantity: 185000, avgCost: 210.2, currentPrice: 215.45, change: 0.0005, tags: ['低风险'], lastUpdate: '2024-05-15', dailyPnl: 450.2, accumPnl: 12500.8 },
          { code: 'AU0004', name: 'Au99.99', price: 550.25, quantity: 5400, avgCost: 520.4, currentPrice: 550.25, change: -0.002, tags: ['避险'], lastUpdate: '2024-05-15', dailyPnl: -220.4, accumPnl: 15000.5 }
        ] as any,
        trades: [],
        history: [
          { date: '2024-01-01', nav: 100, benchmarkNav: 100, pnl: 0 },
          { date: '2024-01-15', nav: 102.5, benchmarkNav: 101.2, pnl: 0 },
          { date: '2024-02-01', nav: 101.8, benchmarkNav: 102.0, pnl: 0 },
          { date: '2024-02-15', nav: 105.2, benchmarkNav: 103.5, pnl: 0 },
          { date: '2024-03-01', nav: 104.8, benchmarkNav: 104.2, pnl: 0 },
          { date: '2024-03-15', nav: 112.5, benchmarkNav: 105.8, pnl: 0 },
          { date: '2024-04-01', nav: 110.1, benchmarkNav: 106.3, pnl: 0 },
          { date: '2024-04-15', nav: 118.5, benchmarkNav: 106.8, pnl: 0 },
          { date: '2024-05-01', nav: 115.2, benchmarkNav: 107.5, pnl: 0 },
          { date: '2024-05-15', nav: 120.4, benchmarkNav: 108.2, pnl: 0 },
        ]
      };
      setPortfolios([mockPortfolio]);
      setActivePortfolioId(mockPortfolio.id);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('index_sim_portfolios', JSON.stringify(portfolios));
  }, [portfolios]);

  const handleCreatePortfolio = (p: Portfolio) => {
    const newPortfolios = [...portfolios, p];
    setPortfolios(newPortfolios);
    setActivePortfolioId(p.id);
    setIsCreating(false);
    setActiveMenu('analysis');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('target' in e && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files?.[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (json.length < 3) {
          alert('文件格式不正确，请确保包含代码行、名称行和权重数据行。');
          return;
        }

        // Format weights for analysis
        const tickers = json[0].slice(1).map(t => String(t || ''));
        const names = json[1].slice(1).map(n => String(n || ''));
        
        const latestRow = json[json.length - 1];
        const dateStr = String(latestRow[0]);
        
        const holdings = names.map((name, i) => {
          const weightStr = String(latestRow[i + 1] || '0');
          let weightNum = 0;
          if (weightStr.includes('%')) {
            weightNum = parseFloat(weightStr.replace('%', '')) / 100;
          } else {
            weightNum = parseFloat(weightStr);
          }
          
          return {
            code: tickers[i],
            name: name,
            quantity: Math.floor(weightNum * 1000000), // Normalized unit
            avgCost: 100,
            currentPrice: 100 * (1 + (Math.random() * 0.1 - 0.05)),
            change: (Math.random() * 0.04 - 0.02),
            tags: ['导入标的'],
            lastUpdate: dateStr,
            dailyPnl: 0,
            accumPnl: 0
          };
        }).filter(h => h.quantity > 0);

        const quickPortfolio: Portfolio = {
          id: `quick_${Date.now()}`,
          name: `快速分析_${file?.name.split('.')[0] || '未命名'}`,
          description: `通过上传文件 "${file?.name}" 自动生成的快速分析记录。`,
          keywords: ['自动生成', '文件分析'],
          isPublic: false,
          principal: 100000000,
          benchmarkId: 'all_bond',
          createdAt: new Date().toISOString(),
          holdings,
          trades: [],
          history: json.slice(2).map((row, i) => ({
            date: String(row[0]),
            nav: 100 + (Math.random() * 20),
            benchmarkNav: 100 + (Math.random() * 10),
            pnl: 0
          }))
        };

        setPortfolios(prev => [...prev, quickPortfolio]);
        setActivePortfolioId(quickPortfolio.id);
        setActiveMenu('analysis');
      } catch (err) {
        console.error('File parsing error:', err);
        alert('文件解析失败，请检查格式。');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeletePortfolio = (id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));
    if (activePortfolioId === id) setActivePortfolioId(null);
  };

  const handleSetDefault = (id: string) => {
    setPortfolios(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  const handleTrade = (pId: string, tradeDraft: Partial<Trade>) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id !== pId) return p;

      const trade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        ...tradeDraft,
      } as Trade;

      const newTrades = [...p.trades, trade];
      
      const newHoldings = p.holdings.map(h => {
        if (h.code !== trade.code) return h;
        
        const changeValue = trade.quantity * trade.price;
        const currentQty = h.quantity;
        const newQty = trade.type === 'BUY' ? currentQty + trade.quantity : Math.max(0, currentQty - trade.quantity);
        
        // Update avg cost for BUY
        let newAvgCost = h.avgCost;
        if (trade.type === 'BUY' && newQty > 0) {
          newAvgCost = (currentQty * h.avgCost + changeValue) / newQty;
        }

        return { ...h, quantity: newQty, avgCost: newAvgCost };
      });

      return { ...p, trades: newTrades, holdings: newHoldings };
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-800">
      {/* Static Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/40 rotate-3">
            <TrendingUp className="text-white w-6 h-6 -rotate-3" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight italic">指数实盘</h1>
            <div className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">Simulation</div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', label: '控制面板', icon: LayoutDashboard },
            { id: 'analysis', label: '组合分析', icon: BarChart2 },
            { id: 'portfolios', label: '组合管理', icon: Search },
            { id: 'settings', label: '系统设置', icon: Settings },
            { id: 'help', label: '使用指南', icon: HelpCircle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { 
                setActiveMenu(item.id); 
                if(item.id === 'dashboard') setActivePortfolioId(null);
                if(item.id === 'analysis' && portfolios.length > 0 && !activePortfolioId) {
                  const defaultP = portfolios.find(p => p.isDefault) || portfolios[0];
                  setActivePortfolioId(defaultP.id);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group",
                activeMenu === item.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5 font-bold" />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", activeMenu === item.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200">
               <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900">实盘模拟用户</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Free Tier</div>
            </div>
            <LogOut className="w-4 h-4 text-slate-300 hover:text-rose-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              {activePortfolioId && (
                <button 
                  onClick={() => setActivePortfolioId(null)}
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <LayoutDashboard className="w-6 h-6" />
                </button>
              )}
              <div className="h-6 w-px bg-slate-100 hidden md:block" />
              <div className="text-sm font-bold text-slate-500 italic">
                {activePortfolioId ? `正在查看: ${activePortfolio?.name}` : '总览面板'}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="搜索全局数据..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:border-brand transition-all w-64"
                />
              </div>
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-brand transition-colors" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
              </div>
              <button 
                onClick={() => setIsCreating(true)}
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                快速创建
              </button>
           </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {activeMenu === 'analysis' && !activePortfolioId ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-900 italic mb-4 tracking-tight">立即开始组合分析</h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  无需手动创建，只需上传包含指数代码和权重的 Excel 文件，系统将自动生成完整的穿透式持仓与绩效分析报告。
                </p>
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e); }}
                className={cn(
                  "w-full max-w-3xl aspect-[16/6] rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer relative",
                  dragActive ? "border-brand bg-brand-light/20" : "border-slate-200 bg-white hover:border-brand hover:bg-brand-light/10"
                )}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  onChange={handleFileUpload} 
                  accept=".xlsx,.xls,.csv" 
                />
                <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-brand" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-slate-800 italic">点击或拖拽文件进行分析</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">支持 XLSX, CSV 格式</p>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                 {[
                   { title: '多维穿透', desc: '支持行业、风险及风格标签的底层资产透视。', icon: Search, color: 'bg-blue-50 text-blue-600' },
                   { title: '绩效对标', desc: '自动对比债券、股票、黄金等核心指数基准。', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                   { title: '风险评估', desc: '涵盖年化波动、最大回撤、夏普比率等核心指标。', icon: FileText, color: 'bg-purple-50 text-purple-600' },
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", item.color)}>
                         <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black italic text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          ) : activePortfolioId && activePortfolio ? (
            <PortfolioDetail 
              portfolio={activePortfolio} 
              onTrade={handleTrade}
              onUpdate={(p) => setPortfolios(prev => prev.map(old => old.id === p.id ? p : old))}
              defaultTab={activeMenu === 'analysis' ? 'performance' : 'holdings'}
            />
          ) : (
            <PortfolioList 
              portfolios={portfolios} 
              onSelect={(p) => {
                setActivePortfolioId(p.id);
                setActiveMenu('analysis');
              }}
              onCreate={() => setIsCreating(true)}
              onDelete={handleDeletePortfolio}
              onSetDefault={handleSetDefault}
            />
          )}
        </div>
      </main>

      {/* Creation Modal */}
      {isCreating && (
        <CreatePortfolio 
          onClose={() => setIsCreating(false)} 
          onSave={handleCreatePortfolio} 
        />
      )}
    </div>
  );
}
