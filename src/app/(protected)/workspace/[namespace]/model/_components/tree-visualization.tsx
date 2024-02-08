"use client";

import React, { useMemo } from "react";
import ReactFlow, { ConnectionLineType, Node, Edge, Position } from "reactflow";
import dagre from "@dagrejs/dagre";

import "reactflow/dist/style.css";
import { ModelTree } from "~/types/model";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "LR" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const makeGraph = (root: ModelTree) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: ModelTree): string => {
    const duplicates = nodes.filter((n) => n.id.startsWith(node.id)).length;
    const id = duplicates === 0 ? node.id : `${node.id}_${duplicates}`;
    if (node.components.length === 0) {
      nodes.push({
        id,
        data: {
          label: node.name,
        },
        position: { x: 0, y: 0 },
      });

      return id;
    }

    const childIds = node.components.map((group) => traverse(group.model));

    nodes.push({
      id,
      data: {
        label: node.name,
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

type Props = {
  tree: ModelTree;
};

const TreeVisualization = ({ tree }: Props) => {
  const { nodes, edges } = useMemo(() => makeGraph(tree), [tree]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
  );

  return (
    <ReactFlow
      nodes={layoutedNodes}
      edges={layoutedEdges}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    />
  );
};

export default TreeVisualization;
