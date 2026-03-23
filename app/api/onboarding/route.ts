import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, agencyName } = await request.json();
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Falta la clave de Resend en el servidor" }, { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "NeoVox <contacto@neovox.app>", 
        to: email,
        reply_to: "contacto@neovox.app",
        subject: `NeoVox: Registro completado para ${agencyName} y preparación técnica`,
        html: `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-w-xl;">
            <h2 style="color: #000;">Registro en proceso de validación</h2>
            <p>Hemos recibido la documentación legal de <strong>${agencyName}</strong>. A partir de este momento, tus archivos entran en nuestro túnel seguro para superar el proceso de verificación en la red de telefonía y poder asignarte un número geográfico.</p>
            
            <p>Para que la sesión técnica que has agendado sea efectiva y dejemos el nodo funcionando en 20 minutos, es imprescindible que tengas preparado lo siguiente durante la videollamada:</p>
            
            <ul style="margin-bottom: 20px;">
              <li style="margin-bottom: 10px;"><strong>Acceso a tu correo principal:</strong> Necesitamos entrar al gestor donde recibes los avisos de los portales (Gmail, Outlook) para montar la regla de desvío automático.</li>
              <li style="margin-bottom: 10px;"><strong>Teléfonos de tu equipo:</strong> Un listado con los números móviles de los agentes que van a recibir las llamadas.</li>
              <li style="margin-bottom: 10px;"><strong>Método de pago:</strong> Una tarjeta para activar la suscripción del plan elegido a través de nuestra pasarela segura.</li>
              <li style="margin-bottom: 10px;"><strong>Dirección de captura de tu CRM (Opcional):</strong> Si usas un software de gestión, ten a mano su correo de entrada de leads. Si no utilizas CRM no hay problema; el sistema funciona de manera independiente y guarda todo el registro en tu nuevo panel.</li>
            </ul>

            <p>Sin estos elementos no podremos completar la conexión de la red.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #666;">
              <em>Si tienes alguna duda técnica antes de la reunión, responde directamente a este correo.</em>
            </p>
          </div>
        `
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fallo en la conexión del correo" }, { status: 500 });
  }
}