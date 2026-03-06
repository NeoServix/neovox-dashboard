import Link from "next/link";
import Image from "next/image";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-[#00A8E8] selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="NeoVox Logo" width={28} height={28} className="object-contain" />
            <span className="text-white font-bold tracking-widest uppercase text-sm">NeoVox</span>
          </div>
          <Link 
            href="/registro"
            className="text-xs font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider"
          >
            Conectar Nodo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-40 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#001C41] rounded-full blur-[120px] -z-10 opacity-50" />
        
        <span className="text-[#00A8E8] text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 border border-[#00A8E8]/30 rounded-full bg-[#00A8E8]/10">
          Infraestructura de Voz y Datos
        </span>
        
        <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl mb-6">
          Controla el embudo comercial.<br />Elimina la latencia de respuesta.
        </h1>
        
        <p className="text-gray-400 text-lg max-w-2xl mb-12">
          NeoVox es un motor de enrutamiento para agencias inmobiliarias. Intercepta los leads entrantes; lee los datos con inteligencia artificial y conecta la llamada con el comercial disponible en menos de 20 segundos.
        </p>

        <Link 
          href="/registro"
          className="bg-[#00A8E8] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#0090C8] transition-all uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,168,232,0.3)]"
        >
          Montar mi infraestructura
        </Link>

        {/* Especificaciones de ingeniería */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32 text-left">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-6 text-white font-mono text-xs">01</div>
            <h3 className="text-white font-bold mb-3 text-lg">Respuesta en Milisegundos</h3>
            <p className="text-gray-400 text-sm leading-relaxed">El servidor procesa el correo de entrada y ejecuta la orden de llamada antes de que el cliente cierre la pestaña del portal inmobiliario.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-6 text-white font-mono text-xs">02</div>
            <h3 className="text-white font-bold mb-3 text-lg">Susurro de Datos</h3>
            <p className="text-gray-400 text-sm leading-relaxed">El agente comercial descuelga el teléfono y escucha un resumen con el nombre del cliente y la vivienda de interés antes de establecer la conexión.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-6 text-white font-mono text-xs">03</div>
            <h3 className="text-white font-bold mb-3 text-lg">Búnker Nocturno</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Los contactos que entran fuera del horario de oficina quedan retenidos en la base de datos. El sistema los agrupa y los envía a primera hora de la mañana.</p>
          </div>
        </div>
      </main>
    </div>
  );
}