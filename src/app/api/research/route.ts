import { runAgent } from "@/agent/orchestrator";
import { AgentStep } from "@/types/briefing";

export async function POST(request: Request) {
  const { topic } = await request.json();

  if (!topic || typeof topic !== "string") {
    return Response.json({ error: "Topic is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`)
        );
      };

      try {
        const onStep = (step: AgentStep) => {
          sendEvent("step", step);
        };

        sendEvent("step", {
          type: "search",
          message: `Starting research on: "${topic}"`,
        });

        const briefing = await runAgent(topic, onStep);
        sendEvent("briefing", briefing);
        sendEvent("done", {});
      } catch (error) {
        sendEvent("error", {
          message:
            error instanceof Error ? error.message : "An error occurred",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
