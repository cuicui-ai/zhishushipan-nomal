import React, { useState } from 'react';
import { X, Search, Plus, Trash2, Info } from 'lucide-react';
import { cn, numberToChinese, formatCurrency } from '../lib/utils';
import { MOCK_INDICES, MOCK_BENCHMARKS } from '../constants';
import { Portfolio, IndexInfo } from '../types';

interface CreatePortfolioProps {
  onClose: () => void;
  onSave: (portfolio: Portfolio) => void;
}

export default function CreatePortfolio({ onClose, onSave }: CreatePortfolioProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [principal, setPrincipal] = useState(100000000);
  const [benchmarkId, setBenchmarkId] = useState(MOCK_BENCHMARKS[0].id);
  const [search, setSearch] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<IndexInfo[]>([]);

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentKeyword.trim()) {
      if (keywords.length < 5) {
        setKeywords([...keywords, currentKeyword.trim().slice(0, 15)]);
        setCurrentKeyword('');
      }
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const filteredIndices = MOCK_INDICES.filter(idx => 
    idx.name.includes(search) || idx.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleIndex = (index: IndexInfo) => {
    if (selectedIndices.some(si => si.code === index.code)) {
      setSelectedIndices(selectedIndices.filter(si => si.code !== index.code));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleSave = () => {
    const portfolio: Portfolio = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      keywords,
      isPublic,
      principal,
      benchmarkId,
      createdAt: new Date().toISOString(),
      holdings: selectedIndices.map(si => ({
        code: si.code,
        name: si.name,
        quantity: 0,
        avgCost: si.price,
        currentPrice: si.price,
        change: si.change,
        tags: si.tags
      })),
      trades: [],
      history: []
    };
    onSave(portfolio);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">创建新组合</h2>
            <p className="text-sm text-slate-500">完成以下步骤以启动您的实盘模拟</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">组合名称 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  maxLength={20}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例如：科技成长混合组合"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
                <div className="text-[10px] text-slate-400 text-right">{name.length}/20</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">组合说明</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="简单描述本组合的投资逻辑或目标..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all min-h-[100px] resize-none"
                />
                <div className="text-[10px] text-slate-400 text-right">{description.length}/500</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">关键词</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-brand-light text-brand text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-brand/10">
                      {kw}
                      <button onClick={() => removeKeyword(i)} className="hover:text-brand-dark">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={currentKeyword}
                  onChange={e => setCurrentKeyword(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="输入关键词后回车 (最多5个)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-8 pt-2">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsPublic(true)}>
                  <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-all", isPublic ? "border-brand bg-brand" : "border-slate-300")}>
                    {isPublic && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">公开展示</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsPublic(false)}>
                  <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-all", !isPublic ? "border-brand bg-brand" : "border-slate-300")}>
                    {!isPublic && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">设为私密</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700">账户本金 (元)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                  <input 
                    type="number" 
                    value={principal}
                    onChange={e => setPrincipal(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold rounded-2xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">大写金额</span>
                  <span className="text-lg font-bold text-brand uppercase">{numberToChinese(principal)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700">业绩基准</label>
                <div className="grid grid-cols-1 gap-2">
                  {MOCK_BENCHMARKS.map((b) => (
                    <div 
                      key={b.id}
                      onClick={() => setBenchmarkId(b.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between",
                        benchmarkId === b.id ? "border-brand bg-brand-light/50" : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <span className={cn("font-semibold", benchmarkId === b.id ? "text-brand" : "text-slate-700")}>{b.name}</span>
                      {benchmarkId === b.id && <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"/></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-brand" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索指数名称或代码..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredIndices.map(idx => (
                  <div 
                    key={idx.code}
                    onClick={() => toggleIndex(idx)}
                    className={cn(
                      "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                      selectedIndices.some(si => si.code === idx.code) ? "border-brand bg-brand-light/40" : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{idx.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{idx.code}</span>
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {idx.tags.map(tag => (
                          <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                      selectedIndices.some(si => si.code === idx.code) ? "bg-brand text-white" : "bg-slate-100 text-slate-300"
                    )}>
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 font-medium">已选择 {selectedIndices.length} 个指数。后续您可以在“持仓列表”中进行更细致的份额配置与交易模拟。</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", step === i ? "w-8 bg-brand" : "w-1.5 bg-slate-200")} />
            ))}
          </div>
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                上一步
              </button>
            )}
            {step < 3 ? (
              <button 
                disabled={step === 1 && !name}
                onClick={() => setStep(step + 1)}
                className="px-8 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand/20"
              >
                下一步
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={selectedIndices.length === 0}
                className="px-8 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand/20"
              >
                完成创建
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
