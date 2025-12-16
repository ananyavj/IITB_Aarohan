import { useRef, useEffect, useState } from 'react';
import { GitBranch, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useMindMap } from '@/hooks/useAI';
import { Button, Card } from '@/components/ui';

interface MindMapPanelProps {
    chapterId: number;
    userId: number;
}

// Simple Tree Layout Algo
const calculateLayout = (nodes: any[], edges: any[], width: number, height: number) => {
    const root = nodes.find(n => n.level === 0);
    if (!root) return { nodes: [], edges: [] };

    const levels = new Map<number, any[]>();
    nodes.forEach(n => {
        if (!levels.has(n.level)) levels.set(n.level, []);
        levels.get(n.level)?.push(n);
    });

    const layoutNodes = nodes.map(n => {
        const levelNodes = levels.get(n.level) || [];
        const index = levelNodes.indexOf(n);
        const levelHeight = height / (levels.size + 1);

        // Calculate X position (centered spread)
        const spread = width / (levelNodes.length + 1);
        const x = spread * (index + 1);

        // Calculate Y position (top to bottom)
        const y = levelHeight * (n.level + 1);

        return { ...n, x, y };
    });

    return { nodes: layoutNodes, edges };
};

const MindMapPanel = ({ chapterId, userId }: MindMapPanelProps) => {
    const { data, loading, generate } = useMindMap(chapterId);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    }, [data]); // Recalculate when data loads

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
                <p className="text-gray-500">Generating concept map...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-64 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl m-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 text-purple-600">
                    <GitBranch className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">Visual Mind Map</h3>
                <p className="text-xs text-gray-500 mb-4">View relationships between concepts</p>
                <Button onClick={() => generate(userId)} variant="outline">
                    Generate Map
                </Button>
            </div>
        );
    }

    const { nodes: layoutNodes } = calculateLayout(data.nodes, data.edges, dimensions.width, dimensions.height);

    return (
        <div className="p-4 h-full flex flex-col gap-4">
            <Card className="h-[500px] relative bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden shadow-inner border-slate-200 dark:border-slate-800">
                {/* Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                    <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button onClick={() => setZoom(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Maximize className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <div
                    ref={containerRef}
                    className="flex-1 w-full h-full overflow-auto custom-scrollbar relative cursor-grab active:cursor-grabbing"
                >
                    <svg
                        width="100%"
                        height="100%"
                        className="absolute inset-0 pointer-events-none"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}
                    >
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                            </marker>
                        </defs>

                        {/* Render Edges */}
                        {data.edges.map((edge: any, i: number) => {
                            const source = layoutNodes.find(n => n.id === edge.source);
                            const target = layoutNodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;

                            return (
                                <g key={i}>
                                    <path
                                        d={`M ${source.x} ${source.y} C ${source.x} ${(source.y + target.y) / 2}, ${target.x} ${(source.y + target.y) / 2}, ${target.x} ${target.y}`}
                                        fill="none"
                                        stroke="#cbd5e1"
                                        strokeWidth="2"
                                        markerEnd="url(#arrowhead)"
                                        className="transition-all duration-500 ease-in-out"
                                    />
                                </g>
                            );
                        })}

                        {/* Render Nodes */}
                        {layoutNodes.map((node: any) => (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className="transition-all duration-500 ease-in-out cursor-pointer hover:brightness-110"
                                onClick={() => alert(`Node: ${node.label}`)}
                            >
                                {/* Glow Effect for Root */}
                                {node.level === 0 && (
                                    <circle r="60" fill="url(#blue-gradient)" opacity="0.2" className="animate-pulse" />
                                )}

                                <rect
                                    x={node.level === 0 ? -70 : -60}
                                    y={-25}
                                    width={node.level === 0 ? 140 : 120}
                                    height={50}
                                    rx={12}
                                    fill={node.level === 0 ? '#4f46e5' : node.level === 1 ? '#fff' : '#f1f5f9'}
                                    stroke={node.level === 0 ? '#4338ca' : '#94a3b8'}
                                    strokeWidth={node.level === 0 ? 0 : 2}
                                    className="drop-shadow-sm"
                                />
                                <text
                                    x="0"
                                    y="5"
                                    textAnchor="middle"
                                    fill={node.level === 0 ? 'white' : '#1e293b'}
                                    fontSize={node.level === 0 ? 16 : 14}
                                    fontWeight={node.level === 0 ? 'bold' : 'normal'}
                                    className="select-none font-sans"
                                >
                                    {node.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 p-2 rounded text-xs text-gray-500 backdrop-blur-sm">
                    {layoutNodes.length} Concepts • {data.edges.length} Connections
                </div>
            </Card>
        </div>
    );
};

export default MindMapPanel;
