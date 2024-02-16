"use client";

import React, { useMemo } from "react";
import ReactFlow, { ConnectionLineType, Node, Edge, Position } from "reactflow";
import dagre from "@dagrejs/dagre";

import "reactflow/dist/style.css";
import { ModelTree } from "~/types/model";
import { makeHardwareGraph, makeModelGraph } from "~/lib/tree";
import { HardwareTree } from "~/types/hardware";

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

type Props = {
  nodes: Node[];
  edges: Edge[];
};

export const TreeVisualization = ({ nodes, edges }: Props) => {
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
      proOptions={{
        hideAttribution: true,
      }}
      // allows the user to scroll the page normally
      // even when the pointer is in the reactflow canvas
      preventScrolling={false}
    />
  );
};

type ModelTreeVisualizationProps = {
  tree: ModelTree;
};

export const ModelTreeVisualization = ({
  tree,
}: ModelTreeVisualizationProps) => {
  const { nodes, edges } = useMemo(() => makeModelGraph(tree), [tree]);

  return <TreeVisualization nodes={nodes} edges={edges} />;
};

type HardwareTreeVisualizationProps = {
  tree: HardwareTree;
};

export const HardwareTreeVisualization = ({
  tree,
}: HardwareTreeVisualizationProps) => {
  const { nodes, edges } = useMemo(() => makeHardwareGraph(tree), [tree]);

  return <TreeVisualization nodes={nodes} edges={edges} />;
};

export default TreeVisualization;
