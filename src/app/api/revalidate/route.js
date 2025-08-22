import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { secret, slug } = body;

  // Validate secret
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return new NextResponse('Invalid Secret', { status: 401 });
  }

  // Revalidate specific paths based on the slug or content type
  if (slug) {
    revalidatePath(slug);
    return NextResponse.json({ revalidated: true, now: Date.now(), slug });
  } else {
    // If no specific slug, revalidate all relevant paths
    revalidatePath('/');
    revalidatePath('/gallery');
    revalidatePath('/events');
    revalidatePath('/projects');
    return NextResponse.json({ revalidated: true, now: Date.now(), paths: ['/', '/gallery', '/events', '/projects'] });
  }
}