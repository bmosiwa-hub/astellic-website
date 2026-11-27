import { PageHeader, Panel, Flash, btnPrimary, inputCls, textareaCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { createOutreach } from "@/lib/hp-hub/admin/tracker-actions";
import { RECIPIENT_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "New acquisition request" };

export default async function NewOutreachPage({ searchParams }: { searchParams: Promise<{ itemId?: string; err?: string }> }) {
  await requireHpPage("outreach.manage");
  const sp = await searchParams;
  const [templates, items, item] = await Promise.all([
    prisma.hpRequestTemplate.findMany({ orderBy: { name: "asc" } }),
    prisma.hpAcquisitionItem.findMany({ where: { status: { not: "ACQUIRED" } }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
    sp.itemId ? prisma.hpAcquisitionItem.findUnique({ where: { id: sp.itemId }, select: { id: true, title: true } }) : null,
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New acquisition request"
        back={item ? { href: `/hp-hub/admin/tracker/${item.id}`, label: item.title } : { href: "/hp-hub/admin/outreach", label: "Requests" }}
        description="Pick a template to generate the message (placeholders are filled from the tracker record), or write your own. Send it from your email, then record it here."
      />
      <Flash err={sp.err} />
      <Panel>
        <form action={createOutreach} className="space-y-4">
          <div>
            <label htmlFor="itemId" className="block text-sm font-semibold text-brand-navy mb-1">Document requested</label>
            <select id="itemId" name="itemId" defaultValue={item?.id ?? ""} className={inputCls}>
              <option value="">General request (not tied to one document)</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipientName" className="block text-sm font-semibold text-brand-navy mb-1">Recipient name *</label>
              <input id="recipientName" name="recipientName" required maxLength={200} className={inputCls} />
            </div>
            <div>
              <label htmlFor="recipientOrg" className="block text-sm font-semibold text-brand-navy mb-1">Organisation *</label>
              <input id="recipientOrg" name="recipientOrg" required maxLength={300} className={inputCls} />
            </div>
            <div>
              <label htmlFor="recipientEmail" className="block text-sm font-semibold text-brand-navy mb-1">Email</label>
              <input id="recipientEmail" name="recipientEmail" type="email" maxLength={254} className={inputCls} />
            </div>
            <div>
              <label htmlFor="recipientType" className="block text-sm font-semibold text-brand-navy mb-1">Recipient type</label>
              <select id="recipientType" name="recipientType" defaultValue="MINISTRY" className={inputCls}>
                {Object.entries(RECIPIENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="templateId" className="block text-sm font-semibold text-brand-navy mb-1">Template</label>
              <select id="templateId" name="templateId" defaultValue={templates[0]?.id ?? ""} className={inputCls}>
                <option value="">No template</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reminderDueAt" className="block text-sm font-semibold text-brand-navy mb-1">Reminder date</label>
              <input id="reminderDueAt" name="reminderDueAt" type="date" className={inputCls} />
              <p className="text-xs text-brand-muted mt-1">Defaults to 14 days after sending.</p>
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-brand-navy mb-1">Subject (leave blank to use the template)</label>
            <input id="subject" name="subject" maxLength={300} className={inputCls} />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-semibold text-brand-navy mb-1">Message (leave blank to use the template)</label>
            <textarea id="body" name="body" rows={8} maxLength={20000} className={textareaCls} />
          </div>
          <button className={btnPrimary}>Create request</button>
        </form>
      </Panel>
    </div>
  );
}
