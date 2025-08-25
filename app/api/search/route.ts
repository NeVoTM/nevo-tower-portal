// app/api/search/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import xai from '@/lib/xai';

type Doc = { id: string; title: string; text: string };
type RankedDoc = { doc: Doc; score: number };

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadCorpus(): Promise<Doc[]> {
  const corpusPath = path.join(process.cwd(), 'data', 'corpus.json');
  console.log('Loading corpus from:', corpusPath);
  try {
    const data = await fs.readFile(corpusPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load corpus:', error);
    throw new Error('Corpus file not found or invalid');
  }
}

async function rankByKeywords(query: string, corpus: Doc[]): Promise<RankedDoc[]> {
  const queryWords = query.toLowerCase().split(/\s+/);
  return corpus
    .map((doc) => {
      const text = doc.text.toLowerCase();
      const score = queryWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
      return { doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function POST(req: Request) {
  try {
    const { query, topK = 3 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load corpus
    const corpus = await loadCorpus();

    // Rank documents using keyword-based retrieval
    const ranked = await rankByKeywords(query, corpus);

    // Prepare context for Grok
    const context = ranked
      .slice(0, topK)
      .map((r) => `Title: ${r.doc.title}\n${r.doc.text.slice(0, 500)}`)
      .join('\n\n');

    // Generate answer
    let answer = ranked[0]?.doc.text.slice(0, 900) || 'No relevant information found.';
    if (ranked[0] && process.env.XAI_API_KEY) {
      try {
        const completion = await xai.chat.completions.create({
          model: 'grok', // Confirm model name in xAI docs at https://x.ai/api
          messages: [
            {
              role: 'system',
              content: 'You are a query agent that answers questions concisely based on provided documents. Avoid speculative answers.',
            },
            {
              role: 'user',
              content: `Question: ${query}\n\nDocuments:\n${context}\n\nProvide a concise answer based on the documents.`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });
        // Type guard to ensure completion is not null and has the expected structure
        if (completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
          answer = completion.choices[0].message.content.trim();
        } else {
          console.error('Unexpected completion response:', completion);
        }
      } catch (xaiError) {
        console.error('xAI API error:', xaiError);
      }
    }

    return NextResponse.json({
      answer,
      matches: ranked.slice(0, topK).map((m) => ({
        id: m.doc.id,
        title: m.doc.title,
        score: Number(m.score.toFixed(3)),
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}