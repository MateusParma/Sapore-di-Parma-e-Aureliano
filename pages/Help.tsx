import React from 'react';
import { HelpCircle, Camera, BookOpen, Edit3 } from 'lucide-react';

const Help = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-hand font-bold text-stone-800">Como usar o app?</h2>
        <p className="text-stone-500">Dicas rápidas para aproveitar a Cozinha dos Aureliano</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-5">
          <div className="bg-terracotta-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-terracotta-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-800 mb-2">Adicionando Receitas</h3>
            <p className="text-stone-600 leading-relaxed">
              Toque no botão "+" na tela inicial. Preencha o nome, tempo e ingredientes. 
              Não esqueça de dizer se é receita da Deborah ou do Mateus! 
              Você pode adicionar uma foto colando o link da imagem.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-5">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
            <Camera size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-800 mb-2">Análise de Geladeira (IA)</h3>
            <p className="text-stone-600 leading-relaxed mb-3">
              A nossa Inteligência Artificial ajuda a descobrir o que cozinhar.
            </p>
            <ul className="list-disc list-inside text-stone-500 space-y-1 text-sm">
              <li>Tire foto das prateleiras abertas.</li>
              <li>Evite objetos escondidos atrás de outros.</li>
              <li>A IA sugere receitas baseadas no que ela vê.</li>
            </ul>
            <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800">
              <strong>Atenção:</strong> A IA não verifica a validade real. Cheque sempre o cheiro e a aparência dos alimentos.
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-5">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-green-600">
            <Edit3 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-800 mb-2">Lista de Compras</h3>
            <p className="text-stone-600 leading-relaxed">
              Quando a IA sugerir uma receita e faltar algo, ou quando você notar que o leite acabou, adicione na aba "Compras". 
              Você pode marcar os itens conforme coloca no carrinho do mercado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;