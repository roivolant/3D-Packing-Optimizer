
import React, { useState, useMemo } from 'react';
import { CONTAINERS } from './constants';
import { Carton, PackingResult } from './types';
import { calculatePacking } from './services/packingEngine';
import Visualizer from './components/Visualizer';
import { Box, Truck, Scale, Maximize, AlertCircle, CheckCircle2, Plus, Trash2, LayoutGrid } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const App: React.FC = () => {
  const [selectedContainerIdx, setSelectedContainerIdx] = useState(0);
  const [cartons, setCartons] = useState<Carton[]>([
    { id: '1', name: 'Type A', length: 0.8, width: 0.6, height: 0.6, weight: 25, quantity: 20, color: COLORS[0] }
  ]);

  const container = CONTAINERS[selectedContainerIdx];

  const result = useMemo(() => {
    return calculatePacking(container, cartons);
  }, [container, cartons]);

  const addCartonType = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setCartons([...cartons, {
      id: newId,
      name: `Type ${String.fromCharCode(65 + cartons.length)}`,
      length: 0.4,
      width: 0.3,
      height: 0.3,
      weight: 10,
      quantity: 10,
      color: COLORS[cartons.length % COLORS.length]
    }]);
  };

  const removeCartonType = (id: string) => {
    if (cartons.length > 1) {
      setCartons(cartons.filter(c => c.id !== id));
    }
  };

  const updateCarton = (id: string, field: keyof Carton, value: string | number) => {
    setCartons(cartons.map(c => {
      if (c.id !== id) return c;
      return { ...c, [field]: typeof value === 'string' ? (parseFloat(value) || 0) : value };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-900 text-white shadow-xl p-6 mb-8 border-b border-indigo-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid size={32} className="text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">Multi-Cargo 3D Optimizer</h1>
          </div>
          <div className="hidden md:block text-sm text-slate-400">Professional Logistics Suite v2.0</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Configuration Sidebar */}
        <aside className="xl:col-span-4 space-y-6">
          {/* Container Config */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Maximize size={20} className="text-indigo-600" />
              1. Container
            </h2>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              value={selectedContainerIdx}
              onChange={(e) => setSelectedContainerIdx(parseInt(e.target.value))}
            >
              {CONTAINERS.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              <div className="bg-slate-50 p-2 rounded">Dims: {container.length}x{container.width}x{container.height}m</div>
              <div className="bg-slate-50 p-2 rounded">Payload: {container.maxWeight/1000}t</div>
            </div>
          </section>

          {/* Cartons Inventory */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Box size={20} className="text-indigo-600" />
                2. Cargo Inventory
              </h2>
              <button 
                onClick={addCartonType}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {cartons.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <input 
                      className="bg-transparent font-bold text-sm focus:outline-none w-full"
                      value={c.name}
                      onChange={(e) => updateCarton(c.id, 'name', e.target.value)}
                    />
                    <button 
                      onClick={() => removeCartonType(c.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-400 block uppercase">L (m)</label>
                      <input type="number" step="0.01" className="w-full text-sm p-1 rounded border border-slate-200" value={c.length} onChange={(e) => updateCarton(c.id, 'length', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-400 block uppercase">W (m)</label>
                      <input type="number" step="0.01" className="w-full text-sm p-1 rounded border border-slate-200" value={c.width} onChange={(e) => updateCarton(c.id, 'width', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-400 block uppercase">H (m)</label>
                      <input type="number" step="0.01" className="w-full text-sm p-1 rounded border border-slate-200" value={c.height} onChange={(e) => updateCarton(c.id, 'height', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-400 block uppercase">Wt (kg)</label>
                      <input type="number" step="1" className="w-full text-sm p-1 rounded border border-slate-200" value={c.weight} onChange={(e) => updateCarton(c.id, 'weight', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block uppercase font-bold text-indigo-500">Qty</label>
                      <input type="number" step="1" className="w-full text-sm p-1 rounded border border-indigo-200 bg-indigo-50/50" value={c.quantity} onChange={(e) => updateCarton(c.id, 'quantity', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Analytics and Visualizer */}
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loaded Units</span>
              <div className="text-3xl font-black text-indigo-600">
                {result.packedItems.length} <span className="text-sm text-slate-400 font-normal">/ {cartons.reduce((a,b) => a+b.quantity, 0)}</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Weight Usage</span>
              <div className="text-3xl font-black text-indigo-600">{result.weightUtilization.toFixed(1)}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(result.weightUtilization, 100)}%` }} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Vol. Usage</span>
              <div className="text-3xl font-black text-indigo-600">{result.volumeUtilization.toFixed(1)}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(result.volumeUtilization, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            result.status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            result.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {result.status === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="font-bold text-sm">{result.message}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-bold text-slate-700">3D Load Configuration</h2>
                <div className="flex gap-4">
                  {cartons.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                      {c.name}: {result.breakdown[c.id].packed}/{c.quantity}
                    </div>
                  ))}
                </div>
             </div>
             <Visualizer container={container} cartons={cartons} result={result} />
          </div>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
