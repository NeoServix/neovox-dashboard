"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase"; 

export default function Home() {
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
    
    setIsUploading(true);
    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: "Pendiente de configuración" }])
        .select()
        .single();

      if (orgError) throw orgError;

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

        if (uploadError) throw uploadError;
      }

      setOrgId(org.id);
      setStep(2);
    } catch (error: any) {
      alert("Error en la conexión con el búnker: " + error.message);
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

    // Filtro de limpieza para los números de teléfono
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

    // Eliminamos la variable temporal raw_length antes de subir a base de datos
    const finalAgents = processedAgents.map(({ raw_length, ...rest }) => rest);

    setIsUploading(true);
    try {
      await supabase
        .from('organizations')
        .update({ 
          name: agencyName,
          contact_email: contactEmail,
          sector: "Inmobiliaria" // Etiqueta estática inyectada por defecto
        })
        .eq('id', orgId);

      const { error } = await supabase.from('agents').insert(finalAgents);

      if (error) throw error;

      alert("Configuración terminada. El nodo NeoVox ya está activo.");
      window.location.reload(); 
    } catch (e: any) {
      alert("Fallo al conectar el equipo: " + e.message);
    } finally {
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
      className={`border border-dashed border-white/20 bg-white/5 rounded-xl p-4 text-center transition-all cursor-pointer mb-4 ${isUploading ? 'opacity-50' : 'hover:border-white/40'} flex justify-between items-center`}
    >
      <input 
        type="file" 
        ref={inputRef as React.RefObject<HTMLInputElement>} 
        className="hidden" 
        accept=".pdf,image/*" 
        onChange={onChange} 
      />
      <span className="text-xs font-bold text-white">{title}</span>
      <span className="text-xs text-gray-400 truncate max-w-37.5">
        {file ? file.name : "Subir archivo"}
      </span>
    </div>
  );

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-[#0A0A0A] font-sans text-gray-200">
      
      {/* PANEL IZQUIERDO: Interactivo */}
      <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center items-center">
        
        {step === 1 ? (
          <div className="max-w-md w-full">
            <div className="mb-8">
              <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Paso 1 de 2</span>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2 mb-4 tracking-tight">
                Validación Legal
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cargue los tres documentos exigidos por la normativa de telecomunicaciones para activar sus terminales.
              </p>
            </div>
            
            <div className="mb-6">
              <FileUploadBlock 
                title="1. CIF de la Sociedad" 
                file={cifFile} 
                inputRef={cifInputRef} 
                onChange={handleFileChange(setCifFile)} 
              />
              <FileUploadBlock 
                title="2. DNI Administrador" 
                file={dniFile} 
                inputRef={dniInputRef} 
                onChange={handleFileChange(setDniFile)} 
              />
              <FileUploadBlock 
                title="3. Recibo de Suministro" 
                file={receiptFile} 
                inputRef={receiptInputRef} 
                onChange={handleFileChange(setReceiptFile)} 
              />
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-white text-black font-bold py-5 px-8 rounded-xl shadow-lg hover:bg-gray-200 transition-all uppercase text-[10px] tracking-widest disabled:opacity-50"
            >
              {isUploading ? "Cifrando documentos..." : "Validar y Continuar"}
            </button>
          </div>
        ) : (
          <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Paso 2 de 2</span>
            <h1 className="text-3xl font-bold text-white mt-2 mb-8 tracking-tight">Configura tu Búnker</h1>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Nombre de la Sociedad</label>
                <input 
                  type="text" 
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ej: Inmobiliaria Madrid Norte"
                  className="w-full p-4 rounded-xl border border-white/20 bg-black/50 text-white focus:border-white outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Correo para alertas</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="gerencia@inmobiliaria.com"
                  className="w-full p-4 rounded-xl border border-white/20 bg-black/50 text-white focus:border-white outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-4">Listado de Comerciales (Móvil)</label>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4">
                  {agents.map((agent, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        placeholder="Nombre completo" 
                        className="w-1/2 p-3 rounded-lg border border-white/20 bg-black/50 text-white text-sm outline-none focus:border-white"
                        onChange={(e) => updateAgent(index, 'full_name', e.target.value)}
                      />
                      <input 
                        placeholder="Ej: 612 345 678" 
                        className="w-1/2 p-3 rounded-lg border border-white/20 bg-black/50 text-white text-sm outline-none focus:border-white"
                        onChange={(e) => updateAgent(index, 'phone_number', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addAgentRow}
                  className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                >
                  + Añadir otro terminal
                </button>
              </div>

              <div className="flex items-start gap-3 mt-4 mb-2">
                <input
                  type="checkbox"
                  id="legal"
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-white checked:border-white focus:ring-0 cursor-pointer"
                />
                <label htmlFor="legal" className="text-xs text-gray-400 cursor-pointer leading-tight">
                  He leído y acepto los <Link href="/legal" target="_blank" className="text-[#00A8E8] hover:underline hover:text-white transition-colors">Términos de Servicio y el Acuerdo de Procesamiento de Datos (DPA)</Link>. Asumo mi responsabilidad como Responsable del Tratamiento de los datos aportados.
                </label>
              </div>

              <button 
                onClick={handleFinalize}
                disabled={isUploading}
                className="w-full bg-white text-black font-bold py-5 px-8 rounded-xl shadow-xl hover:bg-gray-200 transition-all uppercase text-[10px] tracking-widest disabled:opacity-50"
              >
                {isUploading ? "Conectando terminales..." : "Activar Protocolo NeoVox"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PANEL DERECHO: Institucional */}
      <div className="w-full lg:w-1/2 bg-black p-6 lg:p-16 flex flex-col justify-center items-center text-white relative overflow-hidden border-l border-white/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="relative z-10 border border-white/10 bg-white/5 backdrop-blur-md p-8 lg:p-12 rounded-4xl max-w-md shadow-2xl">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 tracking-tight">Control del ROI</h2>
          <p className="text-gray-400 text-xs lg:text-sm leading-relaxed mb-6">
            El sistema de enrutamiento procesa cada lead de entrada en milisegundos; bloquea las interrupciones y asigna el tráfico al terminal adecuado.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">LATENCY</span>
              <p className="text-[10px] text-gray-400">Menos de 20 segundos de respuesta garantizada.</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">PRIVACY</span>
              <p className="text-[10px] text-gray-400">Cifrado continuo en cada interacción de voz y datos.</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}