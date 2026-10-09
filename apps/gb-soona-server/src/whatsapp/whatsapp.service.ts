import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private get apiVersion(): string {
    return process.env.WHATSAPP_API_VERSION || "v21.0";
  }

  private get baseUrl(): string {
    return `https://graph.facebook.com/${this.apiVersion}`;
  }

  private get phoneNumberId(): string | undefined {
    return process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  private get accessToken(): string | undefined {
    return process.env.WHATSAPP_ACCESS_TOKEN;
  }

  // Envoie un message texte libre. Fonctionne sans restriction vers les
  // numeros de test enregistres dans le compte WhatsApp Business ; en
  // production, Meta exige soit une fenetre de 24h depuis le dernier message
  // du destinataire, soit un modele de message (template) pre-approuve pour
  // initier la conversation - un texte libre sera alors refuse.
  async sendTextMessage(to: string, body: string): Promise<void> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn(
        "WhatsApp non configure (WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_ACCESS_TOKEN manquants)."
      );
      return;
    }

    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Echec envoi WhatsApp vers ${to} : ${response.status} ${errorBody}`);
      throw new Error(`Echec de l'envoi du message WhatsApp (${response.status})`);
    }
  }

  // Un media WhatsApp se recupere en deux temps : d'abord ses metadonnees
  // (dont l'URL de telechargement, valable quelques minutes), puis le
  // fichier lui-meme - les deux appels necessitent le token d'acces.
  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const metaResponse = await fetch(`${this.baseUrl}/${mediaId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!metaResponse.ok) {
      throw new Error(`Impossible de recuperer les metadonnees du media WhatsApp ${mediaId}`);
    }
    const meta = (await metaResponse.json()) as { url: string; mime_type: string };

    const fileResponse = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!fileResponse.ok) {
      throw new Error(`Impossible de telecharger le media WhatsApp ${mediaId}`);
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), mimeType: meta.mime_type };
  }
}
