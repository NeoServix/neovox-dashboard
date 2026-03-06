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
        subject: `NeoVox: Documentación en revisión para ${agencyName}`,
        html: `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #000;">Documentos recibidos correctamente</h2>
            <p>Hemos registrado la solicitud de conexión de tu nodo en NeoVox para <strong>${agencyName}</strong>.</p>
            <p>Tus documentos legales han entrado en el túnel de validación técnica. Un especialista revisará los datos para certificar la cuenta con la operadora de telefonía. Este proceso tiene un tiempo de resolución estimado de 24 a 48 horas.</p>
            <p>Cuando la conexión esté autorizada, recibirás un correo de confirmación final que incluirá:</p>
            <ul>
              <li>Las instrucciones exactas de acceso a tu panel de control.</li>
              <li>El número de teléfono exclusivo asignado a tu sistema (te recomendamos guardarlo en la agenda de tu equipo móvil).</li>
            </ul>
            <p>El sistema permanecerá en pausa hasta que se complete la validación.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #666;">
              <em>Si tienes alguna duda sobre este proceso técnico, responde directamente a este correo y nuestro equipo te atenderá al instante.</em>
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