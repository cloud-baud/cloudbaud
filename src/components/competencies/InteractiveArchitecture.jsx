import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../styles/architecture-diagrams.css';
import { Database, Shield, Server, Cloud, Activity, Zap } from 'lucide-react';

/**
 * ArchitectureNode - Custom node component for React Flow
 */
const ArchitectureNode = ({ data }) => {
  const iconMap = {
    Database, Shield, Server, Cloud, Activity, Zap
  };
  
  const Icon = iconMap[data.icon] || Database;
  
  return (
    <div className={`architecture-node ${data.type || ''}`}>
      <div className="architecture-node-header">
        <Icon className="architecture-node-icon" />
        <span>{data.label}</span>
      </div>
      
      {data.metrics && (
        <div className="architecture-node-metrics">
          {Object.entries(data.metrics).map(([key, value]) => (
            <div key={key} className="architecture-node-metric">
              <span className="architecture-node-metric-label">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="architecture-node-metric-value">{value}</span>
            </div>
          ))}
        </div>
      )}
      
      {data.status && (
        <div className="mt-2">
          <span className={`status-dot ${data.status}`}></span>
          <span className="ml-2 text-xs opacity-70">{data.statusText}</span>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  architecture: ArchitectureNode,
};

/**
 * InteractiveArchitecture - Main component for rendering architecture diagrams
 * Supports both "with" and "without" states for before/after comparisons
 */
const InteractiveArchitecture = ({ 
  config, 
  onNodeClick, 
  mode = 'with', 
  height = '500px' 
}) => {
  // Transform config nodes to React Flow format
  const initialNodes = (config?.nodes || []).map((node, index) => ({
    id: node.id,
    type: 'architecture',
    position: node.position || { 
      x: (index % 3) * 250 + 100, 
      y: Math.floor(index / 3) * 150 + 50 
    },
    data: {
      label: node.label,
      type: node.type,
      icon: node.icon || 'Database',
      metrics: node.metrics,
      status: node.status,
      statusText: node.statusText,
    },
  }));

  // Transform config edges to React Flow format
  const initialEdges = (config?.edges || []).map((edge) => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.animated || false,
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edge.color || '#475569',
    },
    style: {
      stroke: edge.color || '#475569',
      strokeWidth: 2,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  return (
    <div style={{ width: '100%', height }} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#334155" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.type === 'central') return '#3b82f6';
            if (node.data?.type === 'security') return '#10b981';
            if (node.data?.type === 'storage') return '#f59e0b';
            return '#1e293b';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
        />
      </ReactFlow>
    </div>
  );
};

export default InteractiveArchitecture;
