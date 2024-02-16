"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cloud/ui/components/ui/accordion";
import { HardwareTreeVisualization } from "~/components/visualization/tree-visualization";
import { api } from "~/trpc/react";
import { HardwareTree } from "~/types/hardware";

type Props = {
  tree: HardwareTree;
};

const ComponentGraph = (props: Props) => {
  const { data: tree } = api.hardware.getHardware.useQuery(
    {
      hardwareId: props.tree.id,
    },
    {
      initialData: props.tree,
    },
  );

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline">
          Component Graph
        </AccordionTrigger>
        <AccordionContent>
          <div className="w-full p-1">
            <div className="h-96 rounded-md border border-muted">
              <HardwareTreeVisualization tree={tree} />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ComponentGraph;
