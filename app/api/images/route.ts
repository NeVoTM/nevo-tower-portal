import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'miami';
    
    const dataDir = path.join(process.cwd(), 'data', city);
    const files = await fs.readdir(dataDir);
    
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
    );
    
    return NextResponse.json({ images: imageFiles });
  } catch (_error) {
    console.error('Error loading images:', _error);
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 });
  }
}