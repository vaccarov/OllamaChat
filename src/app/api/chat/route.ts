import { ollama } from '@/lib/ollama';
import { NextRequest, NextResponse } from 'next/server';
import { AbortableAsyncIterator, ChatRequest, ChatResponse } from 'ollama';

export async function POST(request: NextRequest): Promise<Response> {
  const { model, messages }: ChatRequest = await request.json();

  try {
    const stream: AbortableAsyncIterator<ChatResponse> = await ollama.chat({
      model,
      messages,
      stream: true,
    });

    const readableStream: ReadableStream<Uint8Array> = new ReadableStream({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        const encoder: TextEncoder = new TextEncoder();
        for await (const part of stream) {
          controller.enqueue(encoder.encode(JSON.stringify(part) + '\n'));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' }
    });
  } catch (error: unknown) {
    console.error('Error in chat route:', error);
    const details: string = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to connect to Ollama', details }, { status: 500 });
  }
}
