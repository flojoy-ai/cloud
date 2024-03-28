import { ModelTreeRoot, ModelTreeNode } from "@cloud/server/src/types/model";
import { Node, Edge } from "reactflow";
import {
  HardwareTreeNode,
  HardwareTreeRoot,
} from "@cloud/server/src/types/hardware";

export const makeModelGraph = (root: ModelTreeRoot) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: ModelTreeNode, count?: number): string => {
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

export const makeHardwareGraph = (root: HardwareTreeRoot) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: HardwareTreeNode): string => {
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

    const childIds = node.components.map((group) => traverse(group));

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

  traverse({ ...root, modelName: root.model.name });

  return { nodes, edges };
};
