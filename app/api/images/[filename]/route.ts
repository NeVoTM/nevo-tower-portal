import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);
    
    const filePath = path.join(process.cwd(), 'data', 'raw', decodedFilename);
    const buffer = await fs.readFile(filePath);
    
    const ext = path.extname(decodedFilename).toLowerCase();
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'image/png';
    
    return new Response(new Uint8Array(buffer), {
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}