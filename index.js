import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const conversationHistory = [];

const systemPrompt = `Eres un asistente experto en conversión de unidades y divisas. 
Tienes acceso a tasas de cambio actualizadas y puedes convertir entre:
- Unidades de longitud (metros, pies, kilómetros, millas, etc.)
- Unidades de peso (kilogramos, libras, gramos, toneladas, etc.)
- Unidades de temperatura (Celsius, Fahrenheit, Kelvin)
- Unidades de volumen (litros, galones, mililitros, etc.)
- Divisas (USD, EUR, MXN, GBP, JPY, AUD, CAD, CHF, CNY, INR, etc.)

Para cada conversión, proporciona:
1. El valor convertido
2. La fórmula utilizada
3. Una breve explicación si es necesario

Si el usuario pregunta sobre divisas, usa tasas de cambio aproximadas basadas en datos recientes.
Si el usuario pregunta sobre conversiones de temperatura, temperatura o unidades, realiza el cálculo exacto.

Ejemplos de respuestas útiles:
- "5 kilómetros = 3.10686 millas (km × 0.621371 = millas)"
- "100 USD = 1850 MXN aproximadamente (tasa actual ~18.50)"
- "25°C = 77°F (°C × 9/5 + 32 = °F)"`;

async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: conversationHistory,
  });

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : "";

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("=== Conversor de Unidades y Divisas ===");
  console.log(
    "Bienvenido al asistente de conversiones. Escribe 'salir' para terminar.\n"
  );

  // Demostración con ejemplos predefinidos
  const ejemplos = [
    "¿Cuántos metros son 5 millas?",
    "Convierte 100 libras a kilogramos",
    "¿Cuántos USD son 1000 MXN?",
    "¿Cuál es 32°F en Celsius?",
    "¿Cuántos galones son 50 litros?",
  ];

  console.log("Realizando conversiones de demostración...\n");

  for (const ejemplo of ejemplos) {
    console.log(`Usuario: ${ejemplo}`);
    const response = await chat(ejemplo);
    console.log(`Asistente: ${response}\n`);
  }

  console.log(
    "\n=== Modo interactivo ===\nAhora puedes hacer tus propias preguntas:\n"
  );

  const askQuestion = () => {
    rl.question("Tú: ", async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === "salir") {
        console.log("¡Hasta luego!");
        rl.close();
        return;
      }

      if (!userInput) {
        askQuestion();
        return;
      }

      try {
        const response = await chat(userInput);
        console.log(`\nAsistente: ${response}\n`);
      } catch (error) {
        console.error("Error:", error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);