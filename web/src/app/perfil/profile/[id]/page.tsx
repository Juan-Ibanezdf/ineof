// "use client";

// import Layout from "../../../components/Layout";
// import { getAPIClient } from "@/services/axios";
// import Image from "next/image";
// import defaultAvatar from "../../../../../public/user.svg";
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { parseCookies } from "nookies";
// import axios from "axios";
// import router from "next/router";

// // Definição dos tipos
// interface User {
//   id_usuario: string;
//   nome_de_usuario: string;
//   senha?: string;
//   email: string;
//   nivel_permissao: string;
//   data_criacao: string;
//   data_atualizacao: string;
//   termos_de_uso: boolean;
//   status_ativacao: boolean;
//   email_verificado: boolean;
//   ultimo_login: string;
//   ip_ultimo_login: string;
//   perfilImagem?: string;
//   nome_completo?: string;
//   pais?: string;
//   estado?: string;
//   cidade?: string;
//   ocupacao?: string;
//   descricao?: string;
//   telefone?: string;
//   instituicao?: string;
//   curriculoLattes?: string;
//   matricula?: number;
// }

// const ProfilePage: React.FC = () => {
//   const { register, handleSubmit, setValue } = useForm<User>();
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadedImage, setUploadedImage] = useState<string | null>(null);

//   // Carrega os dados do perfil
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const api = getAPIClient();
//         const response = await api.get(`/api/auth/profile`);
//         setUser(response.data);

//         // Exibe os dados do usuário no console
//         console.log("Dados do usuário carregados:", response.data);

//         // Preenche o formulário com os dados do usuário
//         Object.keys(response.data).forEach((field) =>
//           setValue(field as keyof User, response.data[field])
//         );
//       } catch (error) {
//         setErrorMessage("Erro ao carregar o perfil do usuário.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, [setValue]);

//   // Função para converter a imagem em Base64
//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUploadedImage(reader.result as string);
//         setValue("perfilImagem", reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Suporte para drag and drop
//   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     const file = event.dataTransfer.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUploadedImage(reader.result as string);
//         setValue("perfilImagem", reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const onSubmit = async (formData: User) => {
//     const api = getAPIClient();
//     try {
//       if (formData.matricula && typeof formData.matricula === "string") {
//         formData.matricula = parseInt(formData.matricula, 10);
//       }

//       const cookies = parseCookies();
//       const csrfToken = cookies["csrf_token"];
//       const token = cookies["token"];

//       await api.put(`/api/auth/profile`, formData, {
//         headers: {
//           "X-CSRF-Token": csrfToken,
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       });

//       setSuccessMessage("Perfil atualizado com sucesso!");
//       setIsEditing(false);
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         setErrorMessage(`Erro ao atualizar o perfil: ${error.response?.data}`);
//       } else if (error instanceof Error) {
//         setErrorMessage(`Erro ao atualizar o perfil: ${error.message}`);
//       }
//     }
//   };

//   if (loading) {
//     return <div>Carregando...</div>;
//   }

//   if (errorMessage) {
//     return <div>{errorMessage}</div>;
//   }

//   if (!user) {
//     return <div>Perfil não encontrado.</div>;
//   }

// return (
//   <Layout>
//     <main className="max-w-3xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-semibold mb-6">Perfil do Usuário</h1>
//       {successMessage && (
//         <div className="text-green-600 mb-4">{successMessage}</div>
//       )}

