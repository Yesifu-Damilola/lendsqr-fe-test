import { NextResponse, type NextRequest } from "next/server";
import {
  buildUserDetailData,
  getMockUserRowById,
} from "@/data/mockUsersSeed";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const row = getMockUserRowById(id);
  if (!row) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  return NextResponse.json(buildUserDetailData(row));
}
