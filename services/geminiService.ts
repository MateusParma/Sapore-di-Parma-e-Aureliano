import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FridgeItem, SuggestionResult, Category, Author, AiRecipeSuggestion, ChefMood } from '../types';

// Schema for just identifying items
const ingredientsDetectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    identifiedItems: {
      type: Type.ARRAY,
      description: "List of food ingredients identified in the images.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the ingredient in Portuguese" },
          quantity: { type: Type.STRING, description: "Estimated quantity (optional)" },
        },
        required: ["name"]
      }
    }
  },
  required: ["identifiedItems"]
};

// Schema for recipe generation based on list
const recipesFromListSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullRecipes: {
      type: Type.ARRAY,
      description: "3 complete recipes based on the provided ingredients list.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          time: { type: Type.STRING, description: "e.g. '30 min'" },
          yield: { type: Type.STRING, description: "e.g. '2 pessoas'" },
          category: { type: Type.STRING, enum: ["Doce", "Salgado", "Café da Manhã", "Lanche", "Jantar", "Festa"] },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { 
            type: Type.ARRAY, 
            description: "Detailed preparation steps",
            items: {
              type: Type.OBJECT,
              properties: {
                instruction: { type: Type.STRING, description: "The main instruction for this step." },
                tip: { type: Type.STRING, description: "Optional warm home-cooking tip (e.g., 'Grandma's secret')." }
              },
              required: ["instruction"]
            }
          },
          notes: { type: Type.STRING, description: "Why this recipe is perfect for a family meal." }
        },
        required: ["title", "time", "ingredients", "steps"]
      }
    },
    almostRecipes: {
      type: Type.ARRAY,
      description: "3 recipes that fit the theme but might need extra ingredients.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The missing items" },
          description: { type: Type.STRING, description: "Short description" }
        },
        required: ["title", "missingIngredients", "description"]
      }
    }
  },
  required: ["fullRecipes", "almostRecipes"]
};

const singleRecipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    time: { type: Type.STRING },
    yield: { type: Type.STRING },
    category: { type: Type.STRING, enum: ["Doce", "Salgado", "Café da Manhã", "Lanche", "Jantar", "Festa"] },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: { 
      type: Type.ARRAY, 
      items: {
        type: Type.OBJECT,
        properties: {
          instruction: { type: Type.STRING },
          tip: { type: Type.STRING }
        },
        required: ["instruction"]
      }
    },
    notes: { type: Type.STRING }
  },
  required: ["title", "ingredients", "steps", "time", "yield"]
};

// 1. First Step: Detect Ingredients
export const detectIngredients = async (base64Images: string[]): Promise<FridgeItem[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key Required");

  const ai = new GoogleGenAI({ apiKey });
  
  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        ...imageParts,
        {
          text: `Analise as imagens (geladeira, despensa, armários).
          Liste TODOS os ingredientes alimentícios identificáveis.
          Se houver potes, tente inferir o conteúdo ou liste "Pote misterioso".
          Responda estritamente no JSON Schema.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ingredientsDetectionSchema,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  const result = JSON.parse(text);
  
  return result.identifiedItems.map((item: any, index: number) => ({
    id: `detected-${Date.now()}-${index}`,
    name: item.name,
    quantity: item.quantity || '1 un',
    expiryDate: ''
  }));
};

// 2. Second Step: Generate Recipes from validated list
export const generateRecipesFromIngredients = async (ingredients: string[], mood: ChefMood): Promise<SuggestionResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key Required");

  const ai = new GoogleGenAI({ apiKey });

  const moodInstruction = mood === 'fancy' 
    ? "OCASIÃO: Jantar Especial/Sofisticado. Sugira receitas que pareçam chiques, mesmo com ingredientes simples. Use termos mais elegantes."
    : "OCASIÃO: Dia a Dia/Econômico. Foque em praticidade, render bastante e evitar desperdício. Receitas reconfortantes e simples.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      text: `Você é um Chef de Família experiente.
      
      INGREDIENTES DISPONÍVEIS: ${ingredients.join(', ')}.
      
      ${moodInstruction}

      1. Crie 3 receitas COMPLETAS priorizando o uso dos ingredientes disponíveis.
         - TOM: Afetivo, "Livro de Receitas da Vovó".
         - MODO DE PREPARO: Detalhado.
         - DICAS: Segredinhos de cozinha.
      2. Sugira 3 receitas "QUASE LÁ" (que precisem de 1 ou 2 ingredientes extras).
      
      Responda estritamente no JSON Schema.`
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: recipesFromListSchema,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate recipes");
  
  const result = JSON.parse(text);
  
  // Reuse existing mapping structure, but we don't get detected items here, we used passed ones
  const fullRecipes = result.fullRecipes.map((r: any) => ({
    ...r,
    author: Author.IA, 
    isFavorite: false,
  }));

  return {
    fridgeItems: [], // We handle this in the UI state now
    fullRecipes: fullRecipes,
    almostRecipes: result.almostRecipes
  };
};

// Legacy/Direct Text Mode
export const createChefRecipe = async (userRequest: string, mood: ChefMood = 'economy'): Promise<SuggestionResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key Required");

  const ai = new GoogleGenAI({ apiKey });

  const moodInstruction = mood === 'fancy' 
      ? "OCASIÃO: Jantar Especial/Sofisticado. O usuário quer impressionar."
      : "OCASIÃO: Dia a Dia/Econômico. O usuário quer algo prático e barato.";

  // Using a wider schema here to verify if text input has ingredients to identify
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      text: `Você é um Chef de Família carinhoso.
      Pedido da família Aureliano: "${userRequest}"
      
      ${moodInstruction}
      
      Crie 3 receitas DELICIOSAS e CASEIRAS.
      Se o usuário listou ingredientes no texto, extraia-os para a lista de itens identificados.
      
      Responda estritamente usando o JSON Schema.`
    },
    config: {
      responseMimeType: "application/json",
      // We need a schema that includes detected items for text input too
      responseSchema: {
        type: Type.OBJECT,
        properties: {
           identifiedItems: ingredientsDetectionSchema.properties!.identifiedItems,
           fullRecipes: recipesFromListSchema.properties!.fullRecipes,
           almostRecipes: recipesFromListSchema.properties!.almostRecipes
        },
        required: ["fullRecipes", "almostRecipes"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate recipe");
  
  const result = JSON.parse(text);

   const items: FridgeItem[] = result.identifiedItems ? result.identifiedItems.map((item: any, index: number) => ({
    id: `text-${Date.now()}-${index}`,
    name: item.name,
    quantity: item.quantity || '',
    expiryDate: ''
  })) : [];

  const fullRecipes = result.fullRecipes.map((r: any) => ({
    ...r,
    author: Author.IA,
    isFavorite: false,
  }));

  return {
    fridgeItems: items,
    fullRecipes: fullRecipes,
    almostRecipes: result.almostRecipes
  };
};

export const generateRecipeFromInput = async (title: string, category: string): Promise<AiRecipeSuggestion> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key Required");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      text: `Crie uma receita caseira e delicada para: "${title}" (${category}).
      
      Estilo: Culinária de família, feita com amor.
      Detalhe bem o passo a passo.
      No campo 'tip' (dica), coloque segredos para o prato ficar especial.
      
      Responda JSON.`
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: singleRecipeSchema
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate recipe");
  return JSON.parse(text) as AiRecipeSuggestion;
};