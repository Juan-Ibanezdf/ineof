"use client";
import React, { useState } from 'react';

const News = () => {
  const [current, setCurrent] = useState(0);
  const newsItems = [
    {
      title: "Título da Notícia 1",
      description: "Breve descrição da notícia 1 com mais detalhes...",
      category: "Categoria",
      date: "Data de Publicação"
    },
    // Adicione mais notícias conforme necessário
  ];

  const nextNews = () => {
    setCurrent(current === newsItems.length - 1 ? 0 : current + 1);
  };

  const prevNews = () => {
    setCurrent(current === 0 ? newsItems.length - 1 : current - 1);
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">NOTÍCIAS</h2>
        <div className="flex items-center justify-between">
          <button onClick={prevNews} className="text-gray-800">
            &#10094;
          </button>
          <div className="flex overflow-hidden">
            {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}
              {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}  {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}
              {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}
              {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}
              {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}  {newsItems.map((item, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-gray-100 text-gray-800 shadow-lg`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs">{item.category} - {item.date}</p>
              </div>
              
            ))}
          </div>
          <button onClick={nextNews} className="text-gray-800">
            &#10095;
          </button>
        </div>
        
        
      </div>
    </div>
  );
};

export default News;
