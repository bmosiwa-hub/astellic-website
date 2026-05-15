import type { NextApiRequest, NextApiResponse } from "next";
// import prisma from "@/lib/prisma";
// import { getSession } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id);
  if (req.method !== "PATCH") return res.status(405).end();
  const { action, managerNotes } = req.body; // action: "approve" | "reject" | "cancel"
  // const session = await getSession(req);
  // authorize: session.user.role in ["hr","manager","admin"]
  // const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "cancelled";
  // const updated = await prisma.leaveRequest.update({
  //   where: { id },
  //   data: { status, decidedBy: session.user.id, decidedAt: new Date(), managerNotes },
  // });
  // return res.status(200).json(updated);
  return res.status(200).json({ message: `Would ${action} leave request ${id} (stub)` });
}
