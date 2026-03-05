"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

    // Aquí forzamos las minúsculas para evitar fallos de teclado móvil
    const valorLimpio = credencial.trim().toLowerCase();
    
    const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorLimpio);
    const esTelefono = /^\+?[0-9\s]{9,15}$/.test(valorLimpio);

    try {
      if (esEmail) {
        const { data, error: errDb } = await supabase
          .from('organizations')
          .select('id')
          .eq('inbound_email', valorLimpio)
          .single();

        if (errDb || !data) throw new Error("No hay ninguna agencia vinculada a este correo.");
        
        localStorage.setItem('neovox_org_id', data.id);
        router.push('/gerente');

      } else if (esTelefono) {
        const { data, error: errDb } = await supabase
          .from('agents')
          .select('id, org_id')
          .eq('phone_number', valorLimpio)
          .single();

        if (errDb || !data) throw new Error("No encontramos este número. Recuerda escribir el prefijo (+34).");

        localStorage.setItem('neovox_agent_id', data.id);
        router.push('/agente');

      } else {
        throw new Error("Formato no válido. Escribe un correo o un teléfono con prefijo.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Terminal NeoVox</h1>
          <p className="text-xs text-gray-400 mt-2">Acceso a la red de enrutamiento</p>
        </div>

        <form onSubmit={procesarEntrada} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Correo o teléfono"
              value={credencial}
              onChange={(e) => setCredencial(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors text-center"
              autoComplete="off"
            />
            <p className="text-[10px] text-gray-500 text-center mt-3 font-medium">
              Obligatorio incluir prefijo en móviles (ej. +34600123456)
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-center">
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-white text-black font-bold py-4 rounded-xl text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {cargando ? "Conectando..." : "Acceder"}
          </button>
        </form>
      </div>
    </main>
  );
}