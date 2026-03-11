import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("--> 1. Arranca la tubería de la API");
  try {
    const body = await request.json();
    console.log("--> 2. Datos recibidos del formulario:", body);

    if (!process.env.RESEND_API_KEY) {
      console.log("--> ERROR: El servidor no detecta la clave de Resend");
      return NextResponse.json({ error: "Falta la clave" }, { status: 500 });
    }

    console.log("--> 3. Clave leída, contactando con Resend...");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "NeoVox <contacto@neovox.app>",
        to: body.email,
        subject: `NeoVox: Documentación en revisión para ${body.agencyName}`,
        html: `<p>Hemos registrado la solicitud para ${body.agencyName}.</p>`
      })
    });

    console.log("--> 4. Respuesta de Resend recibida. Código de estado:", res.status);

    if (!res.ok) {
      const errorData = await res.text();
      console.log("--> ERROR de la API de Resend:", errorData);
      return NextResponse.json({ error: errorData }, { status: res.status });
    }

    console.log("--> 5. Fin del proceso, correo enviado con éxito.");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("--> FALLO CRÍTICO EN SERVIDOR:", error.message);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}