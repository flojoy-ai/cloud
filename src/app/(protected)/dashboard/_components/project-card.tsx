import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type SelectProject } from "~/types/project";

type Props = {
  project: SelectProject;
};

export default async function ProjectCard({ project }: Props) {
  return (
    <Card className="transition-all duration-300 hover:bg-secondary/80">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.id}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div>
          <div>Last updated:</div>
          <div>{project.updatedAt?.toLocaleTimeString() ?? "Never"}</div>
        </div>
      </CardFooter>
    </Card>
  );
}
