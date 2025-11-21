import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Recipe, Author, Category } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { generateRecipeFromInput } from '../services/geminiService';

const AddEditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEdit = !!id;
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Recipe>>({
    title: '',
    author: Author.FAMILIA,
    time: '',
    yield: '',
    category: Category.SALGADO,
    ingredients: [''],
    steps: '',
    notes: '',
    isFavorite: false,
    imageUrl: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const existing = recipes.find(r => r.id === id);
      if (existing) {
        setFormData(existing);
      }
    }
  }, [isEdit, id, recipes]);

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...(formData.ingredients || []), ''] });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGeneration = async () => {
    if (!formData.title || formData.title.length < 3) {
      alert("Por favor, escreva pelo menos o nome da receita para a IA te ajudar!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const generated = await generateRecipeFromInput(formData.title, formData.category || Category.SALGADO);
      
      // Convert structured steps to string for the textarea
      const stepsAsString = generated.steps.map((s, i) => {
        let stepText = `${i + 1}. ${s.instruction}`;
        if (s.tip) {
          stepText += `\n(Dica: ${s.tip})`;
        }
        return stepText;
      }).join('\n\n');

      setFormData(prev => ({
        ...prev,
        time: generated.time,
        yield: generated.yield,
        ingredients: generated.ingredients,
        steps: stepsAsString,
        notes: generated.notes
      }));
    } catch (e) {
      alert("Erro ao gerar receita. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipeData = {
      ...formData,
      ingredients: formData.ingredients?.filter(i => i.trim() !== '') || [],
      createdAt: formData.createdAt || Date.now()
    } as Recipe;

    if (isEdit) {
      updateRecipe(recipeData);
    } else {
      addRecipe({ ...recipeData, id: Date.now().toString() });
    }
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-stone-800 flex items-center gap-2">
          <ArrowLeft size={20} /> Cancelar
        </button>
        <h2 className="text-xl font-bold text-stone-800">{isEdit ? 'Editar Receita' : 'Nova Receita'}</h2>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100">
        
        {/* Title & AI Help */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">Nome da Receita</label>
          <div className="flex gap-2">
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
              placeholder="Ex: Bolo de Milho Cremoso"
            />
            <button
              type="button"
              onClick={handleAiGeneration}
              disabled={isGenerating}
              className={`px-4 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${
                isGenerating ? 'bg-terracotta-300 cursor-wait' : 'bg-gradient-to-r from-purple-500 to-terracotta-500 hover:shadow-md'
              }`}
              title="Preencher detalhes automaticamente com IA"
            >
              {isGenerating ? <span className="animate-spin">✨</span> : <Sparkles size={18} />}
              <span className="hidden md:inline">Mágica IA</span>
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-1">Escreva o nome e clique no botão Mágica para a IA preencher o resto!</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Author */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Quem criou?</label>
            <select
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value as Author})}
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
            >
              {Object.values(Author).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Categoria</label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as Category})}
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
            >
              {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Time */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Tempo de Preparo</label>
            <input
              type="text"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
              placeholder="Ex: 45 min"
            />
          </div>

          {/* Yield */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Rendimento</label>
            <input
              type="text"
              value={formData.yield}
              onChange={e => setFormData({...formData, yield: e.target.value})}
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
              placeholder="Ex: 4 pessoas"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Ingredientes</label>
          <div className="space-y-2">
            {formData.ingredients?.map((ing, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ing}
                  onChange={e => handleIngredientChange(index, e.target.value)}
                  className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
                  placeholder={`Ingrediente ${index + 1}`}
                />
                {formData.ingredients!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="mt-3 text-sm font-semibold text-terracotta-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Adicionar ingrediente
          </button>
        </div>

        {/* Steps */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">Modo de Preparo</label>
          <textarea
            rows={6}
            value={formData.steps}
            onChange={e => setFormData({...formData, steps: e.target.value})}
            className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none"
            placeholder="Descreva o passo a passo..."
          />
        </div>
        
        {/* Image URL or Upload */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Foto da Receita</label>
          
          {formData.imageUrl ? (
             <div className="relative mb-3 w-full h-48 rounded-xl overflow-hidden border border-stone-200 group">
               <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
               <button
                 type="button" 
                 onClick={() => setFormData({...formData, imageUrl: ''})}
                 className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600"
               >
                 <Trash2 size={16} />
               </button>
             </div>
          ) : (
            <div className="flex gap-2 mb-3">
               <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-8 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:border-terracotta-400 hover:text-terracotta-600 hover:bg-stone-50 transition-all"
               >
                  <Upload size={24} className="mb-2" />
                  <span className="text-sm font-bold">Carregar Foto</span>
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef}
                 onChange={handleImageUpload}
                 accept="image/*"
                 className="hidden"
               />
            </div>
          )}

          <div className="relative">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                <ImageIcon size={16} />
             </div>
             <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full pl-10 p-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-terracotta-300 outline-none text-sm"
              placeholder="Ou cole um link da imagem aqui..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-terracotta-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-terracotta-500/20 hover:bg-terracotta-700 transition-all flex justify-center items-center gap-2"
        >
          <Save size={20} />
          {isEdit ? 'Atualizar Receita' : 'Salvar Receita'}
        </button>

      </form>
    </div>
  );
};

export default AddEditRecipe;