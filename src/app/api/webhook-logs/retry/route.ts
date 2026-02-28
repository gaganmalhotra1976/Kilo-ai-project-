import { NextRequest, NextResponse } from "next/server";
// import { retryWebhook } from "@/lib/webhooks";

// Stub function to prevent build errors
async function retryWebhook(_webhookLogId: any) { 
  console.log("Webhook stub: retryWebhook", _webhookLogId); 
  return false;
}

// POST /api/webhook-logs/retry — retry a failed webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookLogId } = body;

    if (!webhookLogId) {
      return NextResponse.json(
        { error: "Missing required field: webhookLogId" },
        { status: 400 }
      );
    }

    const success = await retryWebhook(webhookLogId);
    
    return NextResponse.json({ success });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to retry webhook" }, { status: 500 });
  }
}
