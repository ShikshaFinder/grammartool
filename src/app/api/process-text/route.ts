import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text, operation } = await request.json();

    let prompt = "";
    switch (operation) {
      case "summarize":
        prompt = `Please summarize the following text:\n${text}`;
        break;
      case "grammar":
        prompt = `Please correct any grammar mistakes in the following text:\n${text}`;
        break;
      case "rewrite":
        prompt = `Please rewrite the following text in a better way while keeping the same meaning:\n${text}`;
        break;
      case "enlarge":
        prompt = `Please expand the following text with more details and explanations:\n${text}`;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || "",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `API request failed: ${errorText || response.statusText}`
      );
    }

    const completion = await response.json();
    return NextResponse.json({
      result:
        completion.candidates[0]?.content?.parts[0]?.text ||
        "No result generated",
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process text" },
      { status: 500 }
    );
  }
}
