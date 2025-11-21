import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import AddEditRecipe from './pages/AddEditRecipe';
import FridgeAnalysis from './pages/FridgeAnalysis';
import ChefHistoryDetail from './pages/ChefHistoryDetail';
import ShoppingList from './pages/ShoppingList';
import ManageRecipes from './pages/ManageRecipes';
import Help from './pages/Help';
import { AppProvider } from './context/AppContext';

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/add" element={<AddEditRecipe />} />
            <Route path="/edit/:id" element={<AddEditRecipe />} />
            <Route path="/fridge" element={<FridgeAnalysis />} />
            <Route path="/chef-history/:id" element={<ChefHistoryDetail />} />
            <Route path="/shopping" element={<ShoppingList />} />
            <Route path="/manage" element={<ManageRecipes />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;