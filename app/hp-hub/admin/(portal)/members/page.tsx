import CreateAccountForm from "@/components/hp-hub/admin/CreateAccountForm";
import { PageHeader, Panel, Flash, Table, fmtDate, btnPrimary, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { grantMember, updateMember } from "@/lib/hp-hub/admin/settings-actions";
import { ROLE_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "Members & access" };

function RoleSelect({ name = "role", value }: { name?: string; value?: string }) {
  return (
    <select name={name} defaultValue={value ?? "CONTRIBUTOR"} className={inputCls} aria-label="Role">
      {Object.entries(ROLE_LABELS).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const actor = await requireHpPage("members.manage");
  const sp = await searchParams;
  const members = await prisma.hpMember.findMany({
    orderBy: [{ active: "desc" }, { role: "asc" }],
    include: { user: { select: { name: true, email: true, active: true, astelfinAccess: true, lastLoginAt: true } } },
  });

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Members & access"
        description="HP-Hub access is separate from Astelfin. Granting a role here doesn't give access to Astelfin; the Astelfin CEO controls that in Astelfin settings."
      />
      <Flash ok={sp.ok} err={sp.err} />

      <Table head={["Member", "Role", "HP-Hub", "Astelfin", "Last sign-in", ""]}>
        {members.map((m) => (
          <tr key={m.id} className="align-middle">
            <td className="px-4 py-3">
              <p className="font-semibold text-brand-navy">{m.user.name}</p>
              <p className="text-xs text-brand-muted">{m.user.email}</p>
            </td>
            <td className="px-4 py-3 min-w-48" colSpan={2}>
              <form action={updateMember} id={`m-${m.id}`} className="flex items-center gap-3">
                <input type="hidden" name="id" value={m.id} />
                <RoleSelect value={m.role} />
                <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                  <input type="checkbox" name="active" defaultChecked={m.active} /> Active
                </label>
              </form>
            </td>
            <td className="px-4 py-3 text-xs">{m.user.astelfinAccess ? "Yes" : "No"}</td>
            <td className="px-4 py-3 text-xs text-brand-muted whitespace-nowrap">{fmtDate(m.user.lastLoginAt, true)}</td>
            <td className="px-4 py-3 text-right">
              <button form={`m-${m.id}`} className={btnSecondary}>
                Save
              </button>
              {m.id === actor.memberId && <p className="text-[11px] text-brand-muted mt-1">You</p>}
            </td>
          </tr>
        ))}
      </Table>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Grant access to an existing account">
          <form action={grantMember} className="space-y-3">
            <input name="email" type="email" required placeholder="Email of an existing Astellic account" className={inputCls} aria-label="Email" />
            <RoleSelect />
            <button className={btnPrimary}>Grant HP-Hub access</button>
          </form>
        </Panel>
        <Panel title="Create an HP-Hub-only account">
          <CreateAccountForm />
        </Panel>
      </div>

      <Panel title="Roles">
        <dl className="text-sm space-y-2">
          <div><dt className="inline font-semibold">Super Admin:</dt> <dd className="inline text-gray-700">everything, including members and access.</dd></div>
          <div><dt className="inline font-semibold">Repository Administrator:</dt> <dd className="inline text-gray-700">publishes, unpublishes, archives and deletes; manages taxonomy; imports CSV.</dd></div>
          <div><dt className="inline font-semibold">Editor / Reviewer:</dt> <dd className="inline text-gray-700">edits any record, verifies, reviews submissions and reports, manages acquisition requests. Can&rsquo;t publish.</dd></div>
          <div><dt className="inline font-semibold">Contributor:</dt> <dd className="inline text-gray-700">creates drafts, edits their own drafts, submits them for review, updates the tracker. Can&rsquo;t publish or verify.</dd></div>
        </dl>
      </Panel>
    </div>
  );
}
