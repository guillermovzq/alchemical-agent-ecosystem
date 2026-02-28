"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  X,
  Users,
  Settings,
  Zap,
  GitBranch,
  FileText,
  ChevronDown,
  ChevronUp,
  Bot,
  Sparkles,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useChatStore } from "../lib/stores";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  ts?: string;
  kind?: "human" | "agent" | "system";
}

export function ChatWorkbench() {
  const {
    inputText,
    setInputText,
    selectedAgent,
    setSelectedAgent,
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    thinkingMode,
    setThinkingMode,
    autoEdit,
    setAutoEdit,
    repo,
    setRepo,
    roundtableAgents,
    setRoundtableAgents,
    roundtableRounds,
    setRoundtableRounds,
    connectionStatus,
    setConnectionStatus,
    showAdvanced,
    toggleAdvanced,
    isStreaming,
    setIsStreaming,
  } = useChatStore();

  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  // Fetch capabilities
  useEffect(() => {
    fetch("/api/gateway/capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setAvailableAgents(data.agents || []);
        setAvailableSkills(data.skills || []);
        setAvailableTools(data.tools || []);
        if (data.agents?.length && !selectedAgent) {
          setSelectedAgent(data.agents[0]);
        }
      })
      .catch(console.error);
  }, []);

  // Connect to SSE
  const connectStream = () => {
    if (esRef.current) esRef.current.close();
    setConnectionStatus("connecting");

    const es = new EventSource("/api/gateway/chat-stream");
    esRef.current = es;

    es.onopen = () => setConnectionStatus("connected");
    es.onerror = () => setConnectionStatus("disconnected");
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setThread(payload.items || []);
      } catch {
        // ignore
      }
    };
  };

  const disconnectStream = () => {
    esRef.current?.close();
    esRef.current = null;
    setConnectionStatus("disconnected");
  };

  useEffect(() => {
    connectStream();
    return () => disconnectStream();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setIsStreaming(true);
    toast.info(`Enviando a ${selectedAgent}...`);

    try {
      const res = await fetch("/api/gateway/chat-ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent: selectedAgent,
          text: inputText,
          action: "query",
          repo,
          thinking: thinkingMode,
          auto_edit: autoEdit,
          attachments: attachments.map((a) => ({
            name: a.name,
            content: a.content,
          })),
        }),
      });

      if (res.ok) {
        toast.success(`Respuesta recibida de ${selectedAgent}`);
        setInputText("");
        clearAttachments();
      } else {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        toast.error(error.error || "Error al enviar mensaje");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (attachments.length >= 8) {
        toast.warning("Máximo 8 adjuntos permitidos");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = (ev.target?.result as string) || "";
        addAttachment({
          name: file.name,
          sizeKb: Math.ceil(file.size / 1024),
          content,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-3 h-3 text-emerald" />;
      case "connecting":
        return <Loader2 className="w-3 h-3 text-amber animate-spin" />;
      default:
        return <WifiOff className="w-3 h-3 text-rose" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-emerald";
      case "connecting":
        return "text-amber";
      default:
        return "text-rose";
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Messages Area */}
      <div className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gold/10">
              <Bot className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Chat del Caldero</h3>
              <div className="flex items-center gap-1.5">
                {getStatusIcon()}
                <span className={cn("text-xs", getStatusColor())}>
                  {connectionStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={connectionStatus === "connected" ? disconnectStream : connectStream}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                connectionStatus === "connected"
                  ? "bg-rose/10 text-rose hover:bg-rose/20"
                  : "bg-emerald/10 text-emerald hover:bg-emerald/20"
              )}
            >
              {connectionStatus === "connected" ? "Desconectar" : "Conectar"}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {thread.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Sparkles className="w-12 h-12 mb-4 text-gold/30" />
              <p className="text-sm">Sin mensajes todavía</p>
              <p className="text-xs mt-1">Comienza una conversación con los agentes</p>
            </div>
          ) : (
            thread.map((msg, idx) => (
              <motion.div
                key={`${idx}-${msg.ts}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 p-3 rounded-xl",
                  msg.kind === "agent"
                    ? "bg-turq/5 border border-turq/20"
                    : msg.kind === "system"
                    ? "bg-purple/5 border border-purple/20"
                    : "bg-gold/5 border border-gold/20"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    msg.kind === "agent"
                      ? "bg-turq/20 text-turq"
                      : msg.kind === "system"
                      ? "bg-purple/20 text-purple"
                      : "bg-gold/20 text-gold"
                  )}
                >
                  {msg.kind === "agent" ? (
                    <Bot className="w-4 h-4" />
                  ) : msg.kind === "system" ? (
                    <Zap className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">U</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        msg.kind === "agent"
                          ? "text-turq"
                          : msg.kind === "system"
                          ? "text-purple"
                          : "text-gold"
                      )}
                    >
                      {msg.sender}
                    </span>
                    {msg.ts && (
                      <span className="text-[10px] text-muted-foreground">{msg.ts}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gold/10 space-y-3">
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gold/10 border border-gold/20 text-xs"
                >
                  <FileText className="w-3 h-3 text-gold" />
                  <span className="text-foreground">{att.name}</span>
                  <span className="text-muted-foreground">({att.sizeKb}KB)</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="p-0.5 hover:bg-gold/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-3">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-gold/10 text-sm text-foreground focus:outline-none focus:border-gold/30"
            >
              {availableAgents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribe tu mensaje..."
                disabled={isStreaming}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-gold/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/30 pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isStreaming}
              className={cn(
                "px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all",
                inputText.trim() && !isStreaming
                  ? "bg-gradient-to-r from-gold to-gold-dark text-void hover:shadow-lg hover:shadow-gold/20"
                  : "bg-white/5 text-muted-foreground cursor-not-allowed"
              )}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar
            </button>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={toggleAdvanced}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            Opciones avanzadas
          </button>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-gold/10 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Repo */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Repositorio
                      </label>
                      <input
                        type="text"
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        placeholder="owner/repo"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/5 border border-gold/10 text-xs text-foreground focus:outline-none focus:border-gold/30"
                      />
                    </div>

                    {/* Thinking Mode */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Thinking
                      </label>
                      <select
                        value={thinkingMode}
                        onChange={(e) =>
                          setThinkingMode(e.target.value as "low" | "balanced" | "deep")
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/5 border border-gold/10 text-xs text-foreground focus:outline-none focus:border-gold/30"
                      >
                        <option value="low">Low</option>
                        <option value="balanced">Balanced</option>
                        <option value="deep">Deep</option>
                      </select>
                    </div>

                    {/* Auto Edit */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Auto Edit
                      </label>
                      <div className="mt-2">
                        <button
                          onClick={() => setAutoEdit(!autoEdit)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            autoEdit
                              ? "bg-emerald/20 text-emerald"
                              : "bg-white/5 text-muted-foreground"
                          )}
                        >
                          {autoEdit ? "Activado" : "Desactivado"}
                        </button>
                      </div>
                    </div>

                    {/* Rounds */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Rounds
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={roundtableRounds}
                        onChange={(e) => setRoundtableRounds(parseInt(e.target.value) || 1)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/5 border border-gold/10 text-xs text-foreground focus:outline-none focus:border-gold/30"
                      />
                    </div>
                  </div>

                  {/* Roundtable Agents */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Agentes Roundtable
                    </label>
                    <input
                      type="text"
                      value={roundtableAgents.join(", ")}
                      onChange={(e) => setRoundtableAgents(e.target.value.split(",").map((s) => s.trim()))}
                      placeholder="agent1, agent2, agent3"
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/5 border border-gold/10 text-xs text-foreground focus:outline-none focus:border-gold/30"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
