import { verifyRequestOrigin } from 'lucia';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { originAllowlist } from './shared/env';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log(request.url);

  if (request.method === 'GET') {
    return NextResponse.next();
  }
  const originHeader = request.headers.get('Origin');
  if (!originHeader || !verifyRequestOrigin(originHeader, originAllowlist)) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return NextResponse.next();
}
