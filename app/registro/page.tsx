"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  const [agencyName, setAgencyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [agents, setAgents] = useState([{ full_name: "", phone_number: "" }]);
  
  const [cifFile, setCifFile] = useState<File | null>(null);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const cifInputRef = useRef<HTMLInputElement | null>(null);
  const dniInputRef = useRef<HTMLInputElement | null>(null);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!cifFile || !dniFile || !receiptFile) {
      return alert("Falta cargar uno o más documentos requeridos para la validación.");
    }

    const MAX_FILE_SIZE = 5242880; 
    if (cifFile.size > MAX_FILE_SIZE || dniFile.size > MAX_FILE_SIZE || receiptFile.size > MAX_FILE_SIZE) {
      return alert("Uno de los archivos pesa más de 5MB. Por favor, comprime los documentos antes de subirlos.");
    }
    
    setIsUploading(true);
    let tempOrgId = null;

    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: "Pendiente de configuración" }])
        .select()
        .single();

      if (orgError) throw orgError;
      tempOrgId = org.id;

      const filesToUpload = [
        { file: cifFile, prefix: 'CIF' },
        { file: dniFile, prefix: 'DNI' },
        { file: receiptFile, prefix: 'RECIBO' }
      ];

      for (const item of filesToUpload) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${org.id}/${item.prefix}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(fileName, item.file);

        if (uploadError) throw new Error(`Fallo al subir el documento ${item.prefix}: ${uploadError.message}`);
      }

      setOrgId(org.id);
      setStep(2);
    } catch (error: any) {
      if (tempOrgId) {
        await supabase.from('organizations').delete().eq('id', tempOrgId);
      }
      alert("Error en la conexión con el búnker: " + error.message + ". Se ha cancelado el registro para proteger los datos.");
    } finally {
      setIsUploading(false);
    }
  };

  const addAgentRow = () => {
    setAgents([...agents, { full_name: "", phone_number: "" }]);
  };

  const updateAgent = (index: number, field: string, value: string) => {
    const newAgents = [...agents];
    (newAgents[index] as any)[field] = value;
    setAgents(newAgents);
  };

  const handleFinalize = async () => {
    if (!agencyName || !contactEmail || agents.some(a => !a.full_name || !a.phone_number)) {
      return alert("Faltan datos en el registro del equipo o el correo de alertas.");
    }

    if (!legalAccepted) {
      return alert("Debes aceptar los Términos de Servicio y el DPA para poder activar el nodo.");
    }

    const processedAgents = agents.map(a => {
      const soloNumeros = a.phone_number.replace(/\D/g, '');
      const nueveDigitos = soloNumeros.slice(-9);
      return {
        full_name: a.full_name,
        phone_number: "+34" + nueveDigitos,
        raw_length: nueveDigitos.length,
        org_id: orgId
      };
    });

    if (processedAgents.some(a => a.raw_length < 9)) {
      return alert("Uno de los números de teléfono introducidos no es válido. Revisa que tengan 9 dígitos.");
    }

    const finalAgents = processedAgents.map(({ raw_length, ...rest }) => rest);

    setIsUploading(true);
    try {
      await supabase
        .from('organizations')
        .update({ 
          name: agencyName,
          contact_email: contactEmail,
          sector: "Inmobiliaria"
        })
        .eq('id', orgId);

      const { error } = await supabase.from('agents').insert(finalAgents);
      if (error) throw error;

      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactEmail, agencyName: agencyName })
      });

      alert("Configuración terminada. Te hemos enviado un email de confirmación.");
      router.push('/'); 
    } catch (e: any) {
      alert("Fallo al conectar el equipo: " + e.message);
      setIsUploading(false);
    } 
  };

  const FileUploadBlock = ({ 
    title, 
    file, 
    inputRef, 
    onChange 
  }: { 
    title: string; 
    file: File | null; 
    inputRef: React.RefObject<HTMLInputElement | null>; 
    onChange: (e: ChangeEvent<HTMLInputElement>) => void; 
  }) => (
    <div 
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`border border-[#00A8E8]/20 bg-black/40 rounded-xl p-4 text-center transition-all cursor-pointer mb-4 ${isUploading ? 'opacity-50' : 'hover:border-[#00A8E8]/50 hover:bg-[#00A8E8]/5'} flex justify-between items-center group`}
    >
      <input 
        type="file" 
        ref={inputRef as React.RefObject<HTMLInputElement>} 
        className="hidden" 
        accept=".pdf,image/*" 
        onChange={onChange} 
      />
      <span className="text-xs font-bold text-white group-hover:text-[#00A8E8] transition-colors">{title}</span>
      <span className="text-xs text-gray-500 truncate max-w-37.5 font-mono">
        {file ? file.name : "Subir archivo"}
      </span>
    </div>
  );

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-black font-sans text-gray-200">
      
      {/* Botón flotante para volver */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <Image src="/logo.png" alt="NeoVox" width={20} height={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase text-white">Volver</span>
      </Link>

      {/* PANEL IZQUIERDO: Interactivo */}
      <div className="w-full lg:w-1/2 p-6 pt-24 lg:p-16 flex flex-col justify-center items-center relative">
        {/* Resplandor de fondo suave */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00A8E8]/5 rounded-full blur-[100px] -z-10" />
        
        {step === 1 ? (
          <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="mb-8 relative z-10">
              <span className="text-[10px] font-bold text-[#00A8E8] tracking-[0.2em] uppercase">Paso 1 de 2</span>
              <h1 className="text-3xl font-bold text-white mt-2 mb-4 tracking-tight">
                Validación Legal
              </h1>
              <p className="text-gray-400 text-xs leading-relaxed">
                Cargue los tres documentos exigidos por la normativa de telecomunicaciones para verificar su identidad empresarial.
              </p>
            </div>
            
            <div className="mb-8 relative z-10">
              <FileUploadBlock title="1. CIF Sociedad" file={cifFile} inputRef={cifInputRef} onChange={handleFileChange(setCifFile)} />
              <FileUploadBlock title="2. DNI Administrador" file={dniFile} inputRef={dniInputRef} onChange={handleFileChange(setDniFile)} />
              <FileUploadBlock title="3. Recibo Suministro" file={receiptFile} inputRef={receiptInputRef} onChange={handleFileChange(setReceiptFile)} />
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="relative z-10 w-full bg-[#00A8E8] text-white font-bold py-5 px-8 rounded-xl shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all uppercase text-[10px] tracking-widest disabled:opacity-50 active:scale-[0.98]"
            >
              {isUploading ? "Cifrando documentos..." : "Validar y Continuar"}
            </button>
          </div>
        ) : (
          <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-bold text-[#00A8E8] tracking-[0.2em] uppercase relative z-10">Paso 2 de 2</span>
            <h1 className="text-3xl font-bold text-white mt-2 mb-8 tracking-tight relative z-10">Configura tu Búnker</h1>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Sociedad Inmobiliaria</label>
                <input 
                  type="text" 
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ej: Inmobiliaria Madrid Norte"
                  className="w-full p-4 rounded-xl border border-[#00A8E8]/20 bg-black/50 text-white focus:border-[#00A8E8] outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Correo de Gerencia</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="gerencia@inmobiliaria.com"
                  className="w-full p-4 rounded-xl border border-[#00A8E8]/20 bg-black/50 text-white focus:border-[#00A8E8] outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-4 tracking-wider">Terminales Comerciales (Móvil)</label>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10">
                  {agents.map((agent, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        placeholder="Nombre completo" 
                        className="w-1/2 p-3 rounded-lg border border-[#00A8E8]/20 bg-black/50 text-white text-sm outline-none focus:border-[#00A8E8]"
                        onChange={(e) => updateAgent(index, 'full_name', e.target.value)}
                      />
                      <input 
                        placeholder="Ej: 612 345 678" 
                        className="w-1/2 p-3 rounded-lg border border-[#00A8E8]/20 bg-black/50 text-white text-sm outline-none focus:border-[#00A8E8] font-mono"
                        onChange={(e) => updateAgent(index, 'phone_number', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addAgentRow}
                  className="text-[10px] font-bold text-[#00A8E8] hover:text-white uppercase tracking-wider transition-colors"
                >
                  + Añadir otro terminal
                </button>
              </div>

              <div className="flex items-start gap-3 mt-4 mb-2 p-4 bg-[#00A8E8]/5 border border-[#00A8E8]/10 rounded-xl">
                <input
                  type="checkbox"
                  id="legal"
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#00A8E8]/30 bg-black/50 checked:bg-[#00A8E8] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="legal" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">
                  Acepto los <Link href="/legal" target="_blank" className="text-[#00A8E8] hover:underline hover:text-white transition-colors">Términos de Servicio y el DPA</Link>. Asumo mi responsabilidad como Responsable del Tratamiento de los datos.
                </label>
              </div>

              <button 
                onClick={handleFinalize}
                disabled={isUploading}
                className="w-full bg-[#00A8E8] text-white font-bold py-5 px-8 rounded-xl shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all uppercase text-[10px] tracking-widest disabled:opacity-50 active:scale-[0.98]"
              >
                {isUploading ? "Conectando terminales..." : "Activar Protocolo NeoVox"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PANEL DERECHO: Institucional */}
      <div className="w-full lg:w-1/2 bg-black/50 p-6 lg:p-16 flex flex-col justify-center items-center text-white relative overflow-hidden border-l border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00A8E8]/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10 bg-[#121212]/80 border border-[#00A8E8]/20 backdrop-blur-xl p-10 lg:p-12 rounded-3xl max-w-md shadow-[0_0_50px_rgba(0,168,232,0.05)]">
          <div className="w-12 h-12 bg-[#00A8E8]/10 rounded-xl flex items-center justify-center mb-6 text-[#00A8E8]">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">Cifrado de Extremo a Extremo</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Los documentos de su sociedad se procesan mediante túneles seguros y se almacenan en un servidor aislado sin exposición pública.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono bg-[#00A8E8]/10 border border-[#00A8E8]/20 px-2 py-1 rounded text-[#00A8E8]">RGPD</span>
              <p className="text-[11px] text-gray-400 font-medium">Cumplimiento estricto europeo en materia de protección de datos comerciales.</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono bg-[#00A8E8]/10 border border-[#00A8E8]/20 px-2 py-1 rounded text-[#00A8E8]">AUTH</span>
              <p className="text-[11px] text-gray-400 font-medium">Validación directa con operadoras de telefonía (Trust Hub) para la compra de números.</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}