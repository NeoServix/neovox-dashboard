"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../lib/supabase"; 

export default function Home() {
  const [step, setStep] = useState(1);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  // Paso 1: Datos Base y Terminales
  const [agencyName, setAgencyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [agents, setAgents] = useState([{ full_name: "", phone_number: "", pin: "" }]);
  
  // Paso 2: KYC y Legal
  const [cifFile, setCifFile] = useState<File | null>(null);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cifInputRef = useRef<HTMLInputElement | null>(null);
  const dniInputRef = useRef<HTMLInputElement | null>(null);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const addAgentRow = () => {
    setAgents([...agents, { full_name: "", phone_number: "", pin: "" }]);
  };

  const updateAgent = (index: number, field: string, value: string) => {
    const newAgents = [...agents];
    (newAgents[index] as any)[field] = value;
    setAgents(newAgents);
  };

  const avanzarAPaso2 = () => {
    if (!agencyName || !contactEmail || !managerPassword || agents.some(a => !a.full_name || !a.phone_number || !a.pin)) {
      return alert("Faltan datos en el registro del equipo, el correo o los pines de acceso.");
    }
    setStep(2);
  };

  const procesarAltaCompleta = async () => {
    if (!cifFile || !dniFile || !receiptFile) {
      return alert("Falta cargar uno o más documentos requeridos para la validación.");
    }
    if (!legalAccepted) {
      return alert("Debes aceptar los Términos de Servicio y el DPA para poder crear el nodo.");
    }

    const MAX_FILE_SIZE = 5242880; 
    if (cifFile.size > MAX_FILE_SIZE || dniFile.size > MAX_FILE_SIZE || receiptFile.size > MAX_FILE_SIZE) {
      return alert("Uno de los archivos pesa más de 5MB. Por favor, comprime los documentos.");
    }

    const processedAgents = agents.map(a => {
      const soloNumeros = a.phone_number.replace(/\D/g, '');
      const nueveDigitos = soloNumeros.slice(-9);
      return {
        full_name: a.full_name,
        phone_number: "+34" + nueveDigitos,
        pin: a.pin,
        raw_length: nueveDigitos.length
      };
    });

    if (processedAgents.some(a => a.raw_length < 9)) {
      return alert("Uno de los números de teléfono introducidos no es válido. Revisa que tengan 9 dígitos.");
    }

    setIsProcessing(true);
    let tempOrgId = null;

    try {
      // 1. Crear Organización en Supabase
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ 
          name: agencyName,
          contact_email: contactEmail,
          password: managerPassword,
          sector: "Inmobiliaria"
        }])
        .select()
        .single();

      if (orgError) throw orgError;
      tempOrgId = org.id;

      // 2. Subir Archivos KYC
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

      // 3. Vincular Terminales
      const finalAgents = processedAgents.map(({ raw_length, ...rest }) => ({
        ...rest,
        org_id: org.id
      }));

      const { error: agentsError } = await supabase.from('agents').insert(finalAgents);
      if (agentsError) throw agentsError;

      // 4. Correo de Bienvenida Transaccional
      const respuestaCorreo = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactEmail, agencyName: agencyName })
      });

      if (!respuestaCorreo.ok) {
        console.error("Aviso: El correo transaccional no se pudo enviar, pero el nodo está creado.");
      }

      setOrgId(org.id);
      setStep(3); // Pasar al calendario
    } catch (error: any) {
      if (tempOrgId) {
        await supabase.from('organizations').delete().eq('id', tempOrgId);
      }
      alert("Error en la conexión con la base de datos: " + error.message + ". Se ha revertido el proceso para proteger los datos.");
    } finally {
      setIsProcessing(false);
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
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`border border-[#00A8E8]/20 bg-black/40 rounded-xl p-4 text-center transition-all cursor-pointer mb-4 ${isProcessing ? 'opacity-50' : 'hover:border-[#00A8E8]/50 hover:bg-[#00A8E8]/5'} flex justify-between items-center group`}
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
      
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <Image src="/logo.png" alt="NeoVox" width={20} height={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase text-white">Volver</span>
      </Link>

      <div className="w-full lg:w-1/2 p-6 pt-24 lg:p-16 flex flex-col justify-center items-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00A8E8]/5 rounded-full blur-[100px] -z-10" />
        
        {step === 1 && (
          <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-bold text-[#00A8E8] tracking-[0.2em] uppercase relative z-10">Paso 1 de 3</span>
            <h1 className="text-2xl font-bold text-white mt-2 mb-4 tracking-tight relative z-10">Parámetros del Nodo</h1>
            <p className="text-gray-400 text-xs leading-relaxed mb-6 relative z-10">
              Estos datos generan tu espacio aislado en la base de datos. Establecen las credenciales de acceso para tu panel de gerencia y definen qué teléfonos móviles recibirán las llamadas del sistema.
            </p>
            
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Contraseña Gerente</label>
                  <input 
                    type="password" 
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    placeholder="********"
                    className="w-full p-4 rounded-xl border border-[#00A8E8]/20 bg-black/50 text-[#00A8E8] focus:border-[#00A8E8] outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-4 tracking-wider">Terminales de Recepción (Comerciales)</label>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10">
                  {agents.map((agent, index) => (
                    <div key={index} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                      <input 
                        placeholder="Nombre completo" 
                        value={agent.full_name}
                        className="w-full p-2.5 rounded-lg border border-[#00A8E8]/10 bg-black/50 text-white text-xs outline-none focus:border-[#00A8E8]"
                        onChange={(e) => updateAgent(index, 'full_name', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder="Móvil 9 dígitos" 
                          value={agent.phone_number}
                          className="w-2/3 p-2.5 rounded-lg border border-[#00A8E8]/10 bg-black/50 text-white text-xs outline-none focus:border-[#00A8E8] font-mono"
                          onChange={(e) => updateAgent(index, 'phone_number', e.target.value)}
                        />
                        <input 
                          placeholder="PIN (4 dígitos)" 
                          maxLength={4}
                          value={agent.pin}
                          className="w-1/3 p-2.5 rounded-lg border border-[#00A8E8]/10 bg-black/50 text-[#00A8E8] text-xs outline-none focus:border-[#00A8E8] font-mono text-center"
                          onChange={(e) => updateAgent(index, 'pin', e.target.value)}
                        />
                      </div>
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

              <button 
                onClick={avanzarAPaso2}
                className="w-full bg-[#00A8E8] text-white font-bold py-5 px-8 rounded-xl shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all uppercase text-[10px] tracking-widest active:scale-[0.98]"
              >
                Siguiente Paso
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-6 relative z-10">
              <span className="text-[10px] font-bold text-[#00A8E8] tracking-[0.2em] uppercase">Paso 2 de 3</span>
              <h1 className="text-2xl font-bold text-white mt-2 mb-3 tracking-tight">
                Validación Trust Hub
              </h1>
              <p className="text-gray-400 text-xs leading-relaxed">
                La normativa de telecomunicaciones exige verificar la identidad de la sociedad para asignar un número de teléfono geográfico real. Los archivos se cifran y almacenan en un servidor seguro sin exposición pública.
              </p>
            </div>
            
            <div className="mb-6 relative z-10">
              <FileUploadBlock title="1. CIF Sociedad" file={cifFile} inputRef={cifInputRef} onChange={handleFileChange(setCifFile)} />
              <FileUploadBlock title="2. DNI Administrador" file={dniFile} inputRef={dniInputRef} onChange={handleFileChange(setDniFile)} />
              <FileUploadBlock title="3. Recibo Suministro" file={receiptFile} inputRef={receiptInputRef} onChange={handleFileChange(setReceiptFile)} />
            </div>

            <div className="flex items-start gap-3 mt-4 mb-6 p-4 bg-[#00A8E8]/5 border border-[#00A8E8]/10 rounded-xl relative z-10">
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

            <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setStep(1)}
                disabled={isProcessing}
                className="w-1/3 border border-white/10 text-white font-bold py-5 rounded-xl hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest disabled:opacity-50"
              >
                Volver
              </button>
              <button 
                onClick={procesarAltaCompleta}
                disabled={isProcessing}
                className="w-2/3 bg-[#00A8E8] text-white font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all uppercase text-[10px] tracking-widest disabled:opacity-50 active:scale-[0.98]"
              >
                {isProcessing ? "Escribiendo en base de datos..." : "Cifrar y Finalizar"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="w-16 h-16 bg-[#00A8E8]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00A8E8] border border-[#00A8E8]/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            
            <span className="text-[10px] font-bold text-[#00A8E8] tracking-[0.2em] uppercase">Paso 3 de 3</span>
            <h1 className="text-2xl font-bold text-white mt-2 mb-4 tracking-tight">Ensamblaje Final</h1>
            
            <p className="text-gray-400 text-xs leading-relaxed mb-8">
              La base de datos está montada y los archivos legales asegurados. Tu parte está terminada. Reserva ahora tu ventana técnica de 20 minutos; en esa sesión configuraremos la pasarela de pago, conectaremos tu correo original a nuestra red y haremos la primera prueba de estrés en directo.
            </p>

            <a 
              href="https://calendly.com/victorrojasfranco/instalacion-neovox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full bg-[#00A8E8] text-white font-bold py-5 px-8 rounded-xl shadow-[0_0_20px_rgba(0,168,232,0.3)] hover:bg-[#0090C8] transition-all uppercase text-[10px] tracking-widest active:scale-[0.98]"
            >
              Agendar Sesión Técnica
            </a>
          </div>
        )}
      </div>

      <div className="w-full lg:w-1/2 bg-black/50 p-6 lg:p-16 flex flex-col justify-center items-center text-white relative overflow-hidden border-l border-white/5 hidden lg:flex">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#00A8E8]/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10 bg-[#121212]/80 border border-[#00A8E8]/20 backdrop-blur-xl p-10 rounded-3xl max-w-md shadow-[0_0_50px_rgba(0,168,232,0.05)]">
          <div className="w-12 h-12 bg-[#00A8E8]/10 rounded-xl flex items-center justify-center mb-6 text-[#00A8E8]">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Cifrado de Extremo a Extremo</h2>
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
              <p className="text-[11px] text-gray-400 font-medium">Validación directa con operadoras de telefonía (Trust Hub).</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}