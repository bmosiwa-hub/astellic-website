import { PageHeader, Panel, Flash, btnPrimary, inputCls, textareaCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { saveTemplate } from "@/lib/hp-hub/admin/tracker-actions";

export const metadata = { title: "Request templates" };

function TemplateForm({ t }: { t?: { id: string; name: string; subject: string; body: string } }) {
  return (
    <form action={saveTemplate} className="space-y-3">
      {t && <input type="hidden" name="id" value={t.id} />}
      <input name="name" defaultValue={t?.name} placeholder="Template name" required maxLength={120} className={inputCls} aria-label="Template name" />
      <input name="subject" defaultValue={t?.subject} placeholder="Subject" required maxLength={300} className={inputCls} aria-label="Subject" />
      <textarea name="body" defaultValue={t?.body} rows={10} required maxLength={20000} className={textareaCls} aria-label="Message" />
      <button className={btnPrimary}>{t ? "Save template" : "Add template"}</button>
    </form>
  );
}

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireHpPage("outreach.manage");
  const sp = await searchParams;
  const templates = await prisma.hpRequestTemplate.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Request templates"
        back={{ href: "/hp-hub/admin/outreach", label: "Requests" }}
        description={
          <>
            Placeholders: <code>{"{{title}}"}</code>, <code>{"{{publisher}}"}</code>, <code>{"{{year}}"}</code>, <code>{"{{recipient}}"}</code>, <code>{"{{sender}}"}</code>
          </>
        }
      />
      <Flash ok={sp.ok} err={sp.err} />
      {templates.map((t) => (
        <Panel key={t.id} title={t.name}>
          <TemplateForm t={t} />
        </Panel>
      ))}
      <Panel title="New template">
        <TemplateForm />
      </Panel>
    </div>
  );
}
