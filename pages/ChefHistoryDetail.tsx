import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Recipe, Author, ChefHistoryItem, AiRecipeSuggestion } from '../types';
import { ArrowLeft, Calendar, ChefHat, ShoppingCart, Save, Plus, Clock, Eye, X, List, FileText, Sparkles, MessageCircle } from 'lucide-react';
import AiRecipeDetailModal from '../components/AiRecipeDetailModal';

const ChefHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getHistoryItem, addRecipe, addToShoppingList } = useApp();
  const [viewingRecipe, setViewingRecipe] = useState<AiRecipeSuggestion | null>(null);

  const item = getHistoryItem(id || '');

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <p className="mb-4">Histórico não encontrado.</p>
        <button onClick={() => navigate('/fridge')} className="text-terracotta-600 underline">Voltar para Chef IA</button>
      </div>
    );
  }

  const handleSaveRecipe = (aiRecipe: AiRecipeSuggestion) => {
     // Convert structured steps to string for legacy compatibility
    const stepsAsString = aiRecipe.steps.map((s, i) => {
      let stepText = `${i + 1}. ${s.instruction}`;
      if (s.tip) {
        stepText += `\n(Dica do Chef: ${s.tip})`;
      }
      return stepText;
    }).join('\n\n');

    const newRecipe: Recipe = {
      ...aiRecipe,
      id: Date.now().toString(),
      createdAt: Date.now(),
      author: Author.IA,
      imageUrl: '',
      isFavorite: false,
      steps: stepsAsString
    };
    addRecipe(newRecipe);
    setViewingRecipe(null);
    navigate(`/recipe/${newRecipe.id}`);
  };

  const handleAddMissingToShopping = (ingredients: string[]) => {
    ingredients.forEach(ing => {
      addToShoppingList({
        id: Date.now().toString() + Math.random(),
        name: ing,
        checked: false,
        reason: 'Do histórico do Chef IA'
      });
    });
    navigate('/shopping');
  };

  return (
    <div className="space-y-8 pb-12">
      <button 
        onClick={() => navigate('/fridge')} 
        className="flex items-center gap-2 text-stone-500 hover:text-terracotta-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Voltar para Chef IA</span>
      </button>

      <div className="flex flex-col gap-4 border-b border-stone-100 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Detalhes da Consulta</h2>
            <div className="flex items-center gap-2 text-stone-400 text-sm mt-1">
              <Calendar size={16} />
              <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
              <span>às</span>
              <Clock size={16} />
              <span>{new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          {/* Images if existing */}
          {item.images.length > 0 && (
            <div className="flex -space-x-2 overflow-hidden">
              {item.images.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt={`Analise ${i}`} 
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover" 
                />
              ))}
            </div>
          )}
        </div>

        {/* Prompt if existing */}
        {item.prompt && (
          <div className="bg-terracotta-50 p-4 rounded-xl border border-terracotta-100">
            <div className="flex items-center gap-2 text-terracotta-700 font-bold text-sm mb-1">
               <MessageCircle size={16} />
               <span>Seu Pedido:</span>
            </div>
            <p className="text-stone-700 italic">"{item.prompt}"</p>
          </div>
        )}
      </div>

      {/* Reusing display logic from FridgeAnalysis but read-only/actionable */}
      <div className="space-y-8">
         {/* 1. Recipes */}
         <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="text-green-600" size={24} />
              <h3 className="text-xl font-bold text-stone-700">Receitas Sugeridas</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {item.result.fullRecipes.map((recipe, idx) => (
                <div key={idx} className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm flex flex-col">
                  <h4 className="text-lg font-bold text-stone-800 mb-2">{recipe.title}</h4>
                  <p className="text-sm text-stone-500 mb-4 italic line-clamp-3">"{recipe.notes}"</p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setViewingRecipe(recipe)}
                      className="py-2 bg-stone-100 text-stone-600 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-stone-200 text-sm"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                    <button 
                      onClick={() => handleSaveRecipe(recipe)}
                      className="py-2 bg-stone-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-stone-900 text-sm"
                    >
                      <Save size={14} />
                      Salvar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Almost Recipes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="text-yellow-600" size={24} />
              <h3 className="text-xl font-bold text-stone-700">Sugestões de Compra</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {item.result.almostRecipes.map((suggestion, idx) => (
                <div key={idx} className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 flex flex-col">
                  <h4 className="text-lg font-bold text-stone-800 mb-1">{suggestion.title}</h4>
                  <div className="flex flex-wrap gap-2 mb-4 mt-2">
                      {suggestion.missingIngredients.map((ing, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-medium">
                          + {ing}
                        </span>
                      ))}
                  </div>
                  <button 
                      onClick={() => handleAddMissingToShopping(suggestion.missingIngredients)}
                      className="mt-auto w-full py-2 bg-white border border-yellow-200 text-yellow-700 rounded-lg font-bold hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <Plus size={14} />
                      Add à Lista
                    </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Items */}
          {item.result.fridgeItems.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-stone-700 mb-3">Ingredientes Identificados</h3>
              <div className="flex flex-wrap gap-2">
                {item.result.fridgeItems.map((fItem, idx) => (
                  <span key={idx} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm border border-stone-200">
                    {fItem.name}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Recipe Detail Modal - NEW COMPONENT */}
      {viewingRecipe && (
        <AiRecipeDetailModal 
          recipe={viewingRecipe}
          onClose={() => setViewingRecipe(null)}
          onSave={handleSaveRecipe}
        />
      )}
    </div>
  );
};

export default ChefHistoryDetail;