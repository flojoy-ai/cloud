import {
  PartVariationTreeRoot,
  PartVariationTreeNode,
  UnitTreeNode,
  UnitTreeRoot,
} from "@cloud/shared";
import { Node, Edge } from "reactflow";

export type PartVariationNodeData = {
  partVariation: PartVariationTreeNode;
  label: string;
};

export const makePartVariationGraph = (root: PartVariationTreeRoot) => {
  const nodes: Node<PartVariationNodeData>[] = [];
  const edges: Edge[] = [];

  const traverse = (node: PartVariationTreeNode, count?: number): string => {
    const duplicates = nodes.filter((n) => n.id.startsWith(node.id)).length;
    const id = duplicates === 0 ? node.id : `${node.id}_${duplicates}`;
    if (node.components.length === 0) {
      nodes.push({
        id,
        data: {
          partVariation: node,
          label: node.partNumber + (count ? ` (x${count})` : ""),
        },
        position: { x: 0, y: 0 },
      });

      return id;
    }

    const childIds = node.components.map((group) =>
      traverse(group.partVariation, group.count),
    );

    nodes.push({
      id,
      data: {
        partVariation: node,
        label: node.partNumber + (count ? ` (x${count})` : ""),
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

export type UnitNodeData = {
  unit: UnitTreeNode;
  label: string;
};

export const makeUnitGraph = (root: UnitTreeRoot) => {
  const nodes: Node<UnitNodeData>[] = [];
  const edges: Edge[] = [];

  const traverse = (node: UnitTreeNode): string => {
    const duplicates = nodes.filter((n) => n.id.startsWith(node.id)).length;
    const id = duplicates === 0 ? node.id : `${node.id}_${duplicates}`;
    if (node.components.length === 0) {
      nodes.push({
        id,
        data: {
          unit: node,
          label: `${node.serialNumber}\n(${node.partNumber})`,
        },
        position: { x: 0, y: 0 },
      });

      return id;
    }

    const childIds = node.components.map((group) => traverse(group));

    nodes.push({
      id,
      data: {
        unit: node,
        label: `${node.serialNumber}\n(${node.partNumber})`,
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

  traverse({ ...root, partNumber: root.partVariation.partNumber });

  return { nodes, edges };
};
