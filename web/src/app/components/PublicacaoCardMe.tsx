// // components/PublicacaoCardMe.tsx
// import React from "react";
// import { useRouter } from 'next/navigation';

// interface Publicacao {
//   idPublicacao: string;
//   titulo: string;
//   resumo: string;
//   categoria: string;
//   banner: string;
//   palavrasChave: string[];  // Mudança aqui para aceitar array de strings
//   autores: string[];
//   publicacoes: string;
//   revisadoPor: string;
//   slug: string;
//   visibilidade: boolean;
//   identifier: string;
//   link: string | null;
//   dataCriacao: Date;
//   dataModificacao: Date;
//   visualizacoes: number;
// }

// interface PublicacaoCardMeProps {
//   publicacao: Publicacao;
// }

// const PublicacaoCardMe: React.FC<PublicacaoCardMeProps> = ({ publicacao }) => {
//   const router = useRouter();

//   const redirectToPublicacao = () => {
//     router.push(`/perfil/publicacoes/minhas-publicacoes/${publicacao.identifier}/${publicacao.slug}`);
//   };

//   return (
//     <div className="bg-white p-4 shadow-md mb-4">
//       <h3 className="text-lg font-bold text-gray-500">{publicacao.titulo}</h3>
//       <p className="text-gray-500">
//         {publicacao.resumo.length > 50
//           ? `${publicacao.resumo.substring(0, 50)}...`
//           : publicacao.resumo}
//       </p>
//       <button onClick={redirectToPublicacao} className="bg-green-500 text-white p-1 mt-2">
//         Ver Artigo
//       </button>
//     </div>
//   );
// };

// export default PublicacaoCardMe;
