import { useCallback, useEffect, useMemo, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { Activity, ArrowDownUp, CalendarDays, Check, ChevronDown, CircleHelp, ClipboardList, Clock3, LayoutGrid, List, LogOut, Plus, Search, SlidersHorizontal, Sparkles, Target, X } from 'lucide-react'
import { api, errorMessage } from '../api/client.js'
import TaskCard from '../components/TaskCard.jsx'
import TaskModal from '../components/TaskModal.jsx'

const columns = [
  { id:'TODO', title:'To do', tone:'todo', caption:'Ready when you are' },
  { id:'IN_PROGRESS', title:'In progress', tone:'progress', caption:'Good things are underway' },
  { id:'COMPLETED', title:'Completed', tone:'done', caption:'Look at you go' },
]

function Column({ column, tasks, onEdit, onDelete, onAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id:column.id })
  return <section ref={setNodeRef} className={`board-column column-${column.tone} ${isOver ? 'column-over' : ''}`}>
    <div className="column-heading"><div className="column-title"><span className={`column-marker marker-${column.tone}`} /><h3>{column.title}</h3><span className="column-count">{tasks.length}</span></div><button className="icon-button column-add" onClick={()=>onAdd(column.id)} aria-label={`Add to ${column.title}`}><Plus size={16}/></button></div>
    <p className="column-caption">{column.caption}</p>
    <div className="column-cards">{tasks.map(task=><TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete}/>)}
      {tasks.length===0 && <div className="empty-column"><span><Sparkles size={16}/></span><p>Nothing here yet</p><small>Drop a task in, or enjoy the breathing room.</small></div>}
    </div>
  </section>
}

function dueText(tasks) {
  const today = new Date().toISOString().slice(0,10)
  const overdue=tasks.filter(task=>task.deadline && task.deadline<today && task.status!=='COMPLETED').length
  const due=tasks.filter(task=>task.deadline===today && task.status!=='COMPLETED').length
  if (overdue) return `${overdue} overdue`
  if (due) return `${due} due today`
  return 'You’re on track'
}

