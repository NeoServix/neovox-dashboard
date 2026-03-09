import Link from "next/link";
import Image from "next/image";

// Componente maestro para los contenedores de sección
const GlassSection = ({ children, className = "", glowing = false }: { children: React.ReactNode; className?: string; glowing?: boolean }) => (
  <section className={`px-4 md:px-6 max-w-6xl w-full mx-auto mb-16 relative ${className}`}>
    {glowing && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00A8E8]/10 rounded-full blur-[100px] -z-10" />
    )}
    <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
      {children}
    </div>
  </section>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#00A8E8] selection:text-white">
      {/* Cabecera */}
      <header className="border-b border-[#00A8E8]/20 bg-black/60 backdrop-blur-lg fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="NeoVox Logo" width={30} height={30} className="object-contain" />
            <span className="text-white font-bold tracking-widest uppercase text-sm">NeoVox</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login"
              className="text-xs font-bold text-gray-400 hover:text-[#00A8E8] transition-colors uppercase tracking-wider"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/registro"
              className="text-xs font-bold bg-[#00A8E8] text-white px-5 py-2.5 rounded-lg hover:bg-[#0090C8] transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(0,168,232,0.4)]"
            >
              Conectar Nodo
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-16 flex flex-col items-center">
        
        {/* Bloque 1: Hero */}
        <GlassSection glowing={true} className="mt-8">
          <div className="text-center relative z-10">
            <span className="text-[#00A8E8] text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-8 inline-block px-4 py-1.5 border border-[#00A8E8]/40 rounded-full bg-[#00A8E8]/10 shadow-[0_0_10px_rgba(0,168,232,0.2)]">
              Control de Latencia Inmobiliaria
            </span>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-10">
              El 45% de los leads mueren en la <span className="text-[#00A8E8]">bandeja de entrada</span>.
            </h1>
            
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              Un cliente solicita información. El correo tarda minutos en llegar. Cuando logras contactar; ya ha cerrado la visita con otra agencia. NeoVox intercepta los datos de entrada y hace sonar el teléfono comercial en <strong className="text-white">menos de 20 segundos</strong>.
            </p>

            <Link 
              href="/registro"
              className="inline-block bg-[#00A8E8] text-white font-bold py-5 px-10 rounded-xl hover:bg-[#0090C8] transition-all uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(0,168,232,0.5)] active:scale-[0.98]"
            >
              Acelerar mi tiempo de respuesta
            </Link>
          </div>
        </GlassSection>

        {/* Bloque 2: ¿Qué es NeoVox? (Nueva Sección) */}
        <GlassSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Anatomía del sistema</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                NeoVox opera como una infraestructura de alta disponibilidad construida en código puro. Su única función es suprimir el tiempo muerto entre el interés del usuario y la conexión telefónica.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Los asistentes conversacionales generan fricción en operaciones de alto valor económico; nosotros descartamos ese enfoque. El sistema conecta directamente a dos humanos para asegurar que la primera voz que escuche el comprador sea la de tu comercial.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-[#00A8E8]/10 text-[#00A8E8] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Cero intervención manual</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Lectura de datos y marcado automático sin requerir que el equipo abra aplicaciones externas.</p>
                </div>
              </div>
              
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-[#00A8E8]/10 text-[#00A8E8] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Omnicanalidad nativa</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Capturamos peticiones desde portales inmobiliarios; formularios web o campañas de Meta Ads con idéntica precisión.</p>
                </div>
              </div>
            </div>
          </div>
        </GlassSection>

        {/* Bloque 3: Infraestructura */}
        <GlassSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Tecnología de Grado Empresarial</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">Construimos sobre la infraestructura de telecomunicaciones que da soporte a plataformas globales de alta concurrencia.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 border border-white/5 rounded-2xl bg-black/30">
              <div className="text-[10px] font-mono text-[#00A8E8] mb-5 border-b border-[#00A8E8]/20 pb-2 uppercase tracking-widest font-bold">NÚCLEO DE VOZ</div>
              <h3 className="text-white font-bold mb-3 text-base">Twilio Telecom</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Acceso directo al backbone telefónico que utilizan Uber o Airbnb. Estabilidad estructural en cada línea comercial.</p>
            </div>
            <div className="p-8 border border-white/5 rounded-2xl bg-black/30">
              <div className="text-[10px] font-mono text-[#00A8E8] mb-5 border-b border-[#00A8E8]/20 pb-2 uppercase tracking-widest font-bold">PROCESAMIENTO</div>
              <h3 className="text-white font-bold mb-3 text-base">Cloudflare Workers</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Prescindimos de servidores tradicionales; procesamos directamente en la red Edge para asegurar latencia matemática cero.</p>
            </div>
            <div className="p-8 border border-white/5 rounded-2xl bg-black/30">
              <div className="text-[10px] font-mono text-[#00A8E8] mb-5 border-b border-[#00A8E8]/20 pb-2 uppercase tracking-widest font-bold">CEREBRO IA</div>
              <h3 className="text-white font-bold mb-3 text-base">Groq & Llama 3.1</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Extracción paralela de parámetros en texto bruto para dictar el contexto al agente antes de establecer la llamada.</p>
            </div>
          </div>
        </GlassSection>

        {/* Bloque 4: Validación */}
        <GlassSection>
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Impacto Comercial Medible</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-black/30 border border-white/5 rounded-2xl relative">
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                Registrábamos un volumen de 300 peticiones mensuales. La demora en el primer contacto nos costaba la pérdida de la mitad del tráfico de entrada. Al conectar el nodo; el tiempo de enrutamiento bajó a 18 segundos. La tasa de conversión a visita firmada creció un 34% en el primer ciclo operativo.
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-10 h-10 bg-[#00A8E8]/10 border border-[#00A8E8]/30 rounded-full flex items-center justify-center text-[10px] font-bold text-[#00A8E8]">DO</div>
                <div>
                  <div className="text-sm font-bold text-white">Director de Operaciones</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Agencia de Red Nacional</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/30 border border-white/5 rounded-2xl relative">
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                El valor añadido reside en el control del tráfico fuera de horas. La plantilla desconecta los terminales a las 20:00; el motor captura las entradas de la madrugada; consolida los datos y expide un reporte técnico a las 09:00. Iniciamos la jornada procesando objetivos concretos.
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-10 h-10 bg-[#00A8E8]/10 border border-[#00A8E8]/30 rounded-full flex items-center justify-center text-[10px] font-bold text-[#00A8E8]">GV</div>
                <div>
                  <div className="text-sm font-bold text-white">Gerente de Ventas</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Boutique Inmobiliaria Premium</div>
                </div>
              </div>
            </div>
          </div>
        </GlassSection>

        {/* Bloque 5: Oferta de Cierre */}
        <GlassSection glowing={true} className="text-center">
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-white mb-5">El coste real de la latencia</h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed">
              Calcula tus honorarios por operación. Perder una sola solicitud de contacto por una respuesta tardía acarrea pérdidas superiores al coste anual de esta infraestructura. Conectar tu dominio a NeoVox es un cálculo básico de rentabilidad.
            </p>
            <Link 
              href="/registro"
              className="inline-block bg-white text-black font-bold py-4 px-12 rounded-xl hover:bg-gray-200 transition-all uppercase text-xs tracking-widest shadow-xl active:scale-[0.98]"
            >
              Iniciar proceso de conexión
            </Link>
          </div>
        </GlassSection>

      </main>
    </div>
  );
}