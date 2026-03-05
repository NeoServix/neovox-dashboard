"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function ConsolaGerente() {
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [agentes, setAgentes] = useState<any[]>([]);
  const [llamadas, setLlamadas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const orgId = localStorage.getItem("neovox_org_id");
    if (!orgId) {
      router.push("/login");
      return;
    }

    async function cargarBunker() {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("name, plan_tier")
        .eq("id", orgId)
        .single();

      if (!orgData) {
        router.push("/login");
        return;
      }
      setOrg(orgData);

      const { data: agData } = await supabase
        .from("agents")
        .select("*")
        .eq("org_id", orgId)
        .order("id", { ascending: true });
      if (agData) setAgentes(agData);

      const { data: callData } = await supabase
        .from("calls")
        .select(`
          id, 
          created_at, 
          status, 
          duration, 
          agents(full_name), 
          leads(ai_whisper, parsed_data)
        `)
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (callData) setLlamadas(callData);
      
      setCargando(false);
    }

    cargarBunker();
  }, [router]);

  async function alternarEstadoAgente(id: string, estadoActual: boolean) {
    const nuevoEstado = !estadoActual;
    setAgentes(agentes.map(a => a.id === id ? { ...a, is_receiving_calls: nuevoEstado } : a));

    await supabase
      .from("agents")
      .update({ is_receiving_calls: nuevoEstado })
      .eq("id", id);
  }

  function cerrarSesion() {
    localStorage.removeItem("neovox_org_id");
    router.push("/login");
  }

  if (cargando) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-mono text-xs">Accediendo a registros...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-4 lg:p-10 font-sans text-gray-200">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-4 lg:pb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{org.name}</h1>
            <p className="text-[10px] lg:text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Plan Activo: {org.plan_tier}</p>
          </div>
          <button onClick={cerrarSesion} className="bg-white/5 border border-white/10 px-3 py-2 lg:px-4 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-4 lg:space-y-6">
            <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider">Registro de Tráfico (Últimos 20)</h2>
            
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {llamadas.map(call => (
                  <div key={call.id} className="p-4 lg:p-5 hover:bg-white/5 transition-colors">
                    
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">{new Date(call.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="font-bold text-white text-sm">{call.leads?.parsed_data?.nombre || 'Desconocido'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-400 font-medium">↳ Atendido por {call.agents?.full_name}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${call.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {call.status} ({call.duration}s)
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg mt-1">
                      <p className="text-[13px] text-gray-400 italic font-medium leading-relaxed">
                        " {call.leads?.ai_whisper || 'Sin resumen registrado'} "
                      </p>
                    </div>
                  </div>
                ))}
                {llamadas.length === 0 && (
                  <div className="p-10 text-center text-gray-500 text-sm">El motor no ha registrado tráfico de llamadas aún.</div>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Mando Central de Líneas</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-5">
              <div className="space-y-3">
                {agentes.map(agente => (
                  <div key={agente.id} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                    <div>
                      <p className="font-bold text-sm text-white">{agente.full_name}</p>
                      <p className="text-[10px] font-mono text-gray-500">{agente.phone_number}</p>
                    </div>
                    <button 
                      onClick={() => alternarEstadoAgente(agente.id, agente.is_receiving_calls)} 
                      className={`w-12 h-6 rounded-full relative transition-colors ${agente.is_receiving_calls ? 'bg-green-500/80' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${agente.is_receiving_calls ? 'left-7 shadow-md' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}