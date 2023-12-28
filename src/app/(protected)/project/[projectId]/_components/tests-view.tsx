import { type SelectProject } from "~/types/project";
import CreateTest from "./tests/create-test";
import AllTests from "./tests/all-tests";

type Props = {
  project: SelectProject;
};

const TestsView = ({ project }: Props) => {
  return (
    <div>
      <div className="py-1"></div>
      <CreateTest project={project} />
      <div className="py-2"></div>
      <AllTests project={project} />
    </div>
  );
};

export default TestsView;
