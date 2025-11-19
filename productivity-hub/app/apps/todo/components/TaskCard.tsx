'use client';

import { Check, Circle, Clock, AlertCircle } from 'lucide-react';
import type { Task } from '../types';
import { formatTimeBlock, getCategoryColor, getPriorityColor } from '../lib/utils';
import { storage } from '../lib/storage';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
    onUpdate: () => void;
}

export function TaskCard({ task, compact = false, onUpdate }: TaskCardProps) {
    const handleToggleComplete = () => {
        if (task.completed) {
            storage.uncompleteTask(task.id);
        } else {
            storage.completeTask(task.id);
        }
        onUpdate();
    };

    return (
        <div
            className={`border rounded-lg p-3 transition-all ${getCategoryColor(task.category)} ${compact ? 'text-sm' : ''
                } ${task.completed ? 'opacity-50' : ''}`}
        >
            <div className="flex items-start gap-2">
                <button
                    onClick={handleToggleComplete}
                    className="mt-0.5 hover:scale-110 transition-transform"
                >
                    {task.completed ? (
                        <Check size={18} className="text-green-400" />
                    ) : (
                        <Circle size={18} className="text-gray-500" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                        </p>
                        {task.priority === 'high' && (
                            <AlertCircle size={16} className={getPriorityColor(task.priority)} />
                        )}
                    </div>

                    {task.timeBlock && !compact && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock size={12} />
                            {formatTimeBlock(task.timeBlock.startTime, task.timeBlock.duration)}
                        </div>
                    )}

                    {task.description && !compact && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