//       {!isEditing ? (
//         <div className="space-y-6">
//           {/* Imagem de Perfil */}
//           <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
//             <span className="block text-sm font-medium text-gray-700">
//               Imagem de Perfil
//             </span>
//             <div className="w-24 h-24 rounded-full overflow-hidden mt-2">
//               <Image
//                 src={uploadedImage || user.perfilImagem || defaultAvatar}
//                 alt="Imagem de Perfil"
//                 className="w-24 h-24 rounded-full"
//                 width={96}
//                 height={96}
//               />
//             </div>
//           </div>
//           {/* Campos de informações do usuário */}
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Nome de Usuário:
//             </span>
//             <p>{user.nome_de_usuario || "Nome de usuário não disponível"}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Email:
//             </span>
//             <p>{user.email}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Nome Completo:
//             </span>
//             <p>{user.nome_completo}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               País:
//             </span>
//             <p>{user.pais}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Estado:
//             </span>
//             <p>{user.estado}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Cidade:
//             </span>
//             <p>{user.cidade}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Email:
//             </span>
//             <p>{user.email}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Ocupação:
//             </span>
//             <p>{user.ocupacao}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Descricao:
//             </span>
//             <p>{user.descricao}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Email:
//             </span>
//             <p>{user.email}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Contato:
//             </span>
//             <p>{user.telefone}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Instituição:
//             </span>
//             <p>{user.instituicao}</p>
//           </div>{" "}
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Currículo Lattes:
//             </span>
//             <p>{user.curriculoLattes}</p>
//           </div>{" "}
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Matrícula:
//             </span>
//             <p>{user.matricula}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Último Login:
//             </span>
//             <p>{user.ultimo_login || "Não disponível"}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               IP do Último Login:
//             </span>
//             <p>{user.ip_ultimo_login || "Não disponível"}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Nível de Permissão:
//             </span>
//             <p>{user.nivel_permissao || "Não disponível"}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Data de Criação:
//             </span>
//             <p>{user.data_criacao}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Data de Atualização:
//             </span>
//             <p>{user.data_atualizacao}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Status de Ativação:
//             </span>
//             <p>{user.status_ativacao ? "Ativo" : "Inativo"}</p>
//           </div>
//           <div>
//             <span className="block text-sm font-medium text-gray-700">
//               Email Verificado:
//             </span>
//             <p>{user.email_verificado ? "Sim" : "Não"}</p>
//           </div>
//           {/* Botão de Editar */}
//           <button
//             onClick={() => setIsEditing(true)}
//             className="py-2 px-4 bg-indigo-600 text-white rounded-md"
//           >
//             Editar Perfil
//           </button>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
//         {/* Input para a imagem de perfil */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Imagem de Perfil</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageUpload}
//             className="block w-full mt-2"
//           />
//         </div>

//         {/* Nome de Usuário */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
//           <input
//             {...register("nome_de_usuario")}
//             placeholder="Nome de Usuário"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Email</label>
//           <input
//             {...register("email")}
//             placeholder="Email"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Nome Completo */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
//           <input
//             {...register("nome_completo")}
//             placeholder="Nome Completo"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* País */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">País</label>
//           <input
//             {...register("pais")}
//             placeholder="País"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Estado */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Estado</label>
//           <input
//             {...register("estado")}
//             placeholder="Estado"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Cidade */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Cidade</label>
//           <input
//             {...register("cidade")}
//             placeholder="Cidade"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Descrição */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Descrição</label>
//           <input
//             {...register("descricao")}
//             placeholder="Descrição"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Telefone */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Telefone</label>
//           <input
//             {...register("telefone")}
//             placeholder="Telefone"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Instituição */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Instituição</label>
//           <input
//             {...register("instituicao")}
//             placeholder="Instituição"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Currículo Lattes */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Currículo Lattes</label>
//           <input
//             {...register("curriculoLattes")}
//             placeholder="Currículo Lattes"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Matrícula */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Matrícula</label>
//           <input
//             {...register("matricula", { valueAsNumber: true })}
//             placeholder="Matrícula"
//             className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {/* Botões Salvar Alterações e Voltar ao Home */}
//         <div className="flex justify-between space-x-4">
//           <button
//             type="submit"
//             className="py-2 px-4 bg-indigo-600 text-white rounded-md w-full"
//           >
//             Salvar Alterações
//           </button>

//           {/* Botão de Voltar ao Home */}
//           <button
//             type="button"
//             onClick={() => router.push('/')}  // Use router.push to navigate to home
//             className="py-2 px-4 bg-gray-600 text-white rounded-md w-full"
//           >
//             Voltar ao Home
//           </button>
//         </div>
//       </form>

