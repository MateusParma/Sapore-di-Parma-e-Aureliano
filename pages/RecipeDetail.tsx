import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, Heart, Edit2, ArrowLeft, ChefHat, List, FileText, Info, ShoppingCart, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, toggleFavorite, addToShoppingList } = useApp();
  
  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <p className="mb-4">Receita não encontrada.</p>
        <button onClick={() => navigate('/')} className="text-terracotta-600 underline">Voltar para Início</button>
      </div>
    );
  }

  const handleAddIngredientsToShopping = () => {
    recipe.ingredients.forEach(ing => {
      addToShoppingList({
        id: Date.now().toString() + Math.random(),
        name: ing,
        checked: false,
        reason: `Receita: ${recipe.title}`
      });
    });
    navigate('/shopping');
  };

  return (
    <div className="pb-12">
      {/* Navigation Header */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center gap-2 text-stone-500 hover:text-terracotta-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 w-full">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-terracotta-50 flex items-center justify-center text-terracotta-200">
              <ChefHat size={80} />
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-3">
             <button 
              onClick={() => toggleFavorite(recipe.id)}
              className="bg-white/90 backdrop-blur p-3 rounded-full shadow-md hover:bg-white transition-all group"
            >
              <Heart 
                size={20} 
                className={`transition-colors ${recipe.isFavorite ? 'text-red-500 fill-red-500' : 'text-stone-400 group-hover:text-red-400'}`} 
              />
            </button>
            <Link 
              to={`/edit/${recipe.id}`}
              className="bg-white/90 backdrop-blur p-3 rounded-full shadow-md hover:bg-white transition-all text-stone-600 hover:text-terracotta-600"
            >
              <Edit2 size={20} />
            </Link>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-24">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-hand mb-2">{recipe.title}</h1>
            <p className="text-white/90 font-medium">Receita de: {recipe.author}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex divide-x divide-stone-100 border-b border-stone-100">
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <Clock className="text-terracotta-500 mb-1" size={20} />
            <span className="text-xs text-stone-400 uppercase tracking-wide">Tempo</span>
            <span className="font-semibold text-stone-700">{recipe.time}</span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <Users className="text-terracotta-500 mb-1" size={20} />
            <span className="text-xs text-stone-400 uppercase tracking-wide">Rendimento</span>
            <span className="font-semibold text-stone-700">{recipe.yield}</span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
             <Info className="text-terracotta-500 mb-1" size={20} />
             <span className="text-xs text-stone-400 uppercase tracking-wide">Tipo</span>
             <span className="font-semibold text-stone-700">{recipe.category}</span>
          </div>
        </div>

        <div className="p-6 md:p-10 grid md:grid-cols-[1fr_1.5fr] gap-10">
          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-xl text-stone-800">
                <List className="text-terracotta-500" />
                Ingredientes
              </h2>
              <button 
                onClick={handleAddIngredientsToShopping}
                className="text-xs font-bold text-terracotta-600 bg-terracotta-50 hover:bg-terracotta-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Adicionar todos à lista de compras"
              >
                <ShoppingCart size={14} />
                <Plus size={10} />
                Add Lista
              </button>
            </div>
            
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors">
                  <input 
                    type="checkbox" 
                    id={`ing-${idx}`}
                    className="mt-1 w-5 h-5 rounded border-stone-300 text-terracotta-600 focus:ring-terracotta-500 cursor-pointer"
                  />
                  <label htmlFor={`ing-${idx}`} className="text-stone-700 leading-relaxed cursor-pointer select-none">
                    {ingredient}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Preparation */}
          <div className="space-y-6">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-xl text-stone-800 mb-4">
                <FileText className="text-terracotta-500" />
                Modo de Preparo
              </h2>
              <div className="prose prose-stone max-w-none">
                 {recipe.steps.split('\n').map((step, i) => {
                   const cleanStep = step.replace(/^\d+\.\s*/, ''); // Remove manual numbering if exists
                   if (!cleanStep.trim()) return null;
                   return (
                    <div key={i} className="flex gap-4 mb-4 last:mb-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-terracotta-100 text-terracotta-700 font-bold rounded-full flex items-center justify-center text-sm">
                        {i + 1}
                      </div>
                      <p className="text-stone-600 leading-relaxed mt-0.5">
                        {cleanStep}
                      </p>
                    </div>
                   )
                 })}
              </div>
            </div>

            {recipe.notes && (
              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-yellow-800 mb-2 text-sm uppercase tracking-wider">Notas de Família</h3>
                <p className="text-yellow-900/80 italic">"{recipe.notes}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;