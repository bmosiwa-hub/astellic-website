import React from "react";

export default function LeaveRequestsList({ requests = [] }: { requests?: any[] }) {
  async function decide(id: string, action: "approve" | "reject") {
    await fetch(`/api/leave-requests/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    // TODO: refresh list
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Type</th>
          <th>Dates</th>
          <th>Days</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r: any) => (
          <tr key={r.id}>
            <td>{r.employee?.employeeNo ?? r.employeeId}</td>
            <td>{r.leaveType?.name}</td>
            <td>{new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}</td>
            <td>{r.days}</td>
            <td>{r.status}</td>
            <td>
              {r.status === "pending" && (
                <>
                  <button onClick={() => decide(r.id, "approve")}>Approve</button>
                  <button onClick={() => decide(r.id, "reject")}>Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
