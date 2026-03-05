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

  if (cargando) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-mono text-xs">Conectando terminal...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between p-6 font-sans select-none">
      <div className="w-full flex justify-between items-center mt-4">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Operador en línea</p>
          <h1 className="text-lg font-bold text-white mt-1">{agente.full_name}</h1>
        </div>
        <button onClick={cerrarSesion} className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-4 py-2 rounded border border-red-500/20 active:bg-red-500/30 transition-colors">
          Desconectar
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <button
          onClick={alternarEstado}
          className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
            agente.is_receiving_calls 
              ? "bg-green-500/10 border-4 border-green-500 text-green-400 shadow-[0_0_60px_rgba(34,197,94,0.15)]" 
              : "bg-red-500/5 border-4 border-red-900 text-red-600"
          }`}
        >
          <span className="text-4xl font-black tracking-tight mb-2">
            {agente.is_receiving_calls ? "ACTIVO" : "PAUSADO"}
          </span>
          <span className="text-xs font-mono opacity-60">
            {agente.is_receiving_calls ? "Recibiendo tráfico" : "Línea cortada"}
          </span>
        </button>
      </div>

      <div className="w-full text-center mb-8">
        <p className="text-[10px] text-gray-700 font-mono tracking-widest">NEOVOX SECURE ENROUTING</p>
      </div>
    </main>
  );
}