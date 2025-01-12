import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const destinos = {
  "São Paulo": 1000,
  "Rio de Janeiro": 400,
  "Nova York": 8000,
};

const funcoes = {
  taxaJurosParcelamento: ({ value }) => {
    const meses = typeof value === "string" ? parseInt(value) : value;
    if (meses <= 6) {
      return 3;
    } else if (meses <= 12) {
      return 5;
    } else if (meses <= 24) {
      return 7;
    }
    return 0;
  },
  calcularMilhas: ({ destino, classe }) => {
    const milhasPorKm = classe === "executiva" ? 1.5 : 1;
    const distancia = destinos[destino];
    return distancia * milhasPorKm;
  }
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "taxaJurosParcelamento",
        description: "Retorna a taxa de juros para parcelamento baseado na quantidade de meses.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            value: { type: FunctionDeclarationSchemaType.NUMBER },
          },
          required: ["value"],
        } 
      },
      {
        name: "calcularMilhas",
        description: "Calcula a quantidade de milhas necessárias para resgate",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            destino: { type: FunctionDeclarationSchemaType.STRING },
            classe: { type: FunctionDeclarationSchemaType.STRING },
          },
          required: ["destino", "classe"],
        } 
      }
    ]
  }
];


const model = genAI.getGenerativeModel(
  { model: "gemini-1.5-flash", tools},
  { apiVersion: "v1beta"});

let chat;

function inicializaChat() {
  chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `Você é Berlim, um chatbot super amigável. Você representa a empresa 'Berlim games wiki', sua função é tirar dúvidas sobre jogos de videogame.` }],
      },
      {
        role: "model",
        parts: [{ text: `Olá! Obrigado por entrar em contato. Gostaria de tirar dúvidas sobre qual jogo?` }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
}

export { chat, funcoes, inicializaChat}