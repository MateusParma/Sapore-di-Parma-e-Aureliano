import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Recipe, FridgeItem, ShoppingItem, Author, Category, ChefHistoryItem } from '../types';

// Mock Initial Data
const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Bolo de Cenoura da Deborah',
    author: Author.DEBORAH,
    time: '50 min',
    yield: '8 fatias',
    category: Category.DOCE,
    ingredients: [
      '3 cenouras médias',
      '4 ovos',
      '1/2 xícara de óleo',
      '2 xícaras de açúcar',
      '2 xícaras de farinha de trigo',
      '1 colher de sopa de fermento',
      'Cobertura: 1 colher de manteiga, 3 colheres de chocolate em pó, 1 xícara de açúcar'
    ],
    steps: "1. Bata no liquidificador a cenoura, os ovos e o óleo.\n2. Em uma tigela, misture o açúcar e a farinha.\n3. Junte a mistura do liquidificador.\n4. Por último acrescente o fermento.\n5. Asse em forno médio (180°C) por 40 minutos.",
    isFavorite: true,
    imageUrl: 'https://picsum.photos/id/1080/800/600',
    createdAt: Date.now(),
    notes: 'O Rafael gosta com bastante cobertura!'
  },
  {
    id: '2',
    title: 'Risoto de Cogumelos do Mateus',
    author: Author.MATEUS,
    time: '40 min',
    yield: '4 porções',
    category: Category.JANTAR,
    ingredients: [
      '2 xícaras de arroz arbóreo',
      '200g de cogumelos paris',
      '1 cebola picada',
      '1/2 xícara de vinho branco',
      '1 litro de caldo de legumes',
      'Queijo parmesão a gosto',
      'Manteiga gelada'
    ],
    steps: "1. Refogue a cebola e os cogumelos.\n2. Adicione o arroz e refogue um pouco.\n3. Coloque o vinho e espere evaporar.\n4. Vá colocando o caldo aos poucos, mexendo sempre.\n5. Finalize com manteiga gelada e parmesão.",
    isFavorite: false,
    imageUrl: 'https://picsum.photos/id/292/800/600',
    createdAt: Date.now() - 10000
  }
];

interface AppContextType {
  recipes: Recipe[];
  fridgeItems: FridgeItem[];
  shoppingList: ShoppingItem[];
  chefHistory: ChefHistoryItem[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addFridgeItems: (items: FridgeItem[]) => void;
  clearFridge: () => void;
  addToShoppingList: (item: ShoppingItem) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  addChefHistory: (item: ChefHistoryItem) => void;
  getHistoryItem: (id: string) => ChefHistoryItem | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { id: 's1', name: 'Farinha de Trigo', reason: 'Acabou na última receita', checked: false }
  ]);
  const [chefHistory, setChefHistory] = useState<ChefHistoryItem[]>([]);

  const addRecipe = (recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setRecipes(prev => prev.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  };

  const addFridgeItems = (items: FridgeItem[]) => {
    setFridgeItems(prev => [...prev, ...items]);
  };
  
  const clearFridge = () => setFridgeItems([]);

  const addToShoppingList = (item: ShoppingItem) => {
    setShoppingList(prev => [...prev, item]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const addChefHistory = (item: ChefHistoryItem) => {
    setChefHistory(prev => [item, ...prev]);
  };

  const getHistoryItem = (id: string) => {
    return chefHistory.find(h => h.id === id);
  };

  return (
    <AppContext.Provider value={{
      recipes,
      fridgeItems,
      shoppingList,
      chefHistory,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      toggleFavorite,
      addFridgeItems,
      clearFridge,
      addToShoppingList,
      toggleShoppingItem,
      removeShoppingItem,
      addChefHistory,
      getHistoryItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};