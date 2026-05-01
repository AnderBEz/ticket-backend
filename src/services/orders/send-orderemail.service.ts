import transporter from "../../utils/sendemail.js";

interface TicketEmailData {
    to: string;
    fullName: string;
    eventName: string;
    venue: string;
    datetime: string;
    seats: string[];
    total: number;
    folio: string;
    qrCodes: string[];
    qrBuffers: Buffer[];
}

export const sendTicketEmail = async (data: TicketEmailData) => {
    const qrSection = data.seats.map((seat, i) => `
        <div style="text-align:center;margin-top:20px;">
            <p style="margin:0 0 8px;color:#8b8b9a;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Asiento ${seat}</p>
            <img src="cid:qr_${i}" width="140" height="140" style="border-radius:8px;border:2px solid rgba(124,58,237,0.3);"/>
        </div>
    `).join("");

    await transporter.sendMail({
        from: process.env.MAIL_USERNAME,
        to: data.to,
        subject: `Tus boletos — ${data.eventName}`,
        attachments: data.qrBuffers.map((buf, i) => ({
            filename: `qr_asiento_${data.seats[i]}.png`,
            content: buf,
            cid: `qr_${i}`,
        })),
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tus boletos — ${data.eventName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);width:44px;height:44px;border-radius:12px;text-align:center;vertical-align:middle;">
              <span style="color:#fff;font-size:20px;font-weight:900;line-height:44px;">T</span>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">TickMe!</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:linear-gradient(145deg,#13131f,#0f0f1a);border:1px solid rgba(124,58,237,0.2);border-radius:20px;padding:40px 36px;">

          <p style="margin:0 0 4px;color:#a855f7;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Confirmación de compra</p>
          <h1 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${data.eventName}</h1>
          <p style="margin:0 0 28px;color:#8b8b9a;font-size:14px;">Hola ${data.fullName}, tu compra fue exitosa.</p>

          <!-- Detalles -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;margin-bottom:24px;">
            <tr>
              <td style="color:#8b8b9a;font-size:14px;padding:8px 0;">📍 Sede</td>
              <td style="color:#e2e2f0;font-size:14px;padding:8px 0;text-align:right;">${data.venue}</td>
            </tr>
            <tr>
              <td style="color:#8b8b9a;font-size:14px;padding:8px 0;">📅 Fecha y hora</td>
              <td style="color:#e2e2f0;font-size:14px;padding:8px 0;text-align:right;">${data.datetime}</td>
            </tr>
            <tr>
              <td style="color:#8b8b9a;font-size:14px;padding:8px 0;">🎟 Asientos</td>
              <td style="color:#e2e2f0;font-size:14px;padding:8px 0;text-align:right;">${data.seats.join(", ")}</td>
            </tr>
            <tr>
              <td style="color:#8b8b9a;font-size:14px;padding:8px 0;">💰 Total pagado</td>
              <td style="color:#a855f7;font-size:14px;font-weight:700;padding:8px 0;text-align:right;">$${data.total} MXN</td>
            </tr>
          </table>

          <!-- Folio -->
          <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:8px;">
            <p style="margin:0 0 6px;color:#8b8b9a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Folio de compra</p>
            <p style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:6px;">${data.folio.toUpperCase().slice(0, 8)}</p>
          </div>

          <!-- QR codes -->
          ${qrSection}

          <!-- Nota -->
          <div style="margin-top:28px;background:rgba(234,179,8,0.06);border:1px solid rgba(234,179,8,0.15);border-radius:10px;padding:14px 16px;">
            <p style="margin:0;color:#ca8a04;font-size:13px;line-height:1.5;">
              ⚠️ Presenta el código QR de tu asiento en la entrada. Este boleto es personal e intransferible.
            </p>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;color:#4b4b5a;font-size:12px;">Este correo fue enviado automáticamente por TickMe! · No respondas a este mensaje.</p>
          <p style="margin:4px 0 0;color:#2e2e3a;font-size:12px;">© 2025 TickMe! · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`,
    });
};