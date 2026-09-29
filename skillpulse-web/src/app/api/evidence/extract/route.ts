import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromText, mapSkillsToCanonical } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    // 1. Run NER extraction
    const extractRes = await extractSkillsFromText(text);

    // 2. Map raw skill entities to canonical taxonomy
    const rawSkills = extractRes.entities
      .filter((e) => e.label === "SKILL" || e.label === "TECH")
      .map((e) => e.text);

    const mapRes = await mapSkillsToCanonical(rawSkills);

    return NextResponse.json({
      entities: extractRes.entities,
      mappings: mapRes.mappings,
      model_version: extractRes.model_version,
      inference_time_ms: extractRes.inference_time_ms + mapRes.inference_time_ms,
    });
  } catch (error) {
    console.error("Evidence extraction error:", error);
    return NextResponse.json({ error: "Failed to extract entities" }, { status: 500 });
  }
}
