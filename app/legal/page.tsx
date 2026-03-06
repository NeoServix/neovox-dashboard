export default function Legal() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-[#00A8E8] selection:text-white py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 p-8 lg:p-12 rounded-2xl backdrop-blur-sm shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight border-b border-white/10 pb-6">
          Términos de Servicio y Acuerdo de Procesamiento de Datos (DPA)
        </h1>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">TÍTULO I: TÉRMINOS DE SERVICIO (ToS)</h2>
            
            <h3 className="text-white font-bold mt-4 mb-2">Artículo 1. Objeto del Servicio</h3>
            <p>NeoVox presta un servicio de enrutamiento de llamadas diseñado para agencias inmobiliarias. El sistema recibe datos de clientes potenciales; genera una síntesis en formato de texto y transforma esta información en un aviso de voz privado. Este aviso se emite al agente inmobiliario a través de la infraestructura de Twilio antes de conectar la llamada con el cliente. La conversión y el procesamiento de los datos utilizan la API de Groq.</p>

            <h3 className="text-white font-bold mt-4 mb-2">Artículo 2. Limitaciones Técnicas y de Privacidad</h3>
            <p>El sistema opera bajo restricciones técnicas estrictas para asegurar la privacidad de las comunicaciones. NeoVox no graba, transcribe ni procesa el audio de la conversación telefónica entre el usuario y el agente inmobiliario. La inteligencia artificial actúa de forma exclusiva como una herramienta de síntesis interna. El motor de IA nunca emite voz ni interactúa con el usuario final de la agencia.</p>

            <h3 className="text-white font-bold mt-4 mb-2">Artículo 3. Cancelación y Retención de Datos</h3>
            <p>La agencia tiene la capacidad de cancelar la suscripción al servicio en el momento que decida. Al tramitar la baja, el protocolo de borrado automático entra en acción. NeoVox elimina todos los registros operativos y los datos de conexión alojados en sus servidores de forma permanente.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 pt-6 border-t border-white/10">TÍTULO II: ACUERDO DE PROCESAMIENTO DE DATOS (DPA)</h2>
            
            <h3 className="text-white font-bold mt-4 mb-2">Artículo 1. Definición de Roles</h3>
            <p>Según la normativa del RGPD europeo, la agencia inmobiliaria asume la figura legal de Responsable del Tratamiento de los datos de sus clientes. NeoVox opera estrictamente bajo la figura de Encargado del Tratamiento; limitando sus funciones al enrutamiento de la información y la ejecución de la infraestructura técnica.</p>

            <h3 className="text-white font-bold mt-4 mb-2">Artículo 2. Uso Efímero de Datos</h3>
            <p>NeoVox procesa el nombre, el teléfono y el motivo de contacto de los usuarios finales sin almacenarlos para fines comerciales propios. Los datos transitan por el sistema de forma temporal y exclusiva para conectar la llamada y emitir el aviso de voz al comercial.</p>

            <h3 className="text-white font-bold mt-4 mb-2">Artículo 3. Subencargados Autorizados</h3>
            <p>La agencia inmobiliaria autoriza a NeoVox a subcontratar partes del procesamiento a los siguientes proveedores técnicos:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Twilio:</strong> Para la gestión de la red de telecomunicaciones y la transmisión del aviso de voz privado.</li>
              <li><strong>Groq:</strong> Para el procesamiento del texto y la síntesis de datos mediante su API.</li>
            </ul>
            <p className="mt-2">NeoVox asegura que ambos Subencargados operan bajo marcos legales compatibles con las exigencias del RGPD.</p>

            <h3 className="text-white font-bold mt-4 mb-2">Artículo 4. Medidas de Seguridad y Fin del Contrato</h3>
            <p>NeoVox aplica las configuraciones de seguridad necesarias para proteger el tránsito de información entre la recepción del contacto y la emisión de la llamada. Al finalizar la relación comercial, el sistema ejecuta el borrado absoluto de los registros según el protocolo detallado en el Artículo 3 de los Términos de Servicio.</p>

            <h3 className="text-white font-bold mt-4 mb-2">Artículo 5. Responsabilidad de Captación</h3>
            <p>La agencia asume la obligación íntegra de informar a sus usuarios finales en su Política de Privacidad sobre el envío de datos a NeoVox para la gestión de llamadas y la generación de avisos de voz. La agencia garantiza que cuenta con la base legal necesaria antes de enviar dicha información al sistema. NeoVox queda exento de toda responsabilidad si la agencia omite esta declaración en sus formularios web o canales de entrada. La responsabilidad de obtener el consentimiento recae por completo en el Responsable del Tratamiento.</p>
          </section>
        </div>
      </div>
    </div>
  );
}