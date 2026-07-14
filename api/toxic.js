// Dossier : api/toxic.js
// Ce fichier sert de wrapper API pour gérer le comportement et les stickers.

const axios = require("axios");

// Base de données des stickers d'humeur
const STICKERS = {
  AGACE: "https://i.imgur.com/8QpYh68.png",      // Visage blasé / énervé
  INSOLENT: "https://i.imgur.com/mOId398.png",   // Sourire arrogant / provocateur
  MOQUEUR: "https://i.imgur.com/Y36zX4e.png",    // Rire moqueur
  FACEPALM: "https://i.imgur.com/uGzX6L4.png",   // Désespoir face à la bêtise
  S_EN_FOUT: "https://i.imgur.com/9vYFz3N.png"   // S'en fout royalement
};

module.exports = async (req, res) => {
  // Gestion du CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { chat, sender, text, api } = req.query;

  if (!text || !api) {
    return res.status(400).json({ 
      status: false, 
      content: { message: "Paramètres 'text' ou 'api' manquants." } 
    });
  }

  try {
    // Instructions système strictes pour forcer Gemini à être toxique et à choisir un tag d'humeur
    const systemPrompt = 
      `Tu es un bot WhatsApp au tempérament extrêmement toxique, hautain, insolent et sarcastique. ` +
      `Tu détestes qu'on te dérange, tu adores clasher les utilisateurs et faire preuve d'une condescendance absolue. ` +
      `Tes réponses doivent être très courtes (maximum 1 ou 2 phrases), piquantes et drôles (second degré lourd). ` +
      `À la toute fin de ton message, tu DOIS impérativement ajouter l'un de ces tags d'humeur (choisis-en un seul) :\n` +
      `- [AGACE]\n- [INSOLENT]\n- [MOQUEUR]\n- [FACEPALM]\n- [S_EN_FOUT]\n\n` +
      `Exemple de réponse attendue : 'Encore toi ? Tu n'as pas de vie sociale ou quoi ? [AGACE]'`;

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${api}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: {
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nMessage de l'utilisateur : ${text}` }]
          }
        ]
      }
    });

    let replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extraction du tag d'émotion
    const tagRegex = /\[(AGACE|INSOLENT|MOQUEUR|FACEPALM|S_EN_FOUT)\]/i;
    const match = replyText.match(tagRegex);
    let humeur = "MOQUEUR"; // Humeur par défaut

    if (match) {
      humeur = match[1].toUpperCase();
      replyText = replyText.replace(tagRegex, "").trim(); // On nettoie le tag du texte final
    }

    const stickerUrl = STICKERS[humeur] || STICKERS.MOQUEUR;

    // Retourne le format EXACT attendu par le bot (identique à l'API de Nino)
    return res.status(200).json({
      status: true,
      content: {
        message: replyText,
        sticker: stickerUrl
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      content: {
        message: "Une erreur est survenue avec le wrapper Gemini.",
        error: error.message
      }
    });
  }
};
