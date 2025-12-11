import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/unified-auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import {
  SearchFilters,
  SearchResponse,
  SearchResult,
} from "@/lib/types/search.types";
import { parseSearchQuery } from "@/lib/types/search.types";

// GET /api/search - Universal search endpoint
export async function GET(req: NextRequest) {
  const authResult = await getAuthenticatedUser(req);
  if (!authResult) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = parseSearchQuery(searchParams);

  await connectToDatabase();

  // TODO: This needs to be refactored to use Mongoose models instead of raw MongoDB collections
  return NextResponse.json(
    {
      error:
        "Search endpoint is currently under maintenance. Please use specific search endpoints.",
    },
    { status: 503 }
  );
}