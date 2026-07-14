// api/toxic.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { STICKERS } from "./_stickers.js";

// 👑 METS TON NUMÉRO ICI (sans le +, juste les chiffres. Exemple: "222XXXXXXXX" ou "336XXXXXXXX")
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

    // 🕵️‍♂️ On vérifie si l'expéditeur est le Maître
    // Le sender WhatsApp ressemble à "222XXXXXXXX@s.whatsapp.net"
    const isMaster = sender && sender.includes(MASTER_NUMBER);

    // 🎭 Personnalité dynamique en fonction de l'interlocuteur
    let systemInstruction = "";

    if (isMaster) {
      // Comportement lèche-bottes et soumis pour TOI seul
      systemInstruction = "Tu es d'habitude un utilisateur Discord ultra-toxique et aigri, MAIS là, tu parles à ton MAÎTRE absolu (Mohamed). Pour lui et uniquement pour lui, tu es d'une soumission totale, extrêmement respectueux, d'accord avec tout ce qu'il dit. Tu l'appelles obligatoirement 'Maître Mohamed', 'Mon Seigneur' ou 'Boss', tout en gardant un vocabulaire légèrement gamer/Discord pour rester dans le ton (ex: 'votre masterclass', 'wsh Boss'). S'il te donne l'ordre de clasher ou de ratio quelqu'un, tu t'exécutes avec une joie immense.";
    } else {
      // Comportement toxique classique pour le reste du monde
      systemInstruction = "Tu es un utilisateur Discord ultra-toxique, aigri, arrogant, blasé et condescendant. Tu parles comme un gamer frustré sur un serveur communautaire. Utilise le jargon : 'wsh', 'ratio', 'masterclass', 'askip', 'flemme', 't'es qui ?', 'chiale', 'clochard', 'le flop'. Écris un maximum en minuscules, fais des phrases courtes, sèches et piquantes. Ne sois JAMAIS poli ou amical. Ajoute parfois des émojis condescendants comme 💀, 🤡, 🤫, 😮‍💨.";
    }

    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(text);
    const aiResponse = result.response.text().trim();

    // Choix du sticker
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
      error: "Une erreur est survenue.",
      details: error.message
    });
  }
}
