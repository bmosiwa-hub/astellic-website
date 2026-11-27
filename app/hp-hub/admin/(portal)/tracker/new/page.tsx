import AcquisitionFields from "@/components/hp-hub/admin/AcquisitionFields";
import { PageHeader, Panel, Flash, btnPrimary } from "@/components/hp-hub/admin/ui";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { createAcquisition } from "@/lib/hp-hub/admin/tracker-actions";
import { memberOptions } from "@/lib/hp-hub/admin/members";
import { taxonomyOptions } from "@/lib/hp-hub/admin/options";

export const metadata = { title: "Add tracker record" };

export default async function NewTrackerPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const actor = await requireHpPage("acquisition.edit");
  const sp = await searchParams;
  const [options, members] = await Promise.all([taxonomyOptions(), memberOptions()]);
  return (
    <div className="max-w-4xl">
      <PageHeader title="Add to the Missing Documents tracker" back={{ href: "/hp-hub/admin/tracker", label: "Tracker" }} />
      <Flash err={sp.err} />
      <Panel>
        <form action={createAcquisition} className="space-y-5">
          <AcquisitionFields
            v={{ countryId: options.countries[0]?.id, status: "MISSING", ownerId: actor.memberId }}
            countries={options.countries}
            publishers={options.publishers}
            types={options.types}
            members={members}
          />
          <button className={btnPrimary}>Add record</button>
        </form>
      </Panel>
    </div>
  );
}
