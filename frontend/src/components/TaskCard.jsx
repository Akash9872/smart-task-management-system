import { CalendarDays, Clock3, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { formatDuration } from '../utils/formatDuration.js'

const priorityLabel = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' }

export default function TaskCard({ task, onEdit, onDelete, elapsedMs = 0, isDragging = false }) {
  const drag = useDraggable({ id: task.id, data: { task } })
  const style = { transform: CSS.Translate.toString(drag.transform), opacity: drag.isDragging || isDragging ? 0.45 : 1 }
  const overdue = task.deadline && new Date(`${task.deadline}T00:00:00`) < new Date(new Date().toDateString()) && task.status !== 'COMPLETED'

  return <article ref={drag.setNodeRef} style={style} className={`task-card ${drag.isDragging ? 'task-card-dragging' : ''}`}>
    <div className="task-card-top"><span className={`priority-dot priority-${task.priority?.toLowerCase()}`} />
      <span className={`priority-label priority-text-${task.priority?.toLowerCase()}`}>{priorityLabel[task.priority] || 'Medium'} priority</span>
      <button className="icon-button drag-handle" ref={drag.setActivatorNodeRef} {...drag.listeners} {...drag.attributes} aria-label="Drag task"><GripVertical size={16} /></button>
    </div>
    <h3>{task.title}</h3>
    {task.description && <p className="task-description">{task.description}</p>}
    {task.status === 'IN_PROGRESS' && <div className="task-stopwatch" aria-label={`Time in progress ${formatDuration(elapsedMs)}`}><Clock3 size={13}/><span>{formatDuration(elapsedMs)}</span><small>in progress</small></div>}
    <div className="task-card-footer">
      {task.deadline ? <span className={`deadline ${overdue ? 'deadline-overdue' : ''}`}><CalendarDays size={14} />{new Date(`${task.deadline}T00:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span> : <span />}
      <div className="task-actions"><button className="icon-button" onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={14}/></button><button className="icon-button danger-hover" onClick={() => onDelete(task)} aria-label="Delete task"><Trash2 size={14}/></button></div>
    </div>
  </article>
}
