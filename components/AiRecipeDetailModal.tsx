import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Users, ChefHat, Save, FileText, Sparkles, Utensils, ShoppingCart, Plus, Lightbulb, Heart } from 'lucide-react';
import { AiRecipeSuggestion } from '../types';
import { useApp } from '../context/AppContext';

interface AiRecipeDetailModalProps {
  recipe: AiRecipeSuggestion;
  onClose: () => void;
  onSave: (recipe: AiRecipeSuggestion) => void;
}

const AiRecipeDetailModal: React.FC<AiRecipeDetailModalProps> = ({ recipe, onClose, onSave }) => {
  const navigate = useNavigate();
  const { addToShoppingList } = useApp();

  const handleAddIngredientsToShopping = () => {
    recipe.ingredients.forEach(ing => {
      addToShoppingList({
        id: Date.now().toString() + Math.random(),
        name: ing,
        checked: false,
        reason: `Sugestão IA: ${recipe.title}`
      });
    });
    navigate('/shopping');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      {/* Main Container: Full width/height on mobile, Rounded/Constrained on Desktop */}
      <div className="bg-paper w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Header Image / Gradient */}
            <div className="h-48 sm:h-64 bg-sage-400 relative flex items-center justify-center overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
            <div className="text-center text-white p-6 z-10 w-full max-w-3xl pt-12 sm:pt-6">
                <div className="bg-white/20 backdrop-blur-md w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/30">
                <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="font-hand text-3xl sm:text-5xl font-bold drop-shadow-md leading-tight px-4">{recipe.title}</h2>
            </div>
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all backdrop-blur-sm z-20"
            >
                <X size={24} />
            </button>
            </div>

            {/* Stats Bar */}
            <div className="bg-white shadow-sm border-b border-sage-100 px-4 sm:px-6 py-4 flex justify-around items-center text-stone-600 sticky top-0 z-10">
            <div className="flex flex-col items-center">
                <Clock size={18} className="text-sage-500 mb-1" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-stone-400">Tempo</span>
                <span className="font-hand text-xl sm:text-2xl font-bold">{recipe.time}</span>
            </div>
            <div className="w-px h-8 bg-stone-100"></div>
            <div className="flex flex-col items-center">
                <Users size={18} className="text-sage-500 mb-1" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-stone-400">Porções</span>
                <span className="font-hand text-xl sm:text-2xl font-bold">{recipe.yield}</span>
            </div>
            <div className="w-px h-8 bg-stone-100"></div>
            <div className="flex flex-col items-center">
                <Utensils size={18} className="text-sage-500 mb-1" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-stone-400">Tipo</span>
                <span className="font-hand text-xl sm:text-2xl font-bold">{recipe.category}</span>
            </div>
            </div>

            {/* Main Layout */}
            <div className="p-4 sm:p-10 grid md:grid-cols-[1fr_1.8fr] gap-8 md:gap-12 bg-paper pb-24 sm:pb-10">
            
            {/* Left Column: Ingredients & Notes */}
            <div className="space-y-6 sm:space-y-8">
                <div className="bg-white p-5 sm:p-8 rounded-sm shadow-sm border border-stone-100 relative overflow-hidden sm:rotate-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-sage-200"></div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2 font-hand text-2xl sm:text-3xl">
                    Ingredientes
                    </h3>
                    <button 
                    onClick={handleAddIngredientsToShopping}
                    className="text-xs font-bold text-sage-600 bg-sage-50 hover:bg-sage-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                    title="Adicionar à lista de compras"
                    >
                    <ShoppingCart size={14} />
                    <Plus size={10} />
                    </button>
                </div>
                
                <ul className="space-y-4">
                    {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700 group">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-sage-300 group-hover:bg-sage-500 transition-colors flex-shrink-0" />
                        <span className="flex-1 leading-relaxed border-b border-stone-50 pb-3 group-hover:border-sage-100 transition-colors font-hand text-lg sm:text-xl">{ing}</span>
                    </li>
                    ))}
                </ul>
                </div>

                {recipe.notes && (
                <div className="relative bg-rose-50 p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                    <div className="bg-rose-100 p-1.5 rounded-full text-rose-500">
                        <Heart size={14} fill="currentColor" />
                    </div>
                    <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wide">
                        Por que você vai amar
                    </h4>
                    </div>
                    <p className="text-rose-900/80 italic font-hand text-lg sm:text-xl leading-relaxed">
                    "{recipe.notes}"
                    </p>
                </div>
                )}
            </div>

            {/* Right Column: Detailed Preparation */}
            <div>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="bg-sage-100 p-2.5 rounded-full text-sage-600 shadow-sm">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="font-hand text-3xl sm:text-4xl font-bold text-stone-800 leading-none">Modo de Preparo</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Feito com carinho</p>
                </div>
                </div>
                
                <div className="space-y-6 sm:space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-stone-200 border-l-2 border-dashed border-stone-200 hidden sm:block"></div>

                {recipe.steps.map((step, i) => (
                    <div key={i} className="relative flex flex-col sm:flex-row gap-3 sm:gap-6 group">
                    {/* Number Bubble */}
                    <div className="flex-shrink-0 flex sm:justify-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-sage-200 text-sage-600 font-hand text-lg sm:text-2xl font-bold flex items-center justify-center shadow-sm group-hover:border-sage-400 group-hover:scale-110 transition-all z-10 relative">
                        {i + 1}
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white p-4 sm:p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <p className="text-stone-600 leading-relaxed text-lg sm:text-xl font-hand">
                        {step.instruction}
                        </p>

                        {/* Warm Tip Highlight */}
                        {step.tip && (
                        <div className="mt-4 bg-cream rounded-xl p-3 sm:p-4 flex gap-3 border border-stone-100">
                            <div className="flex-shrink-0 mt-0.5">
                            <Lightbulb size={18} className="text-amber-400 fill-amber-400" />
                            </div>
                            <div>
                            <span className="block text-xs font-bold text-amber-500 uppercase tracking-wide mb-0.5">Segredinho do Chef</span>
                            <p className="text-base sm:text-lg text-stone-600 italic font-hand">
                                {step.tip}
                            </p>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>

        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="p-4 border-t border-sage-100 bg-white flex justify-between items-center sticky bottom-0 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 font-bold font-hand text-lg sm:text-xl px-4 sm:px-6 py-2 sm:py-3 hover:bg-stone-50 rounded-xl transition-colors"
          >
            Voltar
          </button>
          <button 
            onClick={() => onSave(recipe)}
            className="bg-sage-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-hand font-bold text-lg sm:text-xl shadow-lg shadow-sage-500/30 hover:bg-sage-600 hover:scale-105 transition-all flex items-center gap-2 sm:gap-3"
          >
            <Save size={20} />
            <span className="hidden sm:inline">Salvar no Livro</span>
            <span className="sm:hidden">Salvar</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiRecipeDetailModal;