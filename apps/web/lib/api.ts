import { NextResponse } from "next/server";

// The Expo app calls these routes from another origin in development (Expo web on its own port,
// Expo Go on the LAN). Authentication will replace the dev user before this is exposed publicly.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { ...CORS, ...init?.headers } });
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
