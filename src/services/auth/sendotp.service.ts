import transporter from "../../utils/sendemail.js";

export const sendOtp = async (otp_code: string, email_to: string) => {
    try{
        await transporter.sendMail({
            from: process.env.MAIL_USERNAME,
            to: email_to,
            subject: "Bienvenido a Tikme",
            html: `
            <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Verificación de Cuenta</h2>
                    <p>Hola,</p>
                    <p>Usa el siguiente código para verificar tu identidad. Este código expira en 5 minutos.
                    No compartas este codigo con nadie.
                    </p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                        ${otp_code}
                    </div>
                    <p>Si no solicitaste este código, puedes ignorar este correo.</p>
                </div>
            </body>
        </html>
            `
        });
    }
    catch (error) {
        console.error("error", error);
        throw new Error("Error al enviar el correo");
    }
};