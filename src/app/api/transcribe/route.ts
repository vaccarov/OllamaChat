import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: FormData = await request.formData();
    
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}:${process.env.NEXT_PUBLIC_SERVER_PORT}/transcribe`,
      { method: 'POST', body }
    );

    if (!response.ok) {
      const errorText: string = await response.text();
      return new NextResponse(errorText, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data: any = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in transcribe proxy route:', error);
    return NextResponse.json({ error: 'Failed to proxy request to transcription server', details: errorMessage }, { status: 500 });
  }
}
