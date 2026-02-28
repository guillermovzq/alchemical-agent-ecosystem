"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Shield,
  Save,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  settings: {
    id: string;
    label: string;
    type: "toggle" | "select" | "input";
    value: string | boolean;
    options?: string[];
  }[];
}

const initialSettings: SettingSection[] = [
  {
    id: "general",
    title: "General",
    icon: Settings,
    settings: [
      { id: "language", label: "Idioma", type: "select", value: "es", options: ["es", "en"] },
      { id: "theme", label: "Tema Oscuro", type: "toggle", value: true },
    ],
  },
  {
    id: "notifications",
    title: "Notificaciones",
    icon: Bell,
    settings: [
      { id: "push", label: "Notificaciones Push", type: "toggle", value: true },
      { id: "email", label: "Alertas por Email", type: "toggle", value: false },
      { id: "sound", label: "Sonidos", type: "toggle", value: true },
    ],
  },
  {
    id: "security",
    title: "Seguridad",
    icon: Shield,
    settings: [
      { id: "2fa", label: "Autenticación 2FA", type: "toggle", value: false },
      { id: "apikey", label: "API Key", type: "input", value: "sk-••••••••••••" },
    ],
  },
];

export function SettingsPanel() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeSection, setActiveSection] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (sectionId: string, settingId: string, value: string | boolean) => {
    setSettings((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              settings: section.settings.map((s) =>
                s.id === settingId ? { ...s, value } : s
              ),
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const saveSettings = () => {
    toast.success("Configuración guardada");
    setHasChanges(false);
  };

  const currentSection = settings.find((s) => s.id === activeSection);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 border-r border-gold/10 p-4">
          <h2 className="text-sm font-medium text-foreground mb-4 px-2">Configuración</h2>
          <nav className="space-y-1">
            {settings.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-gold/10 text-gold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <currentSection.icon className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-medium text-foreground">
                    {currentSection.title}
                  </h3>
                </div>
                {hasChanges && (
                  <button
                    onClick={saveSettings}
                    className="btn-alchemical-primary flex items-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {currentSection.settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-gold/5"
                  >
                    <span className="text-sm text-foreground">{setting.label}</span>

                    {setting.type === "toggle" && (
                      <button
                        onClick={() =>
                          updateSetting(currentSection.id, setting.id, !setting.value)
                        }
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative",
                          setting.value ? "bg-emerald" : "bg-white/20"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                            setting.value ? "left-6" : "left-1"
                          )}
                        />
                      </button>
                    )}

                    {setting.type === "select" && (
                      <select
                        value={setting.value as string}
                        onChange={(e) =>
                          updateSetting(currentSection.id, setting.id, e.target.value)
                        }
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30"
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt === "es" ? "Español" : "English"}
                          </option>
                        ))}
                      </select>
                    )}

                    {setting.type === "input" && (
                      <input
                        type="text"
                        value={setting.value as string}
                        onChange={(e) =>
                          updateSetting(currentSection.id, setting.id, e.target.value)
                        }
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30 w-48"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
