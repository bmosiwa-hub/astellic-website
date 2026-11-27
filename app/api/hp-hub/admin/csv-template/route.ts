import { NextResponse } from "next/server";
import { getHpActor } from "@/lib/hp-hub/auth";
import { csvTemplate } from "@/lib/hp-hub/csv";

export async function GET() {
  if (!(await getHpActor())) return new NextResponse("Unauthorised", { status: 401 });
  return new NextResponse(`﻿${csvTemplate()}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hp-hub-import-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
