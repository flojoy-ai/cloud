import { type SelectProject } from "~/types/project";
import CreateDevice from "./devices/create-device";
import AllDevices from "./devices/all-devices";

type Props = {
  project: SelectProject;
};

const DevicesView = ({ project }: Props) => {
  return (
    <div>
      <div className="py-1"></div>
      <CreateDevice project={project} />
      <div className="py-2"></div>
      <AllDevices project={project} />
    </div>
  );
};

export default DevicesView;
