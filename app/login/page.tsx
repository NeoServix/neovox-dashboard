"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../lib/supabase";

export default function PuertaAcceso() {
  const router = useRouter();
  const [credencial, setCredencial] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const orgId = localStorage.getItem('neovox_org_id');
    const agentId = localStorage.getItem('neovox_agent_id');
    
    if (orgId) {
      router.push('/gerente');
    } else if (agentId) {
      router.push('/agente');
    }
  }, [router]);

  async function procesarEntrada(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const valorLimpio = credencial.trim().toLowerCase();
    const sinEspacios = valorLimpio.replace(/\s+/g, '');
    
    const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorLimpio);
    
    // Evaluamos la longitud y el formato del teléfono en segundo plano
    let esTelefono = false;
    let telefonoBusqueda = sinEspacios;

    if (!esEmail) {
      if (/^[0-9]{9}$/.test(sinEspacios)) {
        esTelefono = true;
        telefonoBusqueda = "+34" + sinEspacios;
      } else if (/^\+[0-9]{9,15}$/.test(sinEspacios)) {
        esTelefono = true;
        telefonoBusqueda = sinEspacios;
      }
    }

    try {
      if (esEmail) {
        const { data, error: errDb } = await supabase
          .from('organizations')
          .select('id')
          .eq('contact_email', valorLimpio)
          .single();

        if (errDb || !data) throw new Error("No hay ninguna agencia vinculada a este correo.");
        
        localStorage.setItem('neovox_org_id', data.id);
        router.push('/gerente');

      } else if (esTelefono) {
        const { data, error: errDb } = await supabase
          .from('agents')
          .select('id, org_id')
          .eq('phone_number', telefonoBusqueda)
          .single();

        if (errDb || !data) throw new Error("No encontramos este número de teléfono en el sistema.");

        localStorage.setItem('neovox_agent_id', data.id);
        router.push('/agente');

      } else {
        throw new Error("Escribe un correo de gerencia válido o un móvil de 9 dígitos.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col justify-center items-center p-6 font-sans relative selection:bg-[#00A8E8] selection:text-white">
      
      {/* Botón flotante para volver */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <Image src="/logo.png" alt="NeoVox" width={20} height={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase text-white">Volver</span>
      </Link>

      {/* Resplandor central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00A8E8]/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-sm bg-[#121212]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,168,232,0.05)] relative overflow-hidden">
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-[#00A8E8]/10 border border-[#00A8E8]/20 rounded-xl flex items-center justify-center mx-auto mb-5 text-[#00A8E8]">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Terminal NeoVox</h1>
          <p className="text-xs text-gray-400 mt-2">Acceso a la red de enrutamiento</p>
        </div>

        <form onSubmit={procesarEntrada} className="space-y-6 relative z-10">
          <div>
            <input
              type="text"
              placeholder="Email (Gerencia) o Móvil (Agentes)"
              value={credencial}
              onChange={(e) => setCredencial(e.target.value)}
              className="w-full bg-black/50 border border-[#00A8E8]/20 rounded-xl p-4 text-white text-sm outline-none focus:border-[#00A8E8] transition-all text-center placeholder:text-gray-600"
              autoComplete="off"
            />
            <p className="text-[10px] text-gray-500 text-center mt-3 font-medium px-4">
              El sistema procesa automáticamente los números móviles de 9 dígitos.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center backdrop-blur-sm">
              <p className="text-[11px] text-red-400 font-bold tracking-wide uppercase">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#00A8E8] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {cargando ? "Conectando..." : "Acceder al sistema"}
          </button>
        </form>
      </div>
    </main>
  );
}