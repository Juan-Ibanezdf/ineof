"use client";

import React, { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import Image from "next/image";

import IneofLogo from "../../../../public/INEOFLogo.svg";
import Layout from "@/app/components/Layout";
// Definir tipos para os estados e cidades
interface Country {
  id: string;
  nome: string;
  sigla: string;
}

interface State {
  id: string;
  nome: string;
  sigla: string;
}

interface City {
  id: string;
  nome: string;
}

export default function Register() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // // Busca países
  // useEffect(() => {
  //   async function fetchCountries() {
  //     try {
  //       const response = await axios.get(
  //         "https://servicodados.ibge.gov.br/api/v1/localidades/paises",
  //         {
  //           params: { orderBy: "nome", lang: "EN" },
  //         }
  //       );
  //       setCountries(
  //         response.data.map((country: { id: string; nome: string }) => ({
  //           id: country.id,
  //           nome: country.nome,
  //           sigla: "",
  //         }))
  //       );
  //     } catch (error) {
  //       console.error("Error fetching countries:", error);
  //     }
  //   }
  //   fetchCountries();
  // }, []);
// Busca países
useEffect(() => {
  async function fetchCountries() {
    try {
      const response = await axios.get(
        "https://servicodados.ibge.gov.br/api/v1/localidades/paises",
        {
          params: { orderBy: "nome", lang: "PT" },
        }
      );
      
      // Mapeia os países
      const countries = response.data.map((country: { id: string; nome: string }) => ({
        id: country.id,
        nome: country.nome,
        sigla: "",
      }));

      // Encontra o país "Brasil" (verifica pelo nome ou id correspondente)
      const brasilIndex = countries.findIndex((country: { nome: string; }) => country.nome === "Brasil");

      if (brasilIndex !== -1) {
        // Remove o Brasil da lista e coloca no início
        const brasil = countries.splice(brasilIndex, 1)[0];
        countries.unshift(brasil); // Adiciona Brasil no início
      }

      setCountries(countries); // Define a lista de países com o Brasil no topo
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }
  fetchCountries();
}, []);

  // Busca estados
  useEffect(() => {
    async function fetchStates() {
      if (selectedCountry?.nome === "Brasil") {
        try {
          const response = await axios.get(
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
          );
          setStates(
            response.data.map((state: State) => ({
              id: state.id,
              nome: state.nome,
              sigla: state.sigla,
            }))
          );
        } catch (error) {
          console.error("Error fetching states:", error);
        }
      } else {
        setStates([]);
        setSelectedState(null); // Limpar o estado quando não for Brasil
      }
    }
    fetchStates();
  }, [selectedCountry]);

  // Busca cidades
  useEffect(() => {
    const fetchCities = async () => {
      if (selectedState?.sigla) {
        try {
          const response = await axios.get(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState.sigla}/municipios`
          );
          setCities(
            response.data.map((city: City) => ({
              id: city.id,
              nome: city.nome,
            }))
          );
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [selectedState]);

  // Tratamento do registro
  async function handleRegister(data: FieldValues) {
    const instituicao =
      data.instituicao.trim() === "" ? "Não Afiliado" : data.instituicao;
    const userData = {
      ...data,
      instituicao,
      pais: selectedCountry?.nome || "",
      estado: selectedState?.nome || "",
      cidade: selectedCity?.nome || "",
    };

    try {
      await axios.post("http://localhost:8080/api/auth/register", userData);
      setRegistrationSuccess(true);
      reset(); // Redefine o formulário após o envio bem-sucedido
    } catch (error: unknown) {
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.data.errors
      ) {
        // Se existirem erros de validação enviados pelo servidor, defina-os no formulário
        error.response.data.errors.forEach((err: any) => {
          setError(err.property, {
            type: "manual",
            message: err.message || "Erro de validação",
          });
        });
      } else {
        setError("registrationFailed", {
          type: "manual",
          message: "Erro desconhecido durante o registro.",
        });
      }
    }
  }

  if (registrationSuccess) {
    return (
      <>
        <Layout>
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Registro efetuado com sucesso!
            </h2>
            <p className="mt-2 text-center text-md text-gray-600">
              Por favor,{" "}
              <Link href="/auth/login">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  faça login
                </span>
              </Link>
              .
            </p>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Layout>
        <div className="min-h-80 flex items-center justify-center bg-gray-50  px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <Image
              className="h-32 w-52 "
              src={IneofLogo} // Corrigido o uso da imagem importada
              alt="Logo INEOF"
              width={40} // Ajuste para o tamanho desejado
              height={40} // Ajuste para o tamanho desejado
            />
            <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-900">
              CADASTRE-SE
            </h2>

            <form
              className="mt-8 space-y-6 mb-8"
              onSubmit={handleSubmit(handleRegister)}
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="nomeDeUsuario" className="sr-only">
                    Nome de Usuário
                  </label>
                  <input
                    {...register("nomeDeUsuario")}
                    id="nomeDeUsuario"
                    name="nomeDeUsuario"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Seu nome de usuário"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  Endereço de e-mail
                </label>
                <input
                  {...register("email")}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Seu endereço de e-mail"
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
                  placeholder="Sua senha"
                />
              </div>

              <div className="rounded-md shadow-sm -space-y-px">
                <div className="flex items-center gap-5">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    País:
                  </label>
                  <select
                    id="country"
                    name="country"
                    onChange={(e) =>
                      setSelectedCountry(JSON.parse(e.target.value))
                    }
                    value={
                      selectedCountry ? JSON.stringify(selectedCountry) : ""
                    }
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione um país</option>
                    {countries.map((country) => (
                      <option
                        key={country.nome}
                        value={JSON.stringify(country)}
                      >
                        {country.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCountry?.nome === "Brasil" && (
                  <div className="flex items-center gap-5">
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Estado:
                    </label>
                    <select
                      id="state"
                      name="state"
                      onChange={(e) =>
                        setSelectedState(JSON.parse(e.target.value))
                      }
                      value={selectedState ? JSON.stringify(selectedState) : ""}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione um Estado</option>
                      {states.map((state) => (
                        <option key={state.nome} value={JSON.stringify(state)}>
                          {state.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedState?.sigla && (
                  <div className="flex items-center gap-5">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cidade:
                    </label>
                    <select
                      id="city"
                      name="city"
                      onChange={(e) =>
                        setSelectedCity(JSON.parse(e.target.value))
                      }
                      value={selectedCity ? JSON.stringify(selectedCity) : ""}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione uma cidade</option>
                      {cities.map((city) => (
                        <option key={city.nome} value={JSON.stringify(city)}>
                          {city.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center p-2">
                  <label htmlFor="instituicao" className="sr-only">
                    Instituição
                  </label>
                  <div className="flex-col">
                    <input
                      {...register("instituicao")}
                      id="instituicao"
                      name="instituicao"
                      type="text"
                      autoComplete="organization"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Instituição"
                    />
                    <span className="mt-1 text-xs text-gray-600">
                      OBS: Se deixar em branco, será salvo como: Não Afiliado.
                    </span>
                  </div>
                </div>

                <div className="flex items-center p-2">
                  <input
                    type="checkbox"
                    id="termosDeUso"
                    {...register("termosDeUso", { required: true })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="termosDeUso"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Concordo com os{" "}
                    <Link href="/termos-de-uso">
                      <span className="text-indigo-600 hover:text-indigo-500">
                        termos de uso
                      </span>
                    </Link>
                    .
                  </label>
                </div>
              </div>

              {errors.termosDeUso && (
                <p className="mt-2 text-center text-sm text-red-600">
                  Você deve concordar com os termos de uso.
                </p>
              )}

              {errors.registrationFailed && (
                <p className="mt-2 text-center text-sm text-red-600">
                  {typeof errors.registrationFailed.message === "string"
                    ? errors.registrationFailed.message
                    : "Ocorreu um erro durante o registro. Tente novamente mais tarde."}
                </p>
              )}

              <div className="text-sm">
                <span>Já é registrado?&nbsp;</span>
                <Link
                  href="/auth/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Clique aqui!
                </Link>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
