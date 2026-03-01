import type { Metadata } from "next";
import SkillAlchemistPage from "@/components/alchemist/SkillAlchemistPage";

export const metadata: Metadata = {
  title: "Alquimista de Habilidades | Alchemical Agent Ecosystem",
  description:
    "Transmuta tus habilidades en Skills profesionales para el ecosistema alquímico.",
};

export default function AlchemistPage() {
  return <SkillAlchemistPage />;
}
