import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getPrettyTime } from "~/lib/time";
import { type SelectProject } from "~/types/project";
import { type SelectWorkspace } from "~/types/workspace";

type Props = {
  project: SelectProject;
  workspace: SelectWorkspace;
};

export default async function ProjectCard({ project, workspace }: Props) {
  return (
    <Link href={`/workspace/${workspace.id}/project/${project.id}/devices`}>
      <Card className="transition-all duration-300 hover:bg-secondary/80">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>{project.id}</CardDescription>
        </CardHeader>
        <CardFooter>
          <div>
            Last updated:{" "}
            {project.updatedAt ? getPrettyTime(project.updatedAt) : "Never"}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
