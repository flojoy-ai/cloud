import { useEffect, useMemo } from "react";
import ReactFlow, {
  ConnectionLineType,
  Node,
  Edge,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import dagre from "@dagrejs/dagre";

import "reactflow/dist/style.css";
import {
  makeUnitGraph,
  makePartVariationGraph,
  PartVariationNodeData,
  UnitNodeData,
} from "@/lib/tree";
import { UnitTreeRoot, PartVariationTreeRoot } from "@cloud/shared";

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

type FlowProps<T> = {
  nodes: Node<T>[];
  edges: Edge[];
  onNodeClick?: (node: Node<T>) => void;
};

const Flow = <T,>({ nodes, edges, onNodeClick }: FlowProps<T>) => {
  const rf = useReactFlow();
  useEffect(() => {
    setTimeout(rf.fitView);
  }, [rf, nodes, edges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick ? (_, node) => onNodeClick(node) : undefined}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      proOptions={{
        hideAttribution: true,
      }}
      // allows the user to scroll the page normally
      // even when the pointer is in the reactflow canvas
      // preventScrolling={false}
    />
  );
};

type Props<T> = {
  nodes: Node<T>[];
  edges: Edge[];
  onNodeClick?: (node: Node<T>) => void;
};

export const TreeVisualization = <T,>({
  nodes,
  edges,
  onNodeClick,
}: Props<T>) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
  );

  return (
    <ReactFlowProvider>
      <Flow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        onNodeClick={onNodeClick}
      />
    </ReactFlowProvider>
  );
};

type PartVariationTreeVisualizationProps = {
  tree: PartVariationTreeRoot;
  onNodeClick?: (node: Node<PartVariationNodeData>) => void;
};

export const PartVariationTreeVisualization = ({
  tree,
  onNodeClick,
}: PartVariationTreeVisualizationProps) => {
  const { nodes, edges } = useMemo(() => makePartVariationGraph(tree), [tree]);

  return (
    <TreeVisualization nodes={nodes} edges={edges} onNodeClick={onNodeClick} />
  );
};

type UnitTreeVisualizationProps = {
  tree: UnitTreeRoot;
  onNodeClick?: (node: Node<UnitNodeData>) => void;
};

export const UnitTreeVisualization = ({
  tree,
  onNodeClick,
}: UnitTreeVisualizationProps) => {
  const { nodes, edges } = useMemo(() => makeUnitGraph(tree), [tree]);

  return (
    <TreeVisualization nodes={nodes} edges={edges} onNodeClick={onNodeClick} />
  );
};

export default TreeVisualization;
