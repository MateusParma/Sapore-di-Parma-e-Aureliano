import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Plus, Trash2, AlertCircle, Save, ShoppingCart, ChevronRight, ChefHat, Clock, Calendar, Eye, X, List, FileText, MessageCircle, Send, Coins, Wine, Search, Check } from 'lucide-react';
import { detectIngredients, generateRecipesFromIngredients, createChefRecipe } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { SuggestionResult, Recipe, Author, ChefHistoryItem, AiRecipeSuggestion, ChefMood, FridgeItem } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import AiRecipeDetailModal from '../components/AiRecipeDetailModal';

const FridgeAnalysis = () => {
  const { addFridgeItems, addRecipe, addToShoppingList, addChefHistory, chefHistory } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Steps: 'input' -> 'verification' -> 'results'
  const [step, setStep] = useState<'input' | 'verification' | 'results'>('input');
  
  // UI Mode State: 'photo' or 'text'
  const [mode, setMode] = useState<'photo' | 'text'>('photo');
  // Mood State: Economy vs Fancy
  const [chefMood, setChefMood] = useState<ChefMood>('economy');

  // Photo Mode State
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // Text Mode State
  const [userPrompt, setUserPrompt] = useState('');

  // Verification State
  const [detectedItems, setDetectedItems] = useState<FridgeItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  // Common State
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [viewingRecipe, setViewingRecipe] = useState<AiRecipeSuggestion | null>(null);

  const resetFlow = () => {
    setStep('input');
    setResult(null);
    setDetectedItems([]);
    setError(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
          resetFlow(); 
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Step 1: Analyze Photos to get Ingredients
  const handleIdentifyIngredients = async () => {
    if (selectedImages.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const items = await detectIngredients(selectedImages);
      setDetectedItems(items);
      setStep('verification');
    } catch (err) {
      setError("Não consegui identificar os ingredientes nas fotos. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 1 Alternate: Text Input (Direct to Results usually, or implies ingredients)
  const handleTextRequest = async () => {
    if (!userPrompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const data = await createChefRecipe(userPrompt, chefMood);
      finishAnalysis(data);
    } catch (err) {
      setError("Tive dificuldade com seu pedido. Tente explicar de outra forma.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2 Actions: Modify Ingredients
  const addVerificationItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: FridgeItem = {
      id: `manual-${Date.now()}`,
      name: newItemName,
      quantity: '1 un',
    };
    setDetectedItems(prev => [...prev, newItem]);
    setNewItemName('');
  };

  const removeVerificationItem = (id: string) => {
    setDetectedItems(prev => prev.filter(i => i.id !== id));
  };

  // Step 3: Generate Recipes from Verified List
  const handleGenerateRecipes = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const ingredientNames = detectedItems.map(i => i.name);
      const data = await generateRecipesFromIngredients(ingredientNames, chefMood);
      
      // Combine the verified items into the result
      data.fridgeItems = detectedItems;
      
      finishAnalysis(data);
    } catch (err) {
      setError("Erro ao criar receitas. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finishAnalysis = (data: SuggestionResult) => {
    setResult(data);
    addFridgeItems(data.fridgeItems);
    
    // Save to History
    const historyItem: ChefHistoryItem = {
      id: Date.now().toString(),
      date: Date.now(),
      images: mode === 'photo' ? selectedImages : [],
      prompt: mode === 'text' ? userPrompt : undefined,
      result: data
    };
    addChefHistory(historyItem);
    setStep('results');
  };

  const handleSaveRecipe = (aiRecipe: AiRecipeSuggestion) => {
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
    setViewingRecipe(null); // Close modal if open
    navigate(`/recipe/${newRecipe.id}`);
  };

  const handleAddMissingToShopping = (ingredients: string[]) => {
    ingredients.forEach(ing => {
      addToShoppingList({
        id: Date.now().toString() + Math.random(),
        name: ing,
        checked: false,
        reason: 'Sugerido pela IA'
      });
    });
    navigate('/shopping');
  };

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* Simple Header */}
      <div className="text-center max-w-lg mx-auto mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-sage-100 rounded-full text-sage-600 mb-3 shadow-sm">
          <ChefHat size={28} />
        </div>
        <h2 className="text-2xl font-hand font-bold text-stone-800 leading-tight">Chef da Cozinha</h2>
        <p className="text-stone-500 text-sm mt-1 font-hand text-lg">
          Tire fotos da geladeira, armários ou despensa. Eu identifico o que você tem e crio receitas incríveis.
        </p>
      </div>

      {/* Step 1: Input (Photos or Text) */}
      {step === 'input' && (
        <div className="animate-fade-in">
          {/* Mode Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            <button 
              onClick={() => { setMode('photo'); setError(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-hand font-bold transition-all ${
                mode === 'photo' 
                  ? 'bg-sage-600 text-white shadow-md' 
                  : 'bg-white text-stone-400 border border-stone-200 hover:bg-sage-50'
              }`}
            >
              <Camera size={18} />
              Fotos dos Ingredientes
            </button>
            <button 
              onClick={() => { setMode('text'); setError(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-hand font-bold transition-all ${
                mode === 'text' 
                  ? 'bg-sage-600 text-white shadow-md' 
                  : 'bg-white text-stone-400 border border-stone-200 hover:bg-sage-50'
              }`}
            >
              <MessageCircle size={18} />
              Pedido por Texto
            </button>
          </div>

          {/* Mood Selector */}
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setChefMood('economy')}
              className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                chefMood === 'economy' 
                ? 'bg-sage-50 border-sage-300 text-sage-700' 
                : 'bg-white border-transparent text-stone-400 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins size={16} />
                <span className="font-hand font-bold">Dia a Dia</span>
              </div>
            </button>
            
            <button
              onClick={() => setChefMood('fancy')}
              className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                chefMood === 'fancy' 
                ? 'bg-rose-50 border-rose-300 text-rose-700' 
                : 'bg-white border-transparent text-stone-400 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wine size={16} />
                <span className="font-hand font-bold">Especial</span>
              </div>
            </button>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 max-w-3xl mx-auto relative">
            
            {mode === 'photo' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                      <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-white text-rose-500 p-1 rounded-full shadow-sm opacity-90 hover:scale-110 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-sage-200 hover:border-sage-400 hover:bg-sage-50 flex flex-col items-center justify-center text-sage-400 transition-all bg-cream"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-xs font-bold font-hand">Adicionar</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                />
                <div className="text-center">
                   <button
                    onClick={handleIdentifyIngredients}
                    disabled={isProcessing || selectedImages.length === 0}
                    className="bg-sage-600 text-white px-8 py-3 rounded-full font-hand font-bold text-xl shadow-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto"
                  >
                    {isProcessing ? <span className="animate-spin">✨</span> : <Search size={20} />}
                    {isProcessing ? 'Analisando...' : 'Identificar Ingredientes'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full p-4 bg-cream border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-300 outline-none text-stone-700 h-32 resize-none font-hand text-lg placeholder:text-stone-300"
                  placeholder="Ex: Tenho batata, frango e creme de leite. O que posso fazer para o almoço?"
                />
                <div className="text-center">
                   <button
                    onClick={handleTextRequest}
                    disabled={isProcessing || !userPrompt.trim()}
                    className="bg-sage-600 text-white px-8 py-3 rounded-full font-hand font-bold text-xl shadow-lg hover:bg-sage-700 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
                  >
                    {isProcessing ? <span className="animate-spin">✨</span> : <Send size={20} />}
                    {isProcessing ? 'Criando...' : 'Enviar Pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Verification Modal/Overlay */}
      {step === 'verification' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-sage-100 bg-sage-50 rounded-t-3xl">
                <h3 className="font-hand font-bold text-2xl text-sage-800 flex items-center gap-2">
                  <Check size={24} />
                  Confirme os Ingredientes
                </h3>
                <p className="text-stone-500 text-sm mt-1">
                  Encontrei estes itens. Adicione o que faltou ou remova erros antes de cozinhar!
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-paper">
                {/* Detected Items Grid */}
                <div className="flex flex-wrap gap-2 mb-6">
                   {detectedItems.map((item) => (
                     <div key={item.id} className="flex items-center gap-2 bg-white border border-sage-200 pl-3 pr-1 py-1.5 rounded-full shadow-sm group hover:border-sage-400 transition-colors">
                        <span className="font-hand font-bold text-stone-700">{item.name}</span>
                        <button 
                          onClick={() => removeVerificationItem(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                        >
                          <X size={14} />
                        </button>
                     </div>
                   ))}
                   {detectedItems.length === 0 && (
                      <p className="text-stone-400 italic font-hand">Nenhum item encontrado. Adicione manualmente abaixo.</p>
                   )}
                </div>

                {/* Add Manual Item */}
                <form onSubmit={addVerificationItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Adicionar item (ex: Cebola)..."
                    className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-300 outline-none font-hand text-lg"
                  />
                  <button 
                    type="submit"
                    disabled={!newItemName.trim()}
                    className="bg-sage-100 text-sage-700 p-3 rounded-xl hover:bg-sage-200 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </form>
              </div>

              <div className="p-6 border-t border-sage-100 bg-white rounded-b-3xl flex justify-between items-center">
                <button 
                  onClick={resetFlow}
                  className="text-stone-400 hover:text-stone-600 font-hand font-bold text-lg px-4"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleGenerateRecipes}
                  disabled={isProcessing || detectedItems.length === 0}
                  className="bg-sage-600 text-white px-8 py-3 rounded-full font-hand font-bold text-xl shadow-lg hover:bg-sage-700 disabled:opacity-50 flex items-center gap-2"
                >
                   {isProcessing ? <span className="animate-spin">✨</span> : <ChefHat size={20} />}
                   {isProcessing ? 'Cozinhando...' : 'Criar Receitas'}
                </button>
              </div>

           </div>
         </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && result && (
        <div className="animate-fade-in max-w-5xl mx-auto">
           
           <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-3xl font-hand font-bold text-stone-800">Pratos Sugeridos</h3>
              <button 
                onClick={resetFlow}
                className="text-sm font-bold text-sage-600 hover:text-sage-700 flex items-center gap-1 bg-sage-50 px-3 py-1.5 rounded-lg"
              >
                <Camera size={14} />
                Nova Análise
              </button>
           </div>

           {/* Full Recipes */}
           <div className="grid md:grid-cols-3 gap-6 mb-10">
              {result.fullRecipes.map((recipe, idx) => (
                <div key={idx} className="bg-white border border-sage-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col p-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-sage-300"></div>
                  <div className="absolute top-2 right-2 text-sage-200 opacity-20 group-hover:opacity-40 transition-opacity">
                    <ChefHat size={40} />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-sage-500 mb-1">{recipe.category}</span>
                  <h4 className="text-xl font-hand font-bold text-stone-800 mb-2 leading-tight">{recipe.title}</h4>
                  <p className="text-sm text-stone-500 mb-4 line-clamp-3 italic">"{recipe.notes}"</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
                      <span>{recipe.yield}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setViewingRecipe(recipe)}
                        className="py-2.5 bg-sage-50 text-sage-700 rounded-xl font-hand font-bold flex items-center justify-center gap-2 hover:bg-sage-100 text-lg transition-colors"
                      >
                        <Eye size={18} />
                        Ver
                      </button>
                      <button 
                        onClick={() => handleSaveRecipe(recipe)}
                        className="py-2.5 bg-sage-600 text-white rounded-xl font-hand font-bold flex items-center justify-center gap-2 hover:bg-sage-700 text-lg shadow-md transition-colors"
                      >
                        <Save size={18} />
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Almost Recipes */}
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-4 px-2">
                  <ShoppingCart className="text-rose-400" size={20} />
                  <h3 className="text-xl font-hand font-bold text-stone-700">Ideias Extras (Falta pouco!)</h3>
               </div>
               <div className="grid md:grid-cols-3 gap-6">
                  {result.almostRecipes.map((suggestion, idx) => (
                    <div key={idx} className="bg-white border border-rose-100 rounded-2xl p-5 flex flex-col shadow-sm">
                      <h4 className="text-lg font-hand font-bold text-stone-800 mb-1">{suggestion.title}</h4>
                      <p className="text-xs text-stone-500 mb-3 line-clamp-2">{suggestion.description}</p>
                      
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {suggestion.missingIngredients.map((ing, i) => (
                            <span key={i} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-bold border border-rose-100">
                              + {ing}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => handleAddMissingToShopping(suggestion.missingIngredients)}
                          className="w-full py-2 text-rose-600 font-hand font-bold hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-rose-200 text-sm"
                        >
                          <Plus size={14} />
                          Add Compras
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

             {/* Detected Summary */}
             <div className="bg-stone-100/50 rounded-2xl p-4 border border-stone-200">
                <p className="text-xs font-bold uppercase text-stone-400 mb-2 tracking-wider">Baseado nos ingredientes:</p>
                <div className="flex flex-wrap gap-2">
                  {result.fridgeItems.map((item, i) => (
                    <span key={i} className="text-sm bg-white text-stone-600 px-2 py-1 rounded border border-stone-200 font-hand">{item.name}</span>
                  ))}
                </div>
             </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in z-40 whitespace-nowrap">
          <AlertCircle size={20} />
          <span className="font-bold font-hand">{error}</span>
        </div>
      )}

      {/* Recipe Detail Modal */}
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

export default FridgeAnalysis;