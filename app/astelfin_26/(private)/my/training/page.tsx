import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/finance-utils";

export const metadata = { title: "My Training | Astelfin IMS", robots: { index: false, follow: false } };

export default async function MyTrainingPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true } });
  const employeeId = user?.employeeId;

  const [trainings, qualifications] = await Promise.all([
    employeeId ? prisma.trainingRecord.findMany({
      where:   { employeeId },
      orderBy: { startDate: "desc" },
    }) : Promise.resolve([]),
    employeeId ? prisma.qualification.findMany({
      where:   { employeeId },
      orderBy: { awardDate: "desc" },
    }) : Promise.resolve([]),
  ]);

  const totalCPD   = trainings.reduce((s, t) => s + (t.cpdPoints ?? 0), 0);
  const totalHours = trainings.reduce((s, t) => s + (t.hoursCompleted ?? 0), 0);

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">My Training & CPD</h1>

      {!employeeId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Your account is not linked to an employee record.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Total CPD Points</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCPD.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Training Hours</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalHours.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Qualifications</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{qualifications.length}</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Training History</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Training</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Hours</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">CPD Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainings.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No training records yet</td></tr>
              )}
              {trainings.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.title}{t.provider ? ` · ${t.provider}` : ""}</td>
                  <td className="px-4 py-3 text-gray-500">{t.trainingType}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(t.startDate)}</td>
                  <td className="px-4 py-3 text-right">{t.hoursCompleted ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{t.cpdPoints ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">My Qualifications</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Qualification</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Institution</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {qualifications.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No qualifications on record</td></tr>
              )}
              {qualifications.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{q.title}</td>
                  <td className="px-4 py-3 text-gray-500">{q.institution}</td>
                  <td className="px-4 py-3 text-gray-500">{q.qualificationType}</td>
                  <td className="px-4 py-3 text-gray-500">{q.awardDate ? formatDate(q.awardDate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