//       )}
//     </main>
//   </Layout>
// );
// };

// export default ProfilePage;
"use client";

import Layout from "../../../components/Layout";
import { getAPIClient } from "@/services/axios";
import Image from "next/image";
import defaultAvatar from "../../../../../public/user.svg";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { parseCookies } from "nookies";
import axios from "axios";
import { useRouter } from "next/navigation";

// Definição dos tipos
interface User {
  id_usuario: string;
  nome_de_usuario: string;
  senha?: string;
  email: string;
  nivel_permissao: string;
  data_criacao: string;
  data_atualizacao: string;
  termos_de_uso: boolean;
  status_ativacao: boolean;
  email_verificado: boolean;
  ultimo_login: string;
  ip_ultimo_login: string;
  perfilImagem?: string;
  nome_completo?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  ocupacao?: string;
  descricao?: string;
  telefone?: string;
  instituicao?: string;
  curriculoLattes?: string;
  matricula?: number;
}

const ProfilePage: React.FC = () => {
  const { register, handleSubmit, setValue } = useForm<User>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const router = useRouter();

  // Carrega os dados do perfil
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get(`/api/auth/profile`);
        setUser(response.data);

        // Preenche o formulário com os dados do usuário
        Object.keys(response.data).forEach((field) =>
          setValue(field as keyof User, response.data[field])
        );
      } catch (error) {
        setErrorMessage("Erro ao carregar o perfil do usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [setValue]);

  // Função para converter a imagem em Base64
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setValue("perfilImagem", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: User) => {
    const api = getAPIClient();
    try {
      const cookies = parseCookies();
      const csrfToken = cookies["csrf_token"];
      const token = cookies["token"];

      await api.put(`/api/auth/profile`, formData, {
        headers: {
          "X-CSRF-Token": csrfToken,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setSuccessMessage("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(`Erro ao atualizar o perfil: ${error.response?.data}`);
      } else if (error instanceof Error) {
        setErrorMessage(`Erro ao atualizar o perfil: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (errorMessage) {
    return (
      <div>
        <Layout>
          <div className="container m-4 p-2">
          <h2>{errorMessage}</h2>{" "}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="py-2 px-4 bg-gray-600 text-white rounded-md w-22 mt-2"
          >
            Voltar ao Home
          </button>
          </div>
         
        </Layout>
      </div>
    );
  }

  if (!user) {
    return <div>Perfil não encontrado.</div>;
  }

  return (
    <Layout>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Perfil do Usuário</h1>
        {successMessage ? (
          <div className="space-y-4">
            <div className="text-green-600 text-lg">{successMessage}</div>
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => {
                  setIsEditing(true); // Retorna ao modo de edição
                  setSuccessMessage(null); // Limpa a mensagem de sucesso
                }}
                className="py-2 px-4 bg-indigo-600 text-white rounded-md w-full"
              >
                Continuar Editando
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="py-2 px-4 bg-gray-600 text-white rounded-md w-full"
              >
                Voltar ao Home
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Input para a imagem de perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagem de Perfil
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full mt-2"
              />
            </div>

            {/* Nome de Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome de Usuário
              </label>
              <input
                {...register("nome_de_usuario")}
                placeholder="Nome de Usuário"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register("email")}
                placeholder="Email"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                {...register("nome_completo")}
                placeholder="Nome Completo"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                País
              </label>
              <input
                {...register("pais")}
                placeholder="País"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <input
                {...register("estado")}
                placeholder="Estado"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <input
                {...register("cidade")}
                placeholder="Cidade"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <input
                {...register("descricao")}
                placeholder="Descrição"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                {...register("telefone")}
                placeholder="Telefone"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Instituição */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instituição
              </label>
              <input
                {...register("instituicao")}
                placeholder="Instituição"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Currículo Lattes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currículo Lattes
              </label>
              <input
                {...register("curriculoLattes")}
                placeholder="Currículo Lattes"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Matrícula
              </label>
              <input
                {...register("matricula", { valueAsNumber: true })}
                placeholder="Matrícula"
                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Botões Salvar Alterações e Cancelar */}
            <div className="flex justify-between space-x-4">
              <button
                type="submit"
                className="py-2 px-4 bg-indigo-600 text-white rounded-md w-full"
              >
                Salvar Alterações
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)} // Sai do modo de edição
                className="py-2 px-4 bg-gray-600 text-white rounded-md w-full"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Imagem de Perfil */}
  <div className="md:col-span-2">
    <span className="block text-sm font-medium text-gray-700">Imagem de Perfil</span>
    <div className="w-24 h-24 rounded-full overflow-hidden mt-2">
      <Image
        src={uploadedImage || user.perfilImagem || defaultAvatar}
        alt="Imagem de Perfil"
        className="w-24 h-24 rounded-full"
        width={96}
        height={96}
      />
    </div>
  </div>

  {/* Nome de Usuário */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Nome de Usuário:</span>
    <p>{user.nome_de_usuario}</p>
  </div>

  {/* Email */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Email:</span>
    <p>{user.email}</p>
  </div>

  {/* Nome Completo */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Nome Completo:</span>
    <p>{user.nome_completo || "Não disponível"}</p>
  </div>

  {/* País */}
  <div>
    <span className="block text-sm font-medium text-gray-700">País:</span>
    <p>{user.pais || "Não disponível"}</p>
  </div>

  {/* Estado */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Estado:</span>
    <p>{user.estado || "Não disponível"}</p>
  </div>

  {/* Cidade */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Cidade:</span>
    <p>{user.cidade || "Não disponível"}</p>
  </div>

  {/* Ocupação */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Ocupação:</span>
    <p>{user.ocupacao || "Não disponível"}</p>
  </div>

  {/* Descrição */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Descrição:</span>
    <p>{user.descricao || "Não disponível"}</p>
  </div>

  {/* Telefone */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Telefone:</span>
    <p>{user.telefone || "Não disponível"}</p>
  </div>

  {/* Instituição */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Instituição:</span>
    <p>{user.instituicao || "Não disponível"}</p>
  </div>

  {/* Currículo Lattes */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Currículo Lattes:</span>
    <p>{user.curriculoLattes || "Não disponível"}</p>
  </div>

  {/* Matrícula */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Matrícula:</span>
    <p>{user.matricula || "Não disponível"}</p>
  </div>

  {/* Último Login */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Último Login:</span>
    <p>{user.ultimo_login || "Não disponível"}</p>
  </div>

  {/* IP do Último Login */}
  <div>
    <span className="block text-sm font-medium text-gray-700">IP do Último Login:</span>
    <p>{user.ip_ultimo_login || "Não disponível"}</p>
  </div>

  {/* Nível de Permissão */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Nível de Permissão:</span>
    <p>{user.nivel_permissao || "Não disponível"}</p>
  </div>

  {/* Data de Criação */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Data de Criação:</span>
    <p>{user.data_criacao}</p>
  </div>

  {/* Data de Atualização */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Data de Atualização:</span>
    <p>{user.data_atualizacao}</p>
  </div>

  {/* Status de Ativação */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Status de Ativação:</span>
    <p>{user.status_ativacao ? "Ativo" : "Inativo"}</p>
  </div>

  {/* Email Verificado */}
  <div>
    <span className="block text-sm font-medium text-gray-700">Email Verificado:</span>
    <p>{user.email_verificado ? "Sim" : "Não"}</p>
  </div>

  {/* Botão de Editar */}
  <div className="md:col-span-2">
    <button
      onClick={() => setIsEditing(true)}
      className="py-2 px-4 bg-indigo-600 text-white rounded-md"
    >
      Editar Perfil
    </button>
  </div>
</div>

        )}
      </main>
    </Layout>
  );
};

export default ProfilePage;
