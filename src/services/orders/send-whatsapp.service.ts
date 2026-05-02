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

    await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM!,
        to: `whatsapp:${normalizedTo}`,
        body: message,
    });
};