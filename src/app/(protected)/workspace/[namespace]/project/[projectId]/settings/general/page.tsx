import { Separator } from "~/components/ui/separator";
import GeneralForm from "./_components/general-form";

async function GeneralPage({
  params,
}: {
  params: { namespace: string; projectId: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Update your project settings.
        </p>
      </div>
      <Separator />
      <GeneralForm projectId={params.projectId} />
    </div>
  );
}

export default GeneralPage;
