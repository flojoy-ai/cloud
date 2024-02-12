import { ModelTree } from "~/types/model";
import { Node, Edge } from "reactflow";
import { HardwareTree } from "~/types/hardware";

export const makeModelGraph = (root: ModelTree) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: ModelTree, count?: number): string => {
    const duplicates = nodes.filter((n) => n.id.startsWith(node.id)).length;
    const id = duplicates === 0 ? node.id : `${node.id}_${duplicates}`;
    if (node.components.length === 0) {
      nodes.push({
        id,
        data: {
          label: node.name + (count ? ` (x${count})` : ""),
        },
        position: { x: 0, y: 0 },
      });

      return id;
    }

    const childIds = node.components.map((group) =>
      traverse(group.model, group.count),
    );

    nodes.push({
      id,
      data: {
        label: node.name + (count ? ` (x${count})` : ""),
      },
      position: { x: 0, y: 0 },
    });

    for (const childId of childIds)
      edges.push({
        id: id + childId,
        source: id,
        target: childId,
        type: "smoothstep",
      });

    return id;
  };

  traverse(root);

  return { nodes, edges };
};

export const makeHardwareGraph = (root: HardwareTree) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: HardwareTree): string => {
    const duplicates = nodes.filter((n) => n.id.startsWith(node.id)).length;
    const id = duplicates === 0 ? node.id : `${node.id}_${duplicates}`;
    if (node.components.length === 0) {
      nodes.push({
        id,
        data: {
          label: `${node.name}\n(${node.modelName})`,
        },
        position: { x: 0, y: 0 },
      });

      return id;
    }

    const childIds = node.components.map((group) => traverse(group.hardware));

    nodes.push({
      id,
      data: {
        label: `${node.name}\n(${node.modelName})`,
      },
      position: { x: 0, y: 0 },
    });

    for (const childId of childIds)
      edges.push({
        id: id + childId,
        source: id,
        target: childId,
        type: "smoothstep",
      });

    return id;
  };

  traverse(root);

  return { nodes, edges };
};
