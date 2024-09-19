"use client";

import EditarUsuarioPerfil from "@/app/components/EditarUsuarioPerfil";
import { useParams } from "next/navigation";

// ProfilePage.tsx
const ProfilePage: React.FC = () => {
  const { id } = useParams() as { id: string | string[] };

  const userId = Array.isArray(id) ? id[0] : id;

  if (!userId) {
    return <div>Carregando...</div>;
  }

  return <EditarUsuarioPerfil id={userId} />;
};

export default ProfilePage;
