import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/finance-utils";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = { title: "Training & CPD | Astelfin IMS", robots: { index: false, follow: false } };

async function addTraining(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  await prisma.trainingRecord.create({
    data: {
      employeeId:    formData.get("employeeId") as string,
      title:         formData.get("title") as string,
      provider:      (formData.get("provider") as string) || null,
      trainingType:  formData.get("trainingType") as "INTERNAL",
      startDate:     new Date(formData.get("startDate") as string),
      endDate:       formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
      hoursCompleted: formData.get("hours") ? parseFloat(formData.get("hours") as string) : null,
      cpdPoints:     formData.get("cpd") ? parseFloat(formData.get("cpd") as string) : null,
      notes:         (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/astelfin_26/training");
}

async function addQualification(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  await prisma.qualification.create({
    data: {
      employeeId:        formData.get("employeeId") as string,
      title:             formData.get("title") as string,
      institution:       formData.get("institution") as string,
      qualificationType: formData.get("qualificationType") as string,
      awardDate:         formData.get("awardDate") ? new Date(formData.get("awardDate") as string) : null,
    },
  });
  revalidatePath("/astelfin_26/training");
}

export default async function TrainingPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const [employees, trainings, qualifications] = await Promise.all([
    prisma.employee.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.trainingRecord.findMany({
      orderBy: { startDate: "desc" },
      take: 100,
      include: { employee: { select: { name: true } } },
    }),
    prisma.qualification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { employee: { select: { name: true } } },
    }),
  ]);

  // CPD summary by employee
  const cpdByEmp: Record<string, { name: string; points: number; hours: number }> = {};
  for (const t of trainings) {
    if (!cpdByEmp[t.employeeId]) cpdByEmp[t.employeeId] = { name: t.employee.name, points: 0, hours: 0 };
    cpdByEmp[t.employeeId].points += t.cpdPoints ?? 0;
    cpdByEmp[t.employeeId].hours  += t.hoursCompleted ?? 0;
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900">Training & CPD</h1>

      {/* CPD Summary */}
      {Object.keys(cpdByEmp).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">CPD Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(cpdByEmp).map(([empId, data]) => (
              <div key={empId} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 truncate">{data.name}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{data.points.toFixed(1)} pts</p>
                <p className="text-xs text-gray-400">{data.hours.toFixed(1)} hrs</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Training Record */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Log Training</h2>
        <form action={addTraining} className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Employee *</label>
            <select name="employeeId" required className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">— select —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Training Title *</label>
            <input type="text" name="title" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Provider</label>
            <input type="text" name="provider" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select name="trainingType" className="w-full border rounded-lg px-3 py-2 text-sm">
              {["INTERNAL","EXTERNAL","ONLINE","CONFERENCE","WORKSHOP"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
            <input type="date" name="startDate" required min={LAUNCH_DATE} defaultValue={LAUNCH_DATE} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" name="endDate" min={LAUNCH_DATE} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hours</label>
            <input type="number" name="hours" step="0.5" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">CPD Points</label>
            <input type="number" name="cpd" step="0.5" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" name="notes" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-3">
            <button type="submit" className="bg-brand-navy text-white px-5 py-2 rounded-lg text-sm hover:opacity-90">Log Training</button>
          </div>
        </form>
      </section>

      {/* Add Qualification */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Add Qualification</h2>
        <form action={addQualification} className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Employee *</label>
            <select name="employeeId" required className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">— select —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Qualification Title *</label>
            <input type="text" name="title" required placeholder="e.g. BSc Economics" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Institution *</label>
            <input type="text" name="institution" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select name="qualificationType" className="w-full border rounded-lg px-3 py-2 text-sm">
              {["DEGREE","DIPLOMA","CERTIFICATE","PROFESSIONAL","OTHER"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Award Date</label>
            <input type="date" name="awardDate" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-brand-navy text-white px-5 py-2 rounded-lg text-sm hover:opacity-90">Add</button>
          </div>
        </form>
      </section>

      {/* Training Records */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Training Records</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Training</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Hours</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">CPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No training records yet</td></tr>
              )}
              {trainings.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.employee.name}</td>
                  <td className="px-4 py-3">{t.title}{t.provider ? ` · ${t.provider}` : ""}</td>
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

      {/* Qualifications */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Qualifications</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Qualification</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Institution</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {qualifications.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No qualifications on record</td></tr>
              )}
              {qualifications.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{q.employee.name}</td>
                  <td className="px-4 py-3">{q.title}</td>
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
