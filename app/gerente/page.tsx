"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const DAYS_ES = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo"
};

type DaySchedule = { isOpen: boolean; open: string; close: string };
type ScheduleConfig = Record<string, DaySchedule>;

const defaultSchedule: ScheduleConfig = {
  monday: { isOpen: true, open: "09:00", close: "18:00" },
  tuesday: { isOpen: true, open: "09:00", close: "18:00" },
  wednesday: { isOpen: true, open: "09:00", close: "18:00" },
  thursday: { isOpen: true, open: "09:00", close: "18:00" },
  friday: { isOpen: true, open: "09:00", close: "15:00" },
  saturday: { isOpen: false, open: "00:00", close: "00:00" },
  sunday: { isOpen: false, open: "00:00", close: "00:00" }
};

export default function ConsolaGerente() {
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [agentes, setAgentes] = useState<any[]>([]);
  const [llamadas, setLlamadas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  useEffect(() => {
    const orgId = localStorage.getItem("neovox_org_id");
    if (!orgId) {
      router.push("/login");
      return;
    }

    async function cargarBunker() {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("id, name, plan_tier, schedule")
        .eq("id", orgId)
        .single();

      if (!orgData) {
        router.push("/login");
        return;
      }

      if (!orgData.schedule) orgData.schedule = defaultSchedule;
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

  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: boolean | string) => {
    setOrg({
      ...org,
      schedule: {
        ...org.schedule,
        [day]: { ...org.schedule[day], [field]: value }
      }
    });
  };

  async function guardarMatrizHorarios() {
    setGuardandoHorario(true);
    const { error } = await supabase
      .from('organizations')
      .update({ schedule: org.schedule })
      .eq('id', org.id);
    
    setGuardandoHorario(false);
    if (error) {
      alert("Fallo al guardar: " + error.message);
    } else {
      alert("Matriz de enrutamiento actualizada.");
    }
  }

  function cerrarSesion() {
    localStorage.removeItem("neovox_org_id");
    router.push("/login");
  }

  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs">Accediendo a registros...</div>;

  return (
    <main className="min-h-screen bg-black p-4 lg:p-10 font-sans text-gray-200 relative selection:bg-[#00A8E8] selection:text-white">
      {/* Resplandor de fondo general */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-[#00A8E8]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 relative z-10">
        
        <div className="flex justify-between items-center border-b border-[#00A8E8]/20 pb-4 lg:pb-6">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-white tracking-tight">{org.name}</h1>
            <p className="text-[10px] lg:text-xs text-[#00A8E8] font-mono mt-2 uppercase tracking-widest bg-[#00A8E8]/10 inline-block px-3 py-1 rounded-full border border-[#00A8E8]/20">
              Plan Activo: {org.plan_tier}
            </p>
          </div>
          <button onClick={cerrarSesion} className="bg-[#121212]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors uppercase tracking-wider shadow-sm">
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Columna Izquierda: Auditoría */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-4 lg:space-y-6">
            <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider">Registro de Tráfico (Últimos 20)</h2>
            
            <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#00A8E8]/50 to-transparent" />
              <div className="divide-y divide-white/5">
                {llamadas.map(call => (
                  <div key={call.id} className="p-5 lg:p-6 hover:bg-white/5 transition-colors group">
                    
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#00A8E8] bg-[#00A8E8]/10 px-2 py-0.5 rounded border border-[#00A8E8]/20">{new Date(call.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="font-bold text-white text-base">{call.leads?.parsed_data?.nombre || 'Desconocido'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
                          <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          Atendido por <strong className="text-gray-200">{call.agents?.full_name}</strong>
                        </span>
                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-inner ${call.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {call.status} ({call.duration}s)
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl mt-3 relative overflow-hidden group-hover:border-[#00A8E8]/20 transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A8E8]/30" />
                      <p className="text-[13px] text-gray-400 italic font-medium leading-relaxed pl-2">
                        " {call.leads?.ai_whisper || 'Sin resumen registrado'} "
                      </p>
                    </div>
                  </div>
                ))}
                {llamadas.length === 0 && (
                  <div className="p-16 text-center text-gray-500 text-sm">El motor no ha registrado tráfico de llamadas aún.</div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Controles */}
          <div className="order-1 lg:order-2 space-y-6">
            
            {/* Control de Agentes */}
            <div>
              <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Mando Central de Líneas</h2>
              <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 lg:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#00A8E8]">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div className="space-y-3 relative z-10">
                  {agentes.map(agente => (
                    <div key={agente.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                      <div>
                        <p className="font-bold text-sm text-white mb-0.5">{agente.full_name}</p>
                        <p className="text-[10px] font-mono text-gray-500">{agente.phone_number}</p>
                      </div>
                      <button 
                        onClick={() => alternarEstadoAgente(agente.id, agente.is_receiving_calls)} 
                        className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${agente.is_receiving_calls ? 'bg-[#00A8E8]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${agente.is_receiving_calls ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Matriz de Horarios */}
            <div>
              <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Matriz de Enrutamiento</h2>
              <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 lg:p-6 shadow-2xl">
                <div className="space-y-2 mb-6">
                  {Object.keys(DAYS_ES).map((day) => {
                    const dayData = org.schedule?.[day] || defaultSchedule[day];
                    return (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-black/40 rounded-2xl border border-white/5 gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-1/3">
                          <input 
                            type="checkbox" 
                            checked={dayData.isOpen}
                            onChange={(e) => updateDaySchedule(day, "isOpen", e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-[#00A8E8] focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${dayData.isOpen ? 'text-white' : 'text-gray-500'}`}>
                            {DAYS_ES[day as keyof typeof DAYS_ES]}
                          </span>
                        </div>

                        <div className={`flex gap-3 transition-opacity ${dayData.isOpen ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                          <input 
                            type="time" 
                            value={dayData.open}
                            onChange={(e) => updateDaySchedule(day, "open", e.target.value)}
                            className="bg-black/50 border border-[#00A8E8]/20 text-white text-xs p-2 rounded-lg outline-none focus:border-[#00A8E8] transition-colors"
                          />
                          <span className="text-gray-500 text-xs mt-2">-</span>
                          <input 
                            type="time" 
                            value={dayData.close}
                            onChange={(e) => updateDaySchedule(day, "close", e.target.value)}
                            className="bg-black/50 border border-[#00A8E8]/20 text-white text-xs p-2 rounded-lg outline-none focus:border-[#00A8E8] transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={guardarMatrizHorarios}
                  disabled={guardandoHorario}
                  className="w-full bg-[#00A8E8] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {guardandoHorario ? 'Escribiendo en búnker...' : 'Fijar Horarios'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}