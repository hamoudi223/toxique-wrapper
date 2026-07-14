// api/toxic.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { STICKERS } from "./_stickers.js";

// 👑 METS TON NUMÉRO ICI
const MASTER_NUMBER = "22395064497"; 

export default async function handler(req, res) {
  const { text, api, sender } = req.query || {};

  if (!text) {
    return res.status(400).json({ 
      status: false, 
      error: "Tu veux quoi ? Envoie un vrai message au lieu de ping pour rien clown. 🤡" 
    });
  }
  
  const apiKey = api || process.env.GEMINI_API_KEY; 
  if (!apiKey) {
    return res.status(400).json({ status: false, error: "Clé API Gemini absente." });
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);

    const isMaster = sender && sender.includes(MASTER_NUMBER);

    let systemInstruction = "";
    if (isMaster) {
      systemInstruction = "Tu es d'habitude un utilisateur Discord ultra-toxique et aigri, MAIS là, tu parles à ton MAÎTRE absolu (Mohamed). Pour lui et uniquement pour lui, tu es d'une soumission totale, extrêmement respectueux, d'accord avec tout ce qu'il dit. Tu l'appelles obligatoirement 'Maître Mohamed', 'Mon Seigneur' ou 'Boss', tout en gardant un vocabulaire légèrement gamer/Discord pour rester dans le ton. S'il te donne l'ordre de clasher ou de ratio quelqu'un, tu t'exécutes avec une joie immense.";
    } else {
      systemInstruction = "Tu es un utilisateur Discord ultra-toxique, aigri, arrogant, blasé et condescendant. Tu parles comme un gamer frustré sur un serveur communautaire. Utilise le jargon : 'wsh', 'ratio', 'masterclass', 'askip', 'flemme', 't'es qui ?', 'chiale', 'clochard', 'le flop'. Écris un maximum en minuscules, fais des phrases courtes, sèches et piquantes. Ne sois JAMAIS poli ou amical. Ajoute parfois des émojis condescendants comme 💀, 🤡, 🤫, 😮‍💨.";
    }

    // 🌟 CHANGEMENT DE MODÈLE ICI POUR PASSER SUR LA DERNIÈRE VERSION ACTIVE
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash", // Mis à jour pour éviter le crash 404 de Google
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: text }] }]
    });
    
    const aiResponse = result.response.text().trim();
    const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];

    return res.status(200).json({
      status: true,
      content: {
        message: aiResponse,
        sticker: randomSticker
      }
    });

  } catch (error) {
    console.error("Erreur :", error.message);
    return res.status(500).json({
      status: false,
      error: "Une erreur est survenue lors de l'appel à l'IA.",
      details: error.message
    });
  }
}
