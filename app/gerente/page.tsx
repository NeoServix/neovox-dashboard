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

// Mapa de límites de agentes por defecto según el plan contratado
const PLAN_BASE_LIMITS: Record<string, number> = {
  'essential': 1,
  'pro': 2,
  'elite': 5
};

export default function ConsolaGerente() {
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [agentes, setAgentes] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const [nuevoAgente, setNuevoAgente] = useState({ full_name: '', phone_number: '' });

  useEffect(() => {
    const orgId = localStorage.getItem("neovox_org_id");
    
    if (!orgId) {
      router.push("/login");
      return;
    }

    async function cargarBunker() {
      const { data: orgData, error: errorOrg } = await supabase
        .from("organizations")
        .select("id, name, plan_tier, business_hours, inbound_email, assigned_phone, extra_agents_quota")
        .eq("id", orgId)
        .single();

      if (errorOrg || !orgData) {
        localStorage.removeItem("neovox_org_id");
        localStorage.removeItem("neovox_agent_id");
        router.push("/login");
        return;
      }

      setOrg({
        ...orgData,
        schedule: orgData.business_hours || defaultSchedule
      });

      const { data: agData } = await supabase
        .from("agents")
        .select("*")
        .eq("org_id", orgId)
        .order("id", { ascending: true });
      if (agData) setAgentes(agData);

      const { data: leadsData, error: errorLeads } = await supabase
        .from("leads")
        .select(`
          id, 
          created_at, 
          status, 
          portal_source,
          ai_whisper, 
          parsed_data,
          agents(full_name)
        `)
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (errorLeads) {
        console.error("Fallo de lectura en registros:", errorLeads);
      }
      
      if (leadsData) setLeads(leadsData);
      
      setCargando(false);
    }

    cargarBunker();
  }, [router]);

  // Cálculos de capacidad en tiempo real
  const planTierLimpio = org?.plan_tier?.toLowerCase() || 'essential';
  const limiteBase = PLAN_BASE_LIMITS[planTierLimpio] || 1;
  const limiteTotal = limiteBase + (org?.extra_agents_quota || 0);
  const limiteAlcanzado = agentes.length >= limiteTotal;

  async function alternarEstadoAgente(id: string, estadoActual: boolean) {
    const nuevoEstado = !estadoActual;
    setAgentes(agentes.map(a => a.id === id ? { ...a, is_receiving_calls: nuevoEstado } : a));

    await supabase
      .from("agents")
      .update({ is_receiving_calls: nuevoEstado })
      .eq("id", id);
  }

  async function actualizarTelefono(id: string, nuevoTelefono: string) {
    if (!nuevoTelefono.trim()) return;
    await supabase.from('agents').update({ phone_number: nuevoTelefono }).eq('id', id);
    setAgentes(agentes.map(a => a.id === id ? { ...a, phone_number: nuevoTelefono } : a));
  }

  async function eliminarAgente(id: string) {
    if (!confirm("¿Eliminar este terminal de forma permanente?")) return;
    await supabase.from('agents').delete().eq('id', id);
    setAgentes(agentes.filter(a => a.id !== id));
  }

  async function crearAgente(e: React.FormEvent) {
    e.preventDefault();
    if (limiteAlcanzado || !nuevoAgente.full_name || !nuevoAgente.phone_number) return;
    
    const { data } = await supabase.from('agents').insert([{ 
      org_id: org.id, 
      full_name: nuevoAgente.full_name, 
      phone_number: nuevoAgente.phone_number, 
      is_receiving_calls: true 
    }]).select();

    if (data) {
      setAgentes([...agentes, data[0]]);
      setNuevoAgente({ full_name: '', phone_number: '' });
    }
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
      .update({ business_hours: org.schedule })
      .eq('id', org.id);
    
    setGuardandoHorario(false);
    if (error) {
      alert("Fallo al guardar: " + error.message);
    } else {
      alert("Configuración de enrutamiento actualizada.");
    }
  }

  function cerrarSesion() {
    localStorage.removeItem("neovox_org_id");
    localStorage.removeItem("neovox_agent_id");
    router.push("/login");
  }

  function getEstadoVisual(status: string) {
    switch(status) {
      case 'connected':
        return { texto: 'Conectado', clases: 'bg-green-500/10 text-green-400 border border-green-500/20' };
      case 'manual_review_needed':
        return { texto: 'Revisión Manual', clases: 'bg-red-500/10 text-red-400 border border-red-500/20' };
      case 'unanswered':
        return { texto: 'No Respondido', clases: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
      case 'pending_notification':
        return { texto: 'Fuera de Horario', clases: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
      case 'processing':
        return { texto: 'Analizando', clases: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' };
      case 'notified':
        return { texto: 'Aviso Enviado', clases: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      default:
        return { texto: status, clases: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' };
    }
  }

  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs">Conectando con el búnker...</div>;

  return (
    <main className="min-h-screen bg-black p-4 lg:p-10 font-sans text-gray-200 relative selection:bg-[#00A8E8] selection:text-white overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-[#00A8E8]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 relative z-10">
        
        <div className="flex justify-between items-center border-b border-[#00A8E8]/20 pb-4 lg:pb-6">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-white tracking-tight">{org.name}</h1>
            <p className="text-[10px] lg:text-xs text-[#00A8E8] font-mono mt-2 uppercase tracking-widest bg-[#00A8E8]/10 inline-block px-3 py-1 rounded-full border border-[#00A8E8]/20">
              Nivel de servicio: {org.plan_tier}
            </p>
          </div>
          <button onClick={cerrarSesion} className="bg-[#121212]/80 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors uppercase tracking-wider shadow-sm">
            Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-4 lg:space-y-6">
            <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Historial de Tráfico</h2>
            
            <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent" />
              <div className="divide-y divide-white/5">
                {leads.map(lead => {
                  const estado = getEstadoVisual(lead.status);
                  const nombreLead = lead.parsed_data?.nombre || 'Lead Entrante';
                  const nombreAgente = lead.agents?.full_name || 'Sistema de Alerta';
                  const telefonoCliente = lead.parsed_data?.telefono || 'Sin número';
                  const fechaLead = new Date(lead.created_at);

                  return (
                    <div key={lead.id} className="p-5 lg:p-6 hover:bg-white/5 transition-colors group">
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#00A8E8] bg-[#00A8E8]/10 px-2 py-0.5 rounded border border-[#00A8E8]/20">
                            {fechaLead.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })} - {fechaLead.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-bold text-white text-base">{nombreLead}</span>
                          <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{telefonoCliente}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
                            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Gestión: <strong className={nombreAgente === 'Sistema de Alerta' ? 'text-[#00A8E8]' : 'text-gray-200'}>{nombreAgente}</strong>
                          </span>
                          <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-inner ${estado.clases}`}>
                            {estado.texto}
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/5 p-4 rounded-xl mt-3 relative overflow-hidden group-hover:border-[#00A8E8]/20 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A8E8]/30" />
                        <p className="text-[13px] text-gray-400 italic font-medium leading-relaxed pl-2">
                          " {lead.ai_whisper || 'Procesando información del contacto...'} "
                        </p>
                      </div>
                    </div>
                  );
                })}
                {leads.length === 0 && (
                  <div className="p-16 text-center text-gray-500 text-sm">No hay registros de tráfico en las últimas horas.</div>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            
            <div>
              <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Líneas de Agentes</h2>
              <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 lg:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-[#00A8E8]">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div className="space-y-3 relative z-10">
                  {agentes.map(agente => (
                    <div key={agente.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                      <div className="w-full sm:w-auto flex-1">
                        <p className="font-bold text-sm text-white mb-1">{agente.full_name}</p>
                        <input
                          type="text"
                          defaultValue={agente.phone_number}
                          onBlur={(e) => actualizarTelefono(agente.id, e.target.value)}
                          className="bg-transparent border-b border-white/10 text-[10px] font-mono text-gray-400 focus:text-white focus:border-[#00A8E8] outline-none w-32 pb-0.5 transition-colors"
                          title="Haz clic para editar el teléfono"
                        />
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                        <button 
                          onClick={() => alternarEstadoAgente(agente.id, agente.is_receiving_calls)} 
                          className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${agente.is_receiving_calls ? 'bg-[#00A8E8]' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${agente.is_receiving_calls ? 'left-8' : 'left-1'}`} />
                        </button>
                        <button onClick={() => eliminarAgente(agente.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/5 mt-5 relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-semibold text-[#00A8E8] uppercase tracking-widest">Añadir Terminal</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${limiteAlcanzado ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#00A8E8]/10 text-[#00A8E8] border-[#00A8E8]/20'}`}>
                      Uso: {agentes.length} / {limiteTotal}
                    </span>
                  </div>

                  {limiteAlcanzado ? (
                    <div className="text-center p-5 bg-black/50 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-400 mb-4">Has alcanzado el límite de {limiteTotal} terminales simultáneos en tu plan actual.</p>
                      <a href={`https://buy.stripe.com/aFa3cx6RGecOanm5lzbEA00?client_reference_id=${org.id}`} target="_blank" rel="noreferrer" className="block w-full bg-white text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-[0.98]">
                        + Añadir Terminal Extra (19€/mes)
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={crearAgente} className="space-y-3">
                      <input type="text" placeholder="Nombre del comercial" value={nuevoAgente.full_name} onChange={e => setNuevoAgente({...nuevoAgente, full_name: e.target.value})} className="w-full border border-white/10 rounded-xl p-3 text-sm bg-black/50 text-white focus:border-[#00A8E8] outline-none transition-colors" />
                      <input type="text" placeholder="+34..." value={nuevoAgente.phone_number} onChange={e => setNuevoAgente({...nuevoAgente, phone_number: e.target.value})} className="w-full border border-white/10 rounded-xl p-3 text-sm font-mono bg-black/50 text-white focus:border-[#00A8E8] outline-none transition-colors" />
                      <button type="submit" className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold py-3.5 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-widest mt-2 active:scale-[0.98]">Dar de alta</button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Identificadores de Red</h2>
              <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 lg:p-6 shadow-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1">Buzón de Recepción</label>
                    <div className="w-full bg-black/50 border border-white/10 text-gray-400 text-sm p-3 rounded-xl font-mono cursor-not-allowed">
                      {org.inbound_email || 'No asignado'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1">Centralita (Twilio)</label>
                    <div className="w-full bg-black/50 border border-white/10 text-gray-400 text-sm p-3 rounded-xl font-mono cursor-not-allowed">
                      {org.assigned_phone || 'No asignado'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">Horarios de Apertura</h2>
              <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 lg:p-6 shadow-2xl">
                <div className="space-y-2 mb-6">
                  {Object.keys(DAYS_ES).map((day) => {
                    const dayData = org?.schedule?.[day] || defaultSchedule[day];
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
                  {guardandoHorario ? 'Actualizando...' : 'Guardar Horarios'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}