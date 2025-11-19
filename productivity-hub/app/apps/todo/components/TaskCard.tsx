'use client';

import { useState } from 'react';
import { Check, Circle, Clock, AlertCircle, GripHorizontal } from 'lucide-react';
import type { Task } from '../types';
import { formatTimeBlock, getCategoryColor, getPriorityColor } from '../lib/utils';
import { storage } from '../lib/storage';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
    onUpdate: () => void;
}

export function TaskCard({ task, compact = false, onUpdate }: TaskCardProps) {
    const [isResizing, setIsResizing] = useState(false);

    const handleToggleComplete = () => {
        if (task.completed) {
            storage.uncompleteTask(task.id);
        } else {
            storage.completeTask(task.id);
        }
        onUpdate();
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        if (!task.timeBlock) return;

        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        const startY = e.clientY;
        const startDuration = task.timeBlock.duration;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();

            const deltaY = moveEvent.clientY - startY;
            // Each 40px = 15 minutes (approximate grid cell height)
            const durationChange = Math.round(deltaY / 40) * 15;
            const newDuration = Math.max(15, Math.min(180, startDuration + durationChange));

            if (newDuration !== startDuration) {
                const updatedTask = {
                    ...task,
                    timeBlock: {
                        ...task.timeBlock!,
                        duration: newDuration
                    }
                };
                storage.saveTask(updatedTask);
                onUpdate();
            }
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            upEvent.preventDefault();
            upEvent.stopPropagation();
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const PIXELS_PER_MINUTE = 40 / 15; // 2.66px per minute
    const height = task.timeBlock && !compact
        ? Math.max(40, task.timeBlock.duration * PIXELS_PER_MINUTE)
        : undefined;

    return (
        <div
            style={height ? { height: `${height}px` } : undefined}
            className={`border rounded-lg p-3 pb-5 transition-all relative ${getCategoryColor(task.category)} ${compact ? 'text-sm' : ''
                } ${task.completed ? 'opacity-50' : ''} ${isResizing ? 'ring-2 ring-orange-500 z-10' : ''}`}
        >
            <div className="flex items-start gap-2 h-full overflow-hidden">
                <button
                    onClick={handleToggleComplete}
                    className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0"
                >
                    {task.completed ? (
                        <Check size={18} className="text-green-400" />
                    ) : (
                        <Circle size={18} className="text-gray-500" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'} truncate`}>
                            {task.title}
                        </p>
                        {task.priority === 'high' && (
                            <AlertCircle size={16} className={`${getPriorityColor(task.priority)} flex-shrink-0`} />
                        )}
                    </div>

                    {task.timeBlock && !compact && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock size={12} />
                            {formatTimeBlock(task.timeBlock.startTime, task.timeBlock.duration)}
                        </div>
                    )}

                    {task.description && !compact && height && height > 60 && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                </div>
            </div>

            {/* Resize Handle */}
            {task.timeBlock && !compact && (
                <div
                    draggable={false}
                    onMouseDown={handleResizeStart}
                    onDragStart={(e) => e.preventDefault()}
                    className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center hover:bg-orange-500/30 transition-colors group border-t border-transparent hover:border-orange-500/50"
                    title="Drag to resize duration"
                >
                    <GripHorizontal size={16} className="text-gray-600 group-hover:text-orange-400" />
                </div>
            )}
        </div>
    );
}
