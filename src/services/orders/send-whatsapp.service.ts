import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
);

interface WhatsAppTicketData {
    to: string;
    eventName: string;
    venue: string;
    datetime: string;
    seats: string[];
    total: number;
    folio: string;
}

function normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("521") && digits.length === 13) {
        return `+52${digits.slice(3)}`;
    }

    if (digits.length === 10) {
        return `+52${digits}`;
    }

    if (phone.startsWith("+")) {
        return `+${digits}`;
    }

    return `+${digits}`;
}

export const sendWhatsAppTicket = async (data: WhatsAppTicketData) => {
    const normalizedTo = normalizePhone(data.to);
    const seatsText = data.seats.join(", ");

    const message =
`🎟 *TikMe! — Confirmación de compra*

*${data.eventName}*
📍 ${data.venue}
📅 ${data.datetime}
💺 Asientos: ${seatsText}
💰 Total: $${data.total} MXN

*Folio:* ${data.folio.toUpperCase().slice(0, 8)}

📧 Te enviamos tu boleto con código QR al correo registrado. ¡Revísalo antes de llegar al evento!

¡Disfruta el evento! 🎉`;

    try {
        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM!,
            to: `whatsapp:${normalizedTo}`,
            body: message,
        });
    } catch (error: any) {
        // Códigos de error conocidos de Twilio
        const twilioErrors: Record<number, string> = {
            21211: "Número de teléfono inválido",
            21614: "Número no es WhatsApp o no está registrado",
            21408: "Permiso denegado para esta región",
            63003: "Canal de WhatsApp no disponible",
            63016: "Número no ha activado el sandbox de WhatsApp",
        };

        const msg = twilioErrors[error?.code] ?? `Error desconocido (${error?.code})`;
        console.error(`WhatsApp no entregado a ${normalizedTo}: ${msg}`);

        throw new Error(`WHATSAPP_ERROR: ${msg}`);
    }
};