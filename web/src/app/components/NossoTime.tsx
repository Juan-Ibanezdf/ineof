"use client";
import React, { useState } from "react";
import Image from "next/image";
import img1 from "../../../public/user.svg";

const Team = () => {
  const [current, setCurrent] = useState(0);
  const teamMembers = [
    {
      name: "Juan Ibanez",
      role: "Engenheiro de Software",
      image: img1, // Directly use the imported image
      moreInfoLink: "#",
    },
    {
      name: "Hellen Souza",
      role: "Engenheira de Produção",
      image: img1,
      moreInfoLink: "#",
    },
    {
      name: "Nerval de Jesus",
      role: "Engenheiro da Computação",
      image: img1,
      moreInfoLink: "#",
    },
    {
      name: "Isabelle Oliveira",
      role: "Graduanda em Eng. Elétrica",
      image: img1,
      moreInfoLink: "#",
    },
    // Adicione mais membros conforme necessário
  ];

  const nextMember = () => {
    setCurrent(current === teamMembers.length - 1 ? 0 : current + 1);
  };

  const prevMember = () => {
    setCurrent(current === 0 ? teamMembers.length - 1 : current - 1);
  };

  return (
    <div className="w-full p-10 bg-white py-12">
      <div className="w-full mx-auto px-4">
        <div>
          <h2 className="text-3xl font-bold text-center ">NOSSO TIME</h2>
          <div className="flex items-center justify-between"></div>

          <button onClick={prevMember} className="text-green-500">
            &#10094;
          </button>
          <div className="flex overflow-hidden">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`transition duration-300 ease-in-out transform ${
                  index === current ? "scale-100" : "scale-90 opacity-50"
                } flex-none w-64 mx-2 p-4 rounded-lg bg-green-100 text-black shadow-lg`}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                  width={96}
                  height={96}
                />
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm">{member.role}</p>
                <a
                  href={member.moreInfoLink}
                  className="mt-4 inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Saiba mais
                </a>
              </div>
            ))}
          </div>
          <button onClick={nextMember} className="text-green-500">
            &#10095;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Team;
