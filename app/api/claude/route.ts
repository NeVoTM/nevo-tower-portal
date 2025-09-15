import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, city } = await request.json();

    console.log('Claude API request:', { query, city });

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Context: ${city} development project. Query: ${query}`
        }
      ]
    });

    const content = response.content[0];
    const responseText = content.type === 'text' ? content.text : 'No response generated';

    return NextResponse.json({
      answer: responseText,
      sources: [],
      conversationId: `claude-${Date.now()}`,
      confidence: 0.95,
      processingTime: 500,
      suggestedFollowups: []
    });

  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request with Claude API' },
      { status: 500 }
    );
  }
}