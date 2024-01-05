import { type SelectWorkspace } from "~/types/workspace";
import WorkspaceCard from "./workspace-card";

type Props = {
  workspaces: SelectWorkspace[];
};

export default async function AllWorkspaces({ workspaces }: Props) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* {workspaces */}
        {/*   .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) */}
        {/*   .map((workspace, idx) => { */}
        {/*     return ( */}
        {/*       <div key={workspace.id}> */}
        {/*         {idx !== 0 && <Separator />} */}
        {/*         <div className="py-2" /> */}
        {/*         <WorkspaceSection workspace={workspace} /> */}
        {/*         <div className="py-2" /> */}
        {/*       </div> */}
        {/*     ); */}
        {/*   })} */}

        {workspaces
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((workspace) => {
            return <WorkspaceCard key={workspace.id} workspace={workspace} />;
          })}
      </div>
    </>
  );
}
