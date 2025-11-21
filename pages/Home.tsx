import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Clock, User, Heart, ChefHat, Flower } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Author, Category } from '../types';

const Home = () => {
  const { recipes } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize search from navigation state if available
  const [filterText, setFilterText] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (location.state && location.state.search) {
      setFilterText(location.state.search);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesText = recipe.title.toLowerCase().includes(filterText.toLowerCase());
      const matchesAuthor = selectedAuthor === 'all' || recipe.author === selectedAuthor;
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      return matchesText && matchesAuthor && matchesCategory;
    });
  }, [recipes, filterText, selectedAuthor, selectedCategory]);

  return (
    <div className="space-y-8">
      
      {/* Dedication Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-sage-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sage-200 via-rose-200 to-sage-200"></div>
        <div className="absolute -top-4 -right-4 text-rose-100 opacity-50 animate-pulse">
          <Heart size={80} fill="currentColor" />
        </div>
        <div className="absolute -bottom-4 -left-4 text-sage-100 opacity-50">
          <Flower size={80} />
        </div>
        
        <h2 className="font-hand text-3xl font-bold text-stone-700 mb-2">Para o amor da minha vida, Deborah.</h2>
        <p className="text-stone-500 font-hand text-lg max-w-2xl mx-auto leading-relaxed">
          Que cada receita aqui guardada seja um capítulo da nossa história e que nossa cozinha seja sempre o coração da nossa casa. Com todo meu amor, Mateus.
        </p>
        <div className="flex justify-center gap-2 mt-4 text-rose-400">
          <Heart size={16} fill="currentColor" />
          <Heart size={16} fill="currentColor" />
          <Heart size={16} fill="currentColor" />
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-sage-100 sticky top-4 z-30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" size={20} />
          <input
            type="text"
            placeholder="Buscar receitas (ex: bolo, risoto)..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-stone-700 placeholder-sage-300 font-hand text-xl"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        <button
          onClick={() => setSelectedAuthor('all')}
          className={`px-4 py-2 rounded-full text-sm font-hand tracking-wider whitespace-nowrap transition-colors border ${selectedAuthor === 'all' ? 'bg-sage-500 border-sage-500 text-white shadow-md shadow-sage-200' : 'bg-white border-sage-100 text-stone-500 hover:bg-sage-50'}`}
        >
          Todas
        </button>
        {Object.values(Author).map(author => (
            <button
            key={author}
            onClick={() => setSelectedAuthor(author)}
            className={`px-4 py-2 rounded-full text-sm font-hand tracking-wider whitespace-nowrap transition-colors border ${selectedAuthor === author ? 'bg-sage-500 border-sage-500 text-white shadow-md shadow-sage-200' : 'bg-white border-sage-100 text-stone-500 hover:bg-sage-50'}`}
          >
            {author}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecipes.map(recipe => (
          <Link 
            key={recipe.id} 
            to={`/recipe/${recipe.id}`}
            className="group bg-white rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-8 border-white ring-1 ring-stone-100 flex flex-col rotate-0 hover:rotate-1 transform"
          >
            <div className="relative h-56 overflow-hidden">
              {recipe.imageUrl ? (
                <img 
                  src={recipe.imageUrl} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter sepia-[0.1]"
                />
              ) : (
                <div className="w-full h-full bg-sage-50 flex items-center justify-center text-sage-300">
                  <ChefHat size={48} />
                </div>
              )}
              {recipe.isFavorite && (
                <div className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-rose-500 shadow-sm">
                  <Heart size={18} fill="currentColor" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm text-stone-600 text-xs font-bold px-3 py-1 rounded-full font-hand uppercase tracking-wider">
                {recipe.category}
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
              <h3 className="font-hand font-bold text-2xl text-stone-800 leading-none mb-3 group-hover:text-sage-600 transition-colors">{recipe.title}</h3>
              
              <div className="mt-auto flex items-center justify-between text-stone-500 border-t border-dashed border-stone-200 pt-4">
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span className="text-xs uppercase tracking-wide font-bold">{recipe.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span className="text-xs uppercase tracking-wide font-bold">{recipe.time}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredRecipes.length === 0 && (
          <div className="col-span-full py-16 text-center text-sage-400">
            <div className="bg-sage-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flower size={32} />
            </div>
            <p className="font-hand text-xl">Nenhuma receitinha encontrada.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/add')}
        className="fixed bottom-24 md:bottom-12 right-6 md:right-12 bg-sage-600 hover:bg-sage-700 text-white p-4 rounded-full shadow-lg hover:shadow-sage-500/30 transition-all duration-300 z-30 flex items-center gap-2 group"
      >
        <Plus size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-hand font-bold text-lg px-0 group-hover:px-2">Nova Receita</span>
      </button>
    </div>
  );
};

export default Home;