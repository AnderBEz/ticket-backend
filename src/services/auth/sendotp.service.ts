import transporter from "../../utils/sendemail.js";

export const sendOtp = async (otp_code: string, email_to: string) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_USERNAME,
            to: email_to,
            subject: "Tu código de acceso — TickMe!",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Código de acceso TickMe!</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);width:44px;height:44px;border-radius:12px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:20px;font-weight:900;line-height:44px;">T</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">TickMe!</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(145deg,#13131f,#0f0f1a);border:1px solid rgba(124,58,237,0.2);border-radius:20px;padding:40px 36px;">

              <!-- Heading -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0;color:#a855f7;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Verificación de identidad</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;letter-spacing:-0.5px;">Tu código de acceso</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:32px;">
                    <p style="margin:0;color:#8b8b9a;font-size:15px;line-height:1.6;">
                      Usa el siguiente código para acceder a tu cuenta. Expira en <span style="color:#e2e2f0;font-weight:600;">5 minutos</span>. No lo compartas con nadie.
                    </p>
                  </td>
                </tr>

                <!-- OTP Box -->
                <tr>
                  <td style="padding-bottom:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08));border:1px solid rgba(124,58,237,0.35);border-radius:14px;padding:28px;text-align:center;">
                          <p style="margin:0 0 6px 0;color:#8b8b9a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Código OTP</p>
                          <p style="margin:0;color:#ffffff;font-size:42px;font-weight:900;letter-spacing:14px;font-variant-numeric:tabular-nums;">${otp_code}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Warning -->
                <tr>
                  <td style="padding-bottom:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:10px;padding:14px 16px;">
                          <p style="margin:0;color:#ca8a04;font-size:13px;line-height:1.5;">
                            ⚠️ Si no solicitaste este código, ignora este correo. Tu cuenta sigue segura.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
                    <p style="margin:0;color:#4b4b5a;font-size:12px;line-height:1.6;text-align:center;">
                      Este correo fue enviado automáticamente por TickMe! · No respondas a este mensaje.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#2e2e3a;font-size:12px;">© 2025 TickMe! · Todos los derechos reservados</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
            `
        });
    } catch (error) {
        console.error("error", error);
        throw new Error("Error al enviar el correo");
    }
};