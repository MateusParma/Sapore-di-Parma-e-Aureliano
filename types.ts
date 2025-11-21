export enum Author {
  DEBORAH = 'Deborah',
  MATEUS = 'Mateus',
  FAMILIA = 'Família',
  IA = 'Sugestão da IA'
}

export enum Category {
  DOCE = 'Doce',
  SALGADO = 'Salgado',
  CAFE = 'Café da Manhã',
  LANCHE = 'Lanche',
  JANTAR = 'Jantar',
  FESTA = 'Festa'
}

export type ChefMood = 'economy' | 'fancy';

export interface Recipe {
  id: string;
  title: string;
  author: Author;
  time: string;
  yield: string;
  category: Category;
  ingredients: string[];
  steps: string; // Markdown or plain text
  notes?: string;
  isFavorite: boolean;
  imageUrl?: string;
  createdAt: number;
}

export interface FridgeItem {
  id: string;
  name: string;
  quantity?: string;
  expiryDate?: string; // ISO String YYYY-MM-DD
}

export interface ShoppingItem {
  id: string;
  name: string;
  reason?: string;
  checked: boolean;
}

// New types for AI Analysis

export interface RecipeStep {
  instruction: string;
  tip?: string; // Technical tip for this specific step
}

export interface AiRecipeSuggestion extends Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'author' | 'steps'> {
  // Matches Recipe structure but uses structured steps
  steps: RecipeStep[];
}

export interface AlmostRecipe {
  title: string;
  missingIngredients: string[];
  description: string;
}

export interface SuggestionResult {
  fridgeItems: FridgeItem[];
  fullRecipes: AiRecipeSuggestion[];
  almostRecipes: AlmostRecipe[];
}

export interface ChefHistoryItem {
  id: string;
  date: number;
  images: string[]; // Base64 strings
  prompt?: string; // Optional text request
  result: SuggestionResult;
}