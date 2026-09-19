// src/lib/googleCalendar.ts

export interface GoogleCalendarEventPayload {
  summary: string;       // ex: "Corte de Cabelo - Cliente X"
  description: string;   // ex: "Barbeiro: João | Serviço: Corte Degradê"
  startDateTime: string; // ISO String: "2026-09-20T10:00:00-03:00"
  endDateTime: string;   // ISO String: "2026-09-20T10:45:00-03:00"
  clientEmail?: string;
}

/**
 * Função stub/preparada para integração com a Google Calendar API.
 * Quando tiver as credenciais (OAuth Client ID / Service Account / Supabase Edge Function),
 * basta descomentar e ajustar o endpoint.
 */
export async function syncAppointmentToGoogleCalendar(payload: GoogleCalendarEventPayload): Promise<boolean> {
  try {
    console.log('[Google Calendar Integration] Payload pronto para envio:', payload);

    // TODO: Descomentar e configurar quando possuir as credenciais da API / Edge Function
    /*
    const response = await fetch('YOUR_SUPABASE_EDGE_FUNCTION_OR_API_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Falha ao sincronizar com Google Agenda');
    }
    */

    return true;
  } catch (error) {
    console.error('[Google Calendar Integration Error]:', error);
    // Não travamos o fluxo do usuário se a agenda falhar, apenas registramos
    return false;
  }
}