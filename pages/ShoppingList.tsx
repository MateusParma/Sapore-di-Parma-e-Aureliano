import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Plus, ShoppingBag, Trash2, Sparkles } from 'lucide-react';

const ShoppingList = () => {
  const { shoppingList, toggleShoppingItem, addToShoppingList, removeShoppingItem } = useApp();
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addToShoppingList({
      id: Date.now().toString(),
      name: newItemName,
      checked: false,
      reason: 'Adicionado manualmente'
    });
    setNewItemName('');
  };

  const sortedList = [...shoppingList].sort((a, b) => Number(a.checked) - Number(b.checked));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Header Card */}
      <div className="bg-rose-400 rounded-3xl p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10" 
             style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "20px 20px" }}>
        </div>
        <ShoppingBag className="absolute -bottom-6 -right-6 text-rose-500 opacity-50 rotate-12" size={140} />
        <Sparkles className="absolute top-6 right-12 text-rose-200 opacity-60 animate-pulse" size={24} />
        
        <div className="relative z-10">
          <h2 className="text-4xl font-hand font-bold mb-1 drop-shadow-sm">Lista de Compras</h2>
          <p className="text-rose-100 font-hand text-xl">Para preparar delícias com amor.</p>
          
          <div className="mt-6 flex gap-4">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
              <span className="block text-2xl font-bold font-hand">{shoppingList.filter(i => !i.checked).length}</span>
              <span className="text-xs text-white/80 uppercase tracking-wide font-bold">Faltam</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
               <span className="block text-2xl font-bold font-hand">{shoppingList.filter(i => i.checked).length}</span>
               <span className="text-xs text-white/80 uppercase tracking-wide font-bold">Comprados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Input */}
      <form onSubmit={handleAdd} className="relative group">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Adicionar item (ex: Leite, Ovos)..."
          className="w-full p-5 pr-16 bg-white rounded-2xl border border-sage-100 shadow-sm focus:ring-2 focus:ring-sage-300 outline-none font-hand text-xl text-stone-700 placeholder:text-stone-300 transition-all"
        />
        <button 
          type="submit"
          disabled={!newItemName.trim()}
          className="absolute right-2 top-2 bottom-2 bg-sage-500 text-white aspect-square rounded-xl hover:bg-sage-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:bg-sage-500 shadow-md hover:shadow-lg"
        >
          <Plus size={24} />
        </button>
      </form>

      {/* List Container - Paper Style */}
      <div className="bg-white rounded-sm shadow-md border-t-8 border-sage-200 min-h-[300px] relative overflow-hidden">
        {/* Paper Lines Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30" 
             style={{ backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "100% 3rem", marginTop: "2rem" }}>
        </div>

        {sortedList.length === 0 ? (
          <div className="p-12 text-center text-stone-400 flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-stone-300">
              <ShoppingBag size={32} />
            </div>
            <p className="font-hand text-2xl">Sua lista está vazia.</p>
            <p className="text-sm mt-2">Adicione ingredientes para não esquecer nada!</p>
          </div>
        ) : (
          <ul className="relative z-10 pb-4">
            {sortedList.map((item) => (
              <li 
                key={item.id} 
                className={`group flex items-start gap-4 p-4 hover:bg-sage-50/50 transition-colors border-b border-transparent hover:border-sage-100 ${item.checked ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => toggleShoppingItem(item.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    item.checked 
                      ? 'bg-sage-500 border-sage-500 text-white scale-110' 
                      : 'border-stone-300 text-transparent hover:border-sage-400 bg-white'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </button>
                
                <div className="flex-1 pt-1">
                  <p className={`font-hand text-xl font-bold text-stone-800 leading-none transition-all ${item.checked ? 'line-through decoration-rose-400 decoration-2 text-stone-400' : ''}`}>
                    {item.name}
                  </p>
                  {item.reason && (
                    <p className="text-xs text-sage-500 mt-1 font-sans font-bold tracking-wide uppercase">{item.reason}</p>
                  )}
                </div>

                <button 
                  onClick={() => removeShoppingItem(item.id)}
                  className="p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Remover item"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;