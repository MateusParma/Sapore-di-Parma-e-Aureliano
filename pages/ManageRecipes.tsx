import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Author } from '../types';

const ManageRecipes = () => {
  const { recipes, deleteRecipe } = useApp();
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = recipes.filter(r => filterAuthor === 'all' || r.author === filterAuthor);

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteRecipe(id);
    setConfirmDeleteId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6" onClick={() => setConfirmDeleteId(null)}>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Gerenciar Receitas</h2>
          <p className="text-stone-500">Edite ou remova receitas do livro</p>
        </div>
        <select 
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          className="bg-white border border-stone-200 text-stone-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracotta-200 outline-none"
        >
          <option value="all">Todos os Autores</option>
          {Object.values(Author).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-stone-600">
            <thead className="bg-stone-50 text-stone-400 uppercase text-xs font-semibold tracking-wider border-b border-stone-100">
              <tr>
                <th className="px-6 py-4">Receita</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800">{recipe.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      recipe.author === Author.DEBORAH ? 'bg-rose-100 text-rose-600' :
                      recipe.author === Author.MATEUS ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {recipe.author}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end items-center">
                    {confirmDeleteId === recipe.id ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <span className="text-xs text-red-500 font-bold mr-1">Confirmar?</span>
                        <button 
                          onClick={(e) => confirmDelete(e, recipe.id)}
                          className="inline-flex p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-md"
                          title="Sim, excluir"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={cancelDelete}
                          className="inline-flex p-2 bg-stone-200 text-stone-500 hover:bg-stone-300 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link 
                          to={`/edit/${recipe.id}`}
                          className="inline-flex p-2 text-stone-400 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-colors"
                          title="Editar Receita"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={(e) => initiateDelete(e, recipe.id)}
                          className="inline-flex p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Receita"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-stone-400">
                    Nenhuma receita encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRecipes;