"use client";
import React, { useState } from 'react';

const PublicationsPage = () => {
  const [current, setCurrent] = useState(0);
  const publications = [
    {
      title: "Mean Shift para densificação de dados aplicados a previsão de geração de [...]",
      author: "Hellen Souza",
      category: "SBA",
      type: "Artigo"
    },
    // Adicione mais publicações conforme necessário
  ];

  const nextSlide = () => {
    setCurrent(current === publications.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? publications.length - 1 : current - 1);
  };

  return (
    <div className="bg-blue-ineof text-white p-12">
      <div className="max-w-full mx-auto  p4">
        <h2 className="text-3xl font-bold text-center mb-6">PUBLICAÇÕES</h2>
        <div className="flex items-center justify-between m-2">
          <button onClick={prevSlide} className="text-green-500">
            &#10094;
          </button>
          <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
           <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {publications.map((pub, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-64 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{pub.title}</h3>
                <p className="text-sm">{pub.author}</p>
                <p className="text-xs">{pub.category}</p>
                <p className="text-xs">{pub.type}</p>
              </div>
            ))}
          </div>
          <button onClick={nextSlide} className="text-green-500">
            &#10095;
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PublicationsPage;
