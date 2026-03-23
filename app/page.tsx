"use client";

import Link from "next/link";
import Image from "next/image";

// Componente maestro para los contenedores de sección
const GlassSection = ({ children, className = "", glowing = false }: { children: React.ReactNode; className?: string; glowing?: boolean }) => (
  <section className={`px-4 md:px-6 max-w-6xl w-full mx-auto mb-12 md:mb-16 relative ${className}`}>
    {glowing && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00A8E8]/10 rounded-full blur-[100px] -z-10" />
    )}
    <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 md:p-14 shadow-2xl relative overflow-hidden">
      {children}
    </div>
  </section>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#00A8E8] selection:text-white">
      {/* Cabecera optimizada para móvil */}
      <header className="border-b border-[#00A8E8]/20 bg-black/60 backdrop-blur-lg fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-7.5 md:h-7.5 relative">
              <Image src="/logo.png" alt="NeoVox Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-[10px] md:text-sm">NeoVox</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <Link 
              href="/login"
              className="text-[9px] md:text-xs font-bold text-gray-400 hover:text-[#00A8E8] transition-colors uppercase tracking-wider"
            >
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Login</span>
            </Link>
            <Link 
              href="/registro"
              className="text-[9px] md:text-xs font-bold bg-[#00A8E8] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg hover:bg-[#0090C8] transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(0,168,232,0.4)]"
            >
              Conectar Sistema
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 md:pt-32 pb-16 flex flex-col items-center">
        
        {/* Bloque 1: Hero (La matemática del abandono) */}
        <GlassSection glowing={true} className="mt-4 md:mt-8">
          <div className="text-center relative z-10">
            <span className="text-[#00A8E8] text-[9px] md:text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-6 md:mb-8 inline-block px-3 py-1.5 border border-[#00A8E8]/40 rounded-full bg-[#00A8E8]/10 shadow-[0_0_10px_rgba(0,168,232,0.2)]">
              Control de Latencia Inmobiliaria
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-8 md:mb-10">
              El 74% de los contactos se pierden por <span className="text-[#00A8E8]">falta de velocidad</span>.
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed">
              Si un interesado no recibe una respuesta en los primeros 5 minutos; la probabilidad de que acabe convirtiendo cae un 400%. No es un problema de falta de ganas de tu equipo; es un problema de latencia física. Mientras un comercial abre el correo de un portal; el cliente ya está llamando a la siguiente propiedad.
            </p>

            <Link 
              href="/registro"
              className="inline-block bg-[#00A8E8] text-white font-bold py-4 px-8 md:py-5 md:px-10 rounded-xl hover:bg-[#0090C8] transition-all uppercase text-[10px] md:text-xs tracking-widest shadow-[0_0_30px_rgba(0,168,232,0.5)] active:scale-[0.98]"
            >
              Conectar Sistema
            </Link>
          </div>
        </GlassSection>

        {/* Bloque 2: La Insuficiencia del Mercado */}
        <GlassSection>
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Por qué las soluciones actuales no funcionan</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">Parches temporales que generan fricción o dependen del factor humano.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 md:p-8 bg-black/40 border border-white/5 rounded-2xl">
              <div className="text-[#00A8E8] font-bold text-lg mb-2">1. Respuestas por correo</div>
              <p className="text-xs text-gray-400 leading-relaxed">El cliente las ignora casi siempre; son ruido digital que no genera compromiso.</p>
            </div>
            <div className="p-6 md:p-8 bg-black/40 border border-white/5 rounded-2xl">
              <div className="text-[#00A8E8] font-bold text-lg mb-2">2. Secretarías externas</div>
              <p className="text-xs text-gray-400 leading-relaxed">No conocen tus activos; el trato es frío y el cliente nota que habla con alguien que sigue un guion.</p>
            </div>
            <div className="p-6 md:p-8 bg-black/40 border border-white/5 rounded-2xl">
              <div className="text-[#00A8E8] font-bold text-lg mb-2">3. Gestión manual en CRM</div>
              <p className="text-xs text-gray-400 leading-relaxed">Depende de que alguien esté mirando una pantalla; si el contacto entra un sábado por la tarde; se queda en la bandeja hasta el lunes.</p>
            </div>
          </div>
        </GlassSection>

        {/* Bloque 3: NeoVox (El Interceptor) y Autoridad Técnica */}
        <GlassSection glowing={true}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">El interceptor de contactos de alto grado</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                NeoVox no espera a que alguien lea un mensaje. Interceptamos el contacto en el aire; procesamos los datos con un motor de alta velocidad y conectamos la llamada entre tu comercial y el cliente en menos de 60 segundos. 
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Montamos una infraestructura que nunca duerme para que tú no pierdas ni un céntimo de lo que inviertes en portales.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                <h3 className="text-white font-bold text-sm mb-2">Twilio Telecom</h3>
                <p className="text-xs text-gray-500 leading-relaxed">La centralita líder mundial para asegurar conexiones de voz estables.</p>
              </div>
              <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                <h3 className="text-white font-bold text-sm mb-2">Groq & Llama 3.1</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Procesamos los textos a una velocidad que la competencia no puede alcanzar para que el resumen llegue al instante.</p>
              </div>
              <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                <h3 className="text-white font-bold text-sm mb-2">Supabase</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Guardamos toda tu información bajo cifrado de extremo a extremo en un búnker digital.</p>
              </div>
              <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                <h3 className="text-white font-bold text-sm mb-2">Resend</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Mandamos las alertas críticas y consolidamos los datos en tu CRM sin fallos.</p>
              </div>
            </div>
          </div>
        </GlassSection>

        {/* Bloque 4: Confianza (LinkedIn Style) */}
        <GlassSection>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 md:mb-12 text-center">Impacto Comercial Medible</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-6 md:p-8 bg-black/30 border border-white/5 rounded-2xl relative">
              <p className="text-gray-300 text-sm leading-relaxed mb-8 italic">
                "Lo que me convenció no fue la inteligencia artificial; fue dejar de ver contactos perdidos los lunes por la mañana. Ahora; si entra un aviso un domingo; mi equipo recibe la llamada al momento. Hemos arreglado el agujero por el que se nos iba el dinero de los anuncios."
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-10 h-10 bg-[#00A8E8]/10 border border-[#00A8E8]/30 rounded-full flex items-center justify-center text-[10px] font-bold text-[#00A8E8]">CM</div>
                <div>
                  <div className="text-sm font-bold text-white">Carlos M.</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Director en InmoPremium</div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-black/30 border border-white/5 rounded-2xl relative">
              <p className="text-gray-300 text-sm leading-relaxed mb-8 italic">
                "Teníamos dudas sobre si sería difícil de montar. En una videollamada de 20 minutos con Víctor dejamos el sistema conectado al correo y funcionando. Es la herramienta más invisible y efectiva que tenemos en la oficina ahora mismo."
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-10 h-10 bg-[#00A8E8]/10 border border-[#00A8E8]/30 rounded-full flex items-center justify-center text-[10px] font-bold text-[#00A8E8]">ER</div>
                <div>
                  <div className="text-sm font-bold text-white">Elena R.</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Operaciones en RedHogar</div>
                </div>
              </div>
            </div>
          </div>
        </GlassSection>

        {/* Bloque 5: Tarifas y Módulos */}
        <GlassSection>
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Tarifas y Módulos</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">Precios mensuales sin IVA. Los costes de telefonía se calculan por el segundo exacto consumido.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Essential */}
            <div className="p-8 border border-white/10 rounded-3xl bg-black/40 flex flex-col hover:border-[#00A8E8]/50 transition-colors">
              <div className="text-[10px] font-mono text-[#00A8E8] mb-2 uppercase tracking-widest font-bold">Plan Essential</div>
              <div className="text-4xl font-bold text-white mb-4">49€ <span className="text-sm text-gray-500 font-normal">/ mes</span></div>
              <p className="text-xs text-gray-400 mb-8 h-8">Diseñado para agentes independientes o comerciales autónomos que necesitan velocidad.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span><strong className="text-white">1 Terminal</strong> exclusivo.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Llamada automática en menos de 60 segundos con resumen de voz IA.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Panel de Gerencia: Historial de actividad, auditoría visual y logotipos de portales.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Interruptor móvil para activar o desactivar la recepción de llamadas con un clic.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Integración directa con tu CRM y envío de alertas automáticas por leads no contestados o recibidos fuera de horario.</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="p-8 border border-[#00A8E8] rounded-3xl bg-[#00A8E8]/5 flex flex-col relative shadow-[0_0_30px_rgba(0,168,232,0.1)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00A8E8] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Agencias
              </div>
              <div className="text-[10px] font-mono text-[#00A8E8] mb-2 uppercase tracking-widest font-bold">Plan Pro</div>
              <div className="text-4xl font-bold text-white mb-4">149€ <span className="text-sm text-gray-500 font-normal">/ mes</span></div>
              <p className="text-xs text-gray-400 mb-8 h-8">La base para agencias que quieren control total sobre su red comercial.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span><strong className="text-white">2 Terminales</strong> incluidos de serie.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Todo el motor tecnológico, integraciones y panel completo del Plan Essential.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Reparto inteligente de contactos por zonas mediante la asignación de prefijos.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Protocolo de seguridad: Derivación a la bolsa general de la agencia si el responsable de la zona no atiende.</span>
                </li>
                <li className="flex gap-3 items-start text-sm text-gray-300">
                  <svg className="w-5 h-5 text-[#00A8E8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Aislamiento técnico completo mediante subcuentas dedicadas de telefonía.</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-[#00A8E8]/20 mt-auto text-xs text-gray-300 font-mono text-center bg-black/40 py-3 rounded-xl border border-white/5">
                Añade terminales extra por <strong className="text-white">+19€ / unidad</strong>
              </div>
            </div>

          </div>
        </GlassSection>

        {/* Bloque 6: Oferta de Cierre */}
        <GlassSection glowing={true} className="text-center">
          <div className="max-w-2xl mx-auto py-6 md:py-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-5">El coste real de la latencia</h2>
            <p className="text-gray-400 text-sm mb-8 md:mb-10 leading-relaxed">
              Calcula tus honorarios por operación. Perder una sola solicitud de contacto por una respuesta tardía acarrea pérdidas superiores al coste anual de esta infraestructura. Conectar tu dominio a NeoVox es un cálculo básico de rentabilidad.
            </p>
            <Link 
              href="/registro"
              className="inline-block bg-white text-black font-bold py-4 px-8 md:py-4 md:px-12 rounded-xl hover:bg-gray-200 transition-all uppercase text-[10px] md:text-xs tracking-widest shadow-xl active:scale-[0.98] mb-4"
            >
              Iniciar proceso de conexión
            </Link>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">
              Instalación asistida mediante videollamada tras el registro.
            </p>
          </div>
        </GlassSection>

      </main>
    </div>
  );
}