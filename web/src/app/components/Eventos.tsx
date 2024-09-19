"use client";
import React, { useState } from 'react';

const Events = () => {
  const [current, setCurrent] = useState(0);
  const events = [
    {
      title: "VI Workshop Energias Oceânicas e Fluviais",
      date: "04 e 05 setembro de 2024",
      location: "Hotel Centro de Convenções, Flamengo, Rio de Janeiro - RJ",
      description: "Contribuindo para a descarbonização da Economia",
      moreInfoLink: "#"
    },
    // Adicione mais eventos conforme necessário
  ];

  const nextEvent = () => {
    setCurrent(current === events.length - 1 ? 0 : current + 1);
  };

  const prevEvent = () => {
    setCurrent(current === 0 ? events.length - 1 : current - 1);
  };

  return (
    <div className="w-full p-10 bg-blue-ineof text-white py-12">
      <div className="w-full mx-auto ">
        <h2 className="text-3xl font-bold text-center mb-6">ACOMPANHE NOSSOS EVENTOS, WORKSHOPS E WEBNÁRIOS</h2>
        <div className="flex items-center justify-between">
          <button onClick={prevEvent} className="text-green-500">&#10094;</button>
          <div className="flex overflow-hidden">
            {events.map((event, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-80 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p>{event.date}</p>
                <p>{event.location}</p>
                <p className="mb-4">{event.description}</p>
                <a href={event.moreInfoLink} className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Saiba mais</a>
              </div>
            ))}
            {events.map((event, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-80 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p>{event.date}</p>
                <p>{event.location}</p>
                <p className="mb-4">{event.description}</p>
                <a href={event.moreInfoLink} className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Saiba mais</a>
              </div>
            ))}
            {events.map((event, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-80 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p>{event.date}</p>
                <p>{event.location}</p>
                <p className="mb-4">{event.description}</p>
                <a href={event.moreInfoLink} className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Saiba mais</a>
              </div>
            ))}
            {events.map((event, index) => (
              <div key={index} className={`transition duration-300 ease-in-out transform ${index === current ? 'scale-100' : 'scale-90 opacity-50'} flex-none w-80 mx-2 p-4 rounded-lg bg-white text-black shadow-lg`}>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p>{event.date}</p>
                <p>{event.location}</p>
                <p className="mb-4">{event.description}</p>
                <a href={event.moreInfoLink} className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Saiba mais</a>
              </div>
            ))}
          </div>
          <button onClick={nextEvent} className="text-green-500">&#10095;</button>
        </div>
      </div>
    </div>
  );
};

export default Events;
