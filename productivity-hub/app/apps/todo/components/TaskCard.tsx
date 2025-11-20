'use client';

import { useState } from 'react';
import { Check, Circle, Clock, AlertCircle, GripHorizontal, CheckSquare } from 'lucide-react';
import type { Task } from '../types';
import { formatTimeBlock, getCategoryColor, getPriorityColor } from '../lib/utils';
import { storage } from '../lib/storage';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
    onUpdate: () => void;
    onEdit?: () => void;
}

export function TaskCard({ task, compact = false, onUpdate, onEdit }: TaskCardProps) {
    const [isResizing, setIsResizing] = useState(false);

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
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
            // Each 80px = 60 minutes (DayPlanner HOUR_HEIGHT)
            // So 20px = 15 minutes
            const durationChange = Math.round(deltaY / 20) * 15;
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

    return (
        <div
            onClick={onEdit}
            className={`border rounded-lg p-3 pb-5 transition-all relative ${getCategoryColor(task.category)} ${compact ? 'text-sm' : 'h-full'
                } ${task.completed ? 'opacity-50' : ''} ${isResizing ? 'ring-2 ring-orange-500 z-10' : ''} cursor-pointer hover:brightness-110`}
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

                    {task.subtasks && task.subtasks.length > 0 && !compact && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <CheckSquare size={12} />
                            <span>
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                            </span>
                        </div>
                    )}

                    {task.description && !compact && task.timeBlock && task.timeBlock.duration > 45 && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                </div>
            </div>

            {/* Resize Handle */}
            {task.timeBlock && !compact && (
                <div
                    draggable={false}
                    onMouseDown={handleResizeStart}
                    onClick={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.preventDefault()}
                    className="resize-handle absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center hover:bg-orange-500/30 transition-colors group border-t border-transparent hover:border-orange-500/50"
                    title="Drag to resize duration"
                >
                    <GripHorizontal size={16} className="text-gray-600 group-hover:text-orange-400" />
                </div>
            )}
        </div>
    );
}
