import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const empty = { title:'', description:'', status:'TODO', priority:'MEDIUM', deadline:'' }

export default function TaskModal({ task, initialStatus, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(empty)
  useEffect(() => {
    setForm(task ? { title:task.title, description:task.description || '', status:task.status, priority:task.priority, deadline:task.deadline || '' } : {...empty, status:initialStatus || 'TODO'})
  }, [task, initialStatus])
  function submit(event) { event.preventDefault(); onSave({...form, deadline:form.deadline || null}) }

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-head"><div><span className="eyebrow">TASK DETAILS</span><h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      <form onSubmit={submit} className="task-form">
        <label>Task name<input autoFocus required maxLength="160" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="What needs to get done?" /></label>
        <label>Description <span className="optional">Optional</span><textarea maxLength="4000" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a few helpful details…" /></label>
        <div className="form-grid"><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></label>
          <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label></div>
        <label>Deadline <span className="optional">Optional</span><input type="date" min={new Date().toISOString().slice(0,10)} value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} /></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
      </form>
    </section>
  </div>
}
