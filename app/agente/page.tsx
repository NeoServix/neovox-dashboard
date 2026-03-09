"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function TerminalAgente() {
  const router = useRouter();
  const [agente, setAgente] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const agentId = localStorage.getItem("neovox_agent_id");
    if (!agentId) {
      router.push("/login");
      return;
    }

    async function cargarDatos() {
      const { data, error } = await supabase
        .from("agents")
        .select("id, full_name, is_receiving_calls")
        .eq("id", agentId)
        .single();

      if (!error && data) {
        setAgente(data);
      } else {
        router.push("/login");
      }
      setCargando(false);
    }

    cargarDatos();
  }, [router]);

  async function alternarEstado() {
    if (!agente) return;
    
    const nuevoEstado = !agente.is_receiving_calls;
    
    // Actualizamos la interfaz al instante para evitar latencia visual
    setAgente({ ...agente, is_receiving_calls: nuevoEstado });

    // Enviamos la orden de corte al búnker
    await supabase
      .from("agents")
      .update({ is_receiving_calls: nuevoEstado })
      .eq("id", agente.id);
  }

  function cerrarSesion() {
    localStorage.removeItem("neovox_agent_id");
    router.push("/login");
  }

  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs">Conectando terminal...</div>;

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-between p-6 font-sans select-none relative selection:bg-[#00A8E8] selection:text-white overflow-hidden">
      
      {/* Resplandor de fondo general */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#00A8E8]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Cabecera Cristal */}
      <div className="w-full max-w-md mx-auto flex justify-between items-center bg-[#121212]/80 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-lg relative z-10 mt-4">
        <div>
          <p className="text-[10px] text-[#00A8E8] font-bold uppercase tracking-widest mb-1">Operador en línea</p>
          <h1 className="text-base font-bold text-white">{agente.full_name}</h1>
        </div>
        <button onClick={cerrarSesion} className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20 active:bg-red-500/30 hover:bg-red-500/20 transition-colors shadow-sm">
          Desconectar
        </button>
      </div>

      {/* Botón Central */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        <button
          onClick={alternarEstado}
          className={`relative w-72 h-72 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 backdrop-blur-md ${
            agente.is_receiving_calls 
              ? "bg-[#00A8E8]/10 border-4 border-[#00A8E8] text-white shadow-[0_0_80px_rgba(0,168,232,0.4)]" 
              : "bg-[#121212]/80 border-4 border-white/5 text-gray-500 shadow-inner"
          }`}
        >
          <span className={`text-5xl font-black tracking-tight mb-3 ${agente.is_receiving_calls ? "text-[#00A8E8] drop-shadow-[0_0_10px_rgba(0,168,232,0.8)]" : "text-gray-600"}`}>
            {agente.is_receiving_calls ? "ACTIVO" : "PAUSADO"}
          </span>
          <span className={`text-xs font-mono uppercase tracking-widest ${agente.is_receiving_calls ? "text-[#00A8E8]/80" : "text-gray-600"}`}>
            {agente.is_receiving_calls ? "Recibiendo tráfico" : "Línea cortada"}
          </span>
        </button>
      </div>

      <div className="w-full text-center mb-8 relative z-10">
        <p className="text-[10px] text-[#00A8E8]/40 font-mono tracking-widest uppercase">NeoVox Secure Routing</p>
      </div>
    </main>
  );
}