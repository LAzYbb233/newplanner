import { NextRequest, NextResponse } from "next/server";
import { analyzeContent, getMockAnalysisResult } from "@/lib/deepseek";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.log("DeepSeek API key not configured, using mock response");
      const mockResult = getMockAnalysisResult(content);
      return NextResponse.json(mockResult);
    }

    const result = await analyzeContent(content, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis API error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("DeepSeek API error")) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable" },
          { status: 503 }
        );
      }
      if (error.message.includes("Failed to parse")) {
        const body = await request.clone().json().catch(() => ({ content: "" }));
        const mockResult = getMockAnalysisResult(body.content || "");
        return NextResponse.json(mockResult);
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
