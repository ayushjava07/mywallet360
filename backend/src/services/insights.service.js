import axios from "axios";

function fallbackInsights(analytics) {
  const primaryPersonality = Object.entries(analytics.walletPersonality || analytics.personality).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return {
    summary: `This wallet has ${analytics.transactionCount} transactions in the last ${analytics.period.days} days and $${analytics.netWorth} in currently priced assets.`,
    personalityExplanation: `${primaryPersonality?.[0] || "holder"} is the strongest observed behavior.`,
    riskExplanation: `Risk is ${analytics.riskScore.level.toLowerCase()} based on concentration, behavior, protocol diversity, and wallet age.`,
    insights: [
      `${analytics.moneyFlow.received} ETH received and ${analytics.moneyFlow.spent} ETH sent in the analyzed window.`,
      `${analytics.assets.length} current token holdings were reconstructed from transfer activity.`,
      `${analytics.mostUsedProtocol.name} is the most frequently recognized protocol.`,
    ],
  };
}

export async function generateInsights(analytics) {
  if (!process.env.GROQ_API_KEY) {
    return fallbackInsights(analytics);
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Return JSON with summary, personalityExplanation, riskExplanation, and insights containing exactly 3 concise strings. Do not invent facts.",
          },
          {
            role: "user",
            content: JSON.stringify({
              netWorth: analytics.netWorth,
              transactionCount: analytics.transactionCount,
              period: analytics.period,
              moneyFlow: analytics.moneyFlow,
              personality: analytics.personality,
              riskScore: analytics.riskScore,
              mostUsedProtocol: analytics.mostUsedProtocol,
              topAssets: analytics.topAssets.slice(0, 5),
            }),
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return fallbackInsights(analytics);
  }
}
