import React from 'react';
import { Plus, FolderOpen, Globe, Lock, Clock, MoreVertical, Edit2, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Portfolio } from '../types';

interface PortfolioListProps {
  portfolios: Portfolio[];
  onSelect: (p: Portfolio) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function PortfolioList({ portfolios, onSelect, onCreate, onDelete, onSetDefault }: PortfolioListProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">组合管理</h2>
          <p className="text-slate-500 text-sm">在这里管理和切换您的各个模拟账户</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/25 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-5 h-5" />
          创建新组合
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">暂无组合</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm text-center">点击右上角的按钮开始创建您的第一个实盘模拟投资组合</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((p) => (
            <div 
              key={p.id}
              className={cn(
                "group relative bg-white border rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-slate-200/60 cursor-pointer overflow-hidden",
                p.isDefault ? "border-brand border-2" : "border-slate-100"
              )}
              onClick={() => onSelect(p)}
            >
              {p.isDefault && (
                <div className="absolute top-0 right-0 bg-brand text-white px-3 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Default
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-light group-hover:text-brand transition-colors">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500">
                  {p.isPublic ? <><Globe className="w-3 h-3" /> 公开</> : <><Lock className="w-3 h-3" /> 私密</>}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-brand transition-colors">{p.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">{p.description || '暂无描述'}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-6">
                {p.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-md">#{kw}</span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">账户本金</div>
                  <div className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(p.principal)}</div>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] fonr-bold">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="absolute opacity-0 group-hover:opacity-100 top-4 right-4 flex flex-col gap-2 transition-all scale-90 group-hover:scale-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); onSetDefault(p.id); }}
                  className="p-2 bg-white shadow-lg rounded-xl hover:text-brand transition-all border border-slate-100"
                  title="设为默认"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                  className="p-2 bg-white shadow-lg rounded-xl hover:text-red-500 transition-all border border-slate-100"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Special Module:专题快捷入口 */}
      <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/20 to-transparent pointer-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Special专题
            </div>
            <h2 className="text-4xl font-black text-white mb-4 leading-tight italic">军工专题模拟组合</h2>
            <p className="text-slate-400 text-lg">快速一键部署军工行业相关指数组合，深度分析国防工业板块投资机会。</p>
          </div>
          <button className="px-10 py-5 bg-white text-slate-900 font-black rounded-3xl hover:bg-brand hover:text-white transition-all shadow-2xl flex items-center gap-3 text-lg">
            立即创建专题组合
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
