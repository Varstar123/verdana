import { NextResponse } from "next/server";
import { requireWriter } from "@/lib/session";
import { findTask, findQuest } from "@/lib/quests";
import { reviewQuestPhoto, type ReviewResult } from "@/lib/quest-review";

export const runtime = "nodejs";

// The image is already downscaled client-side; this is a generous safety cap.
const MAX_BYTES = 6 * 1024 * 1024;

function reply(result: ReviewResult, status = 200) {
  return NextResponse.json(result, { status });
}

export async function POST(request: Request): Promise<Response> {
  // Only signed-in users (or the local demo) may spend AI-review calls.
  try {
    await requireWriter();
  } catch {
    return reply({ status: "error", reason: "Please sign in to submit a task." }, 401);
  }

  try {
    const form = await request.formData();
    const kind = form.get("kind");
    const image = form.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return reply({ status: "error", reason: "No photo received — please try again." });
    }
    if (image.size > MAX_BYTES) {
      return reply({ status: "unsure", reason: "That photo's a little large — please try again." });
    }

    // Resolve WHAT the photo must show from the trusted catalog — never from the
    // client — so a user can't relabel a task to earn easy points.
    let taskLabel: string;
    let taskDetail: string;

    if (kind === "task") {
      const task = findTask(String(form.get("taskId") ?? ""));
      if (!task) return reply({ status: "error", reason: "Unknown task." });
      taskLabel = task.title;
      taskDetail = task.description;
    } else if (kind === "step") {
      const quest = findQuest(String(form.get("questId") ?? ""));
      const step = quest?.steps.find((s) => s.id === String(form.get("stepId") ?? ""));
      if (!quest || !step) return reply({ status: "error", reason: "Unknown quest step." });
      taskLabel = `${quest.title} — ${step.title}`;
      taskDetail = `This is a step in the "${quest.title}" quest. The user should ${step.title.toLowerCase()}.`;
    } else {
      return reply({ status: "error", reason: "Bad request." });
    }

    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    const result = await reviewQuestPhoto({
      taskLabel,
      taskDetail,
      mediaType: image.type,
      base64,
    });
    return reply(result);
  } catch {
    return reply({ status: "error", reason: "Something went wrong — please try again." });
  }
}
