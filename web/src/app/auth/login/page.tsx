"use client"; // Marcar o componente como Client Component

import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Altere para 'next/navigation'

import IneofLogo from "../../../../public/INEOFLogo.svg";
import Layout from "@/app/components/Layout";
// Definindo o tipo dos dados do formulário
interface LoginFormInputs {
  email: string;
  senha: string;
  nomeDeUsuario: string;
  manterConectado: boolean; // Adiciona o campo "manter conectado"
}

export default function Login() {
  const router = useRouter(); // Usar o novo hook de roteamento
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const { signIn } = useContext(AuthContext);

  const handleSignIn: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await signIn(data); // Passa o campo "manterConectado" para o contexto de autenticação
      router.push("/"); // Redireciona para a página inicial após o login bem-sucedido
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Por favor, tente novamente.");
    }
  };

  return (
    <>
      <Layout>
        <div className="flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-sm w-full">
            <div className="flex flex-col items-center my-10">
              <Image
                className="h-32 w-52 "
                src={IneofLogo} // Corrigido o uso da imagem importada
                alt="Logo INEOF"
                width={40} // Ajuste para o tamanho desejado
                height={40} // Ajuste para o tamanho desejado
              />
              <h2 className="text-center text-3xl font-extrabold text-blue-ineof">
                Entrar na sua conta
              </h2>
            </div>

            <form
              className="mt-8 space-y-6 mb-36"
              onSubmit={handleSubmit(handleSignIn)}
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="nomeDeUsuario" className="sr-only">
                    Nome de usuário
                  </label>
                  <input
                    {...register("nomeDeUsuario")}
                    id="nomeDeUsuario"
                    name="nomeDeUsuario"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Nome de Usuário"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">
                    Endereço de E-mail
                  </label>
                  <input
                    {...register("email")}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Endereço de E-mail"
                  />
                </div>

                <div>
                  <label htmlFor="senha" className="sr-only">
                    Senha
                  </label>
                  <input
                    {...register("senha")}
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Senha"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="manterConectado"
                    type="checkbox"
                    {...register("manterConectado")} // Conecta o checkbox ao formulário
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="manterConectado"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Manter-me conectado
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              <div className="text-center">
                <Link href="/auth/register">
                  <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Não possuí conta? Registre-se
                  </span>
                </Link>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  </span>
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