export default function Dashboard({ user, onSignOut }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [dueOnly, setDueOnly] = useState(false)
  const [sort, setSort] = useState('createdAt')
  const [direction, setDirection] = useState('desc')
  const [view, setView] = useState('board')
  const [modalTask, setModalTask] = useState(undefined)
  const [modalError, setModalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}))

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const {data}=await api.get('/tasks',{params:{page:0,size:100,sort,direction,...(query.trim()?{q:query.trim()}:{}),...(status?{status}:{}),...(priority?{priority}:{})}})
      setTasks(data.content || [])
    } catch(requestError) { setError(errorMessage(requestError)) }
    finally { setLoading(false) }
  },[query,status,priority,sort,direction])

  useEffect(()=>{const timer=setTimeout(loadTasks,query?250:0);return()=>clearTimeout(timer)},[loadTasks,query])
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),2600);return()=>clearTimeout(timer)},[notice])

  const stats=useMemo(()=>({total:tasks.length,active:tasks.filter(t=>t.status==='IN_PROGRESS').length,completed:tasks.filter(t=>t.status==='COMPLETED').length}),[tasks])

  async function saveTask(data) {
    setSaving(true);setModalError('')
    try {
      if(modalTask?.id) await api.put(`/tasks/${modalTask.id}`,data); else await api.post('/tasks',data)
      setModalTask(undefined);setNotice(modalTask?.id?'Task updated':'Task created');await loadTasks()
    } catch(requestError){setModalError(errorMessage(requestError))}
    finally{setSaving(false)}
  }
  async function removeTask(task) {
    if(!window.confirm(`Delete “${task.title}”? This can’t be undone.`)) return
    try{await api.delete(`/tasks/${task.id}`);setNotice('Task deleted');await loadTasks()}catch(requestError){setError(errorMessage(requestError))}
  }
  async function changeStatus(task,statusValue) {
    try{await api.put(`/tasks/${task.id}`,{title:task.title,description:task.description,status:statusValue,priority:task.priority,deadline:task.deadline});setNotice('Task moved');await loadTasks()}
    catch(requestError){setError(errorMessage(requestError))}
  }
  function handleDragStart(event){setActiveTask(tasks.find(task=>task.id===event.active.id)||null)}
  function handleDragEnd(event){const {active,over}=event;setActiveTask(null);if(!over)return;const task=tasks.find(item=>item.id===active.id);const target=String(over.id);if(task&&columns.some(column=>column.id===target)&&task.status!==target)changeStatus(task,target)}

  function clearFilters() {
    setQuery('')
    setStatus('')
    setPriority('')
    setDueOnly(false)
  }

  function showTasks({ status: nextStatus = '', due: dueTasks = false } = {}) {
    clearFilters()
    setStatus(nextStatus)
    setDueOnly(dueTasks)
    setSort(dueTasks ? 'deadline' : 'createdAt')
    setDirection(dueTasks ? 'asc' : 'desc')
    setView('list')
    setFilterOpen(false)
  }

  const name=user.name?.split(' ')[0]||'there'
  const today=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date())
  const visibleTasks=dueOnly ? tasks.filter(task=>task.deadline) : tasks
  const hasFilters=Boolean(query||status||priority||dueOnly)
  const overviewTitle=dueOnly?'Due dates':status==='IN_PROGRESS'?'In progress':status==='COMPLETED'?'Completed':status==='TODO'?'To do':'Overview'

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark"><ClipboardList size={18}/></span><span>taskflow<span className="brand-dot">.</span></span></div>
      <div className="workspace-label">WORKSPACE</div><div className="workspace-card"><span className="workspace-avatar">{user.name?.charAt(0)?.toUpperCase()||'T'}</span><span><strong>My workspace</strong><small>Personal space</small></span><ChevronDown size={15}/></div>
      <div className="nav-label">MENU</div><nav className="side-nav"><button className={`nav-item ${!dueOnly&&view==='board'&&!status&&!priority&&!query?'active':''}`} onClick={()=>{clearFilters();setView('board');setFilterOpen(false)}}><LayoutGrid size={17}/>Overview</button><button className={`nav-item ${view==='list'&&!dueOnly?'active':''}`} onClick={()=>showTasks()}><List size={17}/>All tasks<span className="nav-count">{stats.total}</span></button><button className={`nav-item ${dueOnly?'active':''}`} onClick={()=>showTasks({due:true})}><CalendarDays size={17}/>Due dates</button></nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><span><Sparkles size={15}/></span><strong>A small tip</strong><p>Break a big goal into one tiny next step.</p></div><a className="nav-item nav-item-link" href="https://github.com/Akash9872/smart-task-management-system/issues" target="_blank" rel="noreferrer"><CircleHelp size={17}/>Help & feedback</a><div className="profile-card"><div className="profile-avatar">{user.name?.charAt(0)?.toUpperCase()||'T'}</div><div className="profile-info"><strong>{user.name}</strong><small>{user.role==='ADMIN'?'Administrator':user.email}</small></div><button className="icon-button" onClick={onSignOut} aria-label="Sign out" title="Sign out"><LogOut size={16}/></button></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span className="crumb-separator">/</span><strong>{overviewTitle}</strong></div><div className="topbar-right"><span className="today-pill"><span className="online-dot"/>{today}</span><div className="profile-avatar top-avatar" aria-label={user.name} title={user.name}>{user.name?.charAt(0)?.toUpperCase()}</div></div></header>
      <div className="page-content"><section className="welcome-row"><div><div className="welcome-kicker"><span className="kicker-spark"><Sparkles size={13}/></span> YOUR PERSONAL WORKSPACE</div><h1>Good day, {name}<span className="wave">✳</span></h1><p>A clear view of your work, and the space to do it well.</p></div><button className="button button-primary create-button" onClick={()=>{setModalError('');setModalTask(null)}}><Plus size={17}/>New task</button></section>

        <section className="stats-grid"><button className="stat-card stat-card-action" onClick={()=>showTasks()}><div className="stat-icon lavender"><ClipboardList size={18}/></div><div className="stat-meta"><span>All tasks</span><strong>{stats.total}</strong><small>Your full picture</small></div><div className="stat-decoration dec-lavender"><LayoutGrid size={61}/></div></button><button className="stat-card stat-card-action" onClick={()=>showTasks({status:'IN_PROGRESS'})}><div className="stat-icon peach"><Activity size={18}/></div><div className="stat-meta"><span>In progress</span><strong>{stats.active}</strong><small>Moving forward</small></div><div className="stat-decoration dec-peach"><Target size={61}/></div></button><button className="stat-card stat-card-action" onClick={()=>showTasks({status:'COMPLETED'})}><div className="stat-icon mint"><Check size={18}/></div><div className="stat-meta"><span>Completed</span><strong>{stats.completed}</strong><small>Look at that progress</small></div><div className="stat-decoration dec-mint"><Check size={61}/></div></button><button className="stat-card stat-card-action due-stat" onClick={()=>showTasks({due:true})}><div className="stat-icon blue"><Clock3 size={18}/></div><div className="stat-meta"><span>Due dates</span><strong className="due-stat-value">{dueText(tasks)}</strong><small>Based on your tasks</small></div><div className="stat-decoration dec-blue"><CalendarDays size={61}/></div></button></section>

        <section className="task-workspace"><div className="workspace-head"><div><div className="section-kicker">YOUR WORK, IN ONE PLACE</div><h2>{overviewTitle==='Overview'?'Task overview':overviewTitle}</h2></div><div className="view-switch"><button className={view==='board'?'selected':''} onClick={()=>setView('board')} aria-label="Board view"><LayoutGrid size={16}/></button><button className={view==='list'?'selected':''} onClick={()=>setView('list')} aria-label="List view"><List size={17}/></button></div></div>
          <div className="toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your tasks…" aria-label="Search tasks"/>{query&&<button className="icon-button clear-search" onClick={()=>setQuery('')} aria-label="Clear search"><X size={14}/></button>}</div>
            <div className="toolbar-right"><div className="filter-wrap"><button className={`button button-outline filter-button ${(status||priority)?'has-filter':''}`} onClick={()=>setFilterOpen(!filterOpen)}><SlidersHorizontal size={15}/>Filter{(status||priority)&&<span className="filter-indicator"/>}</button>{filterOpen&&<div className="filter-popover"><div className="popover-head"><strong>Filter tasks</strong><button className="icon-button" onClick={()=>setFilterOpen(false)} aria-label="Close filters"><X size={15}/></button></div><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option value="">All priorities</option><option value="URGENT">Urgent</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></label><button className="reset-filters" onClick={()=>{setStatus('');setPriority('')}}>Clear filters</button></div>}</div>
              <button className="button button-outline sort-button" onClick={()=>setDirection(direction==='asc'?'desc':'asc')} title={`Sort ${direction==='asc'?'descending':'ascending'}`}><ArrowDownUp size={15}/><span>{direction==='asc'?'Oldest':'Newest'}</span></button><select className="sort-select" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort tasks"><option value="createdAt">Created date</option><option value="deadline">Deadline</option><option value="priority">Priority</option><option value="title">Name</option><option value="updatedAt">Last updated</option></select></div>
          </div>
          {error&&<div className="page-error" role="alert">{error}<button onClick={loadTasks}>Retry</button></div>}
          {loading?<div className="loading-state"><span className="spinner"/>Loading your tasks…</div>:visibleTasks.length===0?<div className="empty-state"><span className="empty-illustration"><ClipboardList size={25}/></span><h3>{hasFilters?(dueOnly?'No tasks have deadlines yet':'No tasks match those filters'):'A fresh start'}</h3><p>{hasFilters?'Clear or adjust the current view to see more tasks.':'Add a task when something is ready to be on your mind.'}</p>{hasFilters&&<button className="button button-outline" onClick={clearFilters}>Clear filters</button>}{!hasFilters&&<button className="button button-primary" onClick={()=>{setModalError('');setModalTask(null)}}><Plus size={16}/>Create your first task</button>}</div>:view==='board'?<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={()=>setActiveTask(null)}><div className="board-grid">{columns.map(column=><Column key={column.id} column={column} tasks={tasks.filter(task=>task.status===column.id)} onEdit={task=>{setModalError('');setModalTask(task)}} onDelete={removeTask} onAdd={status=>{setModalError('');setModalTask({status})}}/>)}</div><DragOverlay>{activeTask?<TaskCard task={activeTask} onEdit={()=>{}} onDelete={()=>{}} isDragging/>:null}</DragOverlay></DndContext>:<div className="list-view">{visibleTasks.map(task=><div className="list-row" key={task.id}><span className={`list-status status-${task.status.toLowerCase()}`}/><div className="list-title"><strong>{task.title}</strong><small>{task.description||'No description'}</small></div><span className={`list-priority priority-text-${task.priority.toLowerCase()}`}>{task.priority}</span><span className="list-deadline">{task.deadline?new Date(`${task.deadline}T00:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'—'}</span><button className="icon-button" onClick={()=>{setModalError('');setModalTask(task)}} aria-label="Edit task">•••</button></div>)}</div>}
          <div className="workspace-foot"><span>Showing {visibleTasks.length} {visibleTasks.length===1?'task':'tasks'}</span><span><span className="footer-status-dot"/> Synced just now</span></div>
        </section>
        <footer className="page-footer"><span>One thing at a time. You’re doing fine.</span><span>MADE FOR A MORE FOCUSED DAY <span className="footer-spark">✳</span></span></footer>
      </div>
    </main>
    {modalTask!==undefined&&<TaskModal task={modalTask?.id?modalTask:null} initialStatus={modalTask?.status} onClose={()=>setModalTask(undefined)} onSave={saveTask} saving={saving} error={modalError}/>}
    {notice&&<div className="toast"><Check size={16}/>{notice}</div>}
  </div>
}
