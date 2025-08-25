// app/api/search/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import xai from '@/lib/xai';

type Doc = { id: string; title: string; text: string };
type RankedDoc = { doc: Doc; score: number | number[] };

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

async function rankByEmbeddings(query: string, corpus: Doc[]): Promise<RankedDoc[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, falling back to keyword ranking');
    return rankByKeywords(query, corpus);
  }
  // Dynamic import to avoid build-time evaluation
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryVector = queryEmbedding.data[0].embedding;

  const corpusVectors = await Promise.all(
    corpus.map(async (doc) => {
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: doc.text,
      });
      return { doc, vector: embedding.data[0].embedding };
    })
  );

  return corpusVectors
    .map(({ doc, vector }) => {
      const score = cosineSimilarity(queryVector, vector);
      return { doc, score };
    })
    .filter((r) => r.score > 0.1) // Threshold for relevance
    .sort((a, b) => b.score - a.score);
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

// Cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

export async function POST(req: Request) {
  try {
    const { query, topK = 3 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load corpus
    const corpus = await loadCorpus();

    // Rank documents
    let ranked: RankedDoc[];
    if (process.env.OPENAI_API_KEY) {
      ranked = await rankByEmbeddings(query, corpus);
    } else {
      console.log('Using keyword-based ranking due to missing OPENAI_API_KEY');
      ranked = await rankByKeywords(query, corpus);
    }

    // Prepare context
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
        score: Number((typeof m.score === 'number' ? m.score : m.score[0]).toFixed(3)),
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}