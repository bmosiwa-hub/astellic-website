import type { NextApiRequest, NextApiResponse } from "next";
// import prisma from "@/lib/prisma";
// import { getSession } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const employeeId = String(req.query.id);
  if (req.method === "GET") {
    // List leave requests for an employee (with RBAC check)
    // const session = await getSession(req);
    // authorize: session.user.id === employee.userId || session.user.role in ["hr","manager"]
    // const requests = await prisma.leaveRequest.findMany({ where: { employeeId }, include: { leaveType: true } });
    // return res.status(200).json(requests);
    return res.status(200).json({ message: "List leave requests (stub)" });
  }
  if (req.method === "POST") {
    // Create a leave request
    // const { startDate, endDate, leaveTypeId, notes } = req.body;
    // calculate days (server-side) and validate overlap / balance
    // const days = calculateDays(startDate, endDate);
    // const lr = await prisma.leaveRequest.create({ data: { employeeId, startDate: new Date(startDate), endDate: new Date(endDate), days, leaveTypeId, notes } });
    // return res.status(201).json(lr);
    return res.status(201).json({ message: "Create leave request (stub)" });
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
