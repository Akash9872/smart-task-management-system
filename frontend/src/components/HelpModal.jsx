import { useMemo, useState } from 'react'
import { CircleHelp, Copy, ExternalLink, Search, X } from 'lucide-react'

const helpItems = [
  { question: 'How do I create a task?', answer: 'Choose New task, add a title, and optionally set a description, priority, deadline, and status. Select Create task to save it.' },
  { question: 'How do I change a task’s status?', answer: 'Drag a task card to another board column. You can also edit the task and choose To do, In progress, or Completed from the Status menu.' },
  { question: 'How does the task stopwatch work?', answer: 'The stopwatch starts automatically when a task is marked In progress. It keeps counting across refreshes and pauses when you move the task to another status. Time is saved in this browser for your account.' },
  { question: 'Can I find a task quickly?', answer: 'Use the search box to search task titles and descriptions. The Filter menu can narrow tasks by status or priority, and the sort controls change their order.' },
  { question: 'Why can’t I sign in?', answer: 'Check that you registered with this email address and that the password is correct. If the app shows a network error, make sure the backend is running and refresh the page.' },
]

export default function HelpModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')
  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return normalized ? helpItems.filter(item => `${item.question} ${item.answer}`.toLowerCase().includes(normalized)) : helpItems
  }, [query])

  async function copyFeedback() {
    if (!feedback.trim()) return
    try {
      await navigator.clipboard.writeText(feedback.trim())
      setMessage('Feedback copied. You can paste it into a message or issue.')
    } catch {
      setMessage('Clipboard access is unavailable. Select and copy your feedback text.')
    }
  }

  return <div className="modal-backdrop help-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div className="modal-head"><div><span className="eyebrow">TASKFLOW SUPPORT</span><h2 id="help-title">Help & feedback</h2></div><button className="icon-button close-button" onClick={onClose} aria-label="Close help"><X size={19}/></button></div>
      <p className="help-intro">Find a quick answer or share a note about your experience.</p>
      <label className="help-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions and answers" aria-label="Search help"/></label>
      <div className="help-questions">{items.length ? items.map(item => <details className="help-item" key={item.question}><summary><span>{item.question}</span><span className="help-plus">+</span></summary><p>{item.answer}</p></details>) : <p className="help-no-results"><CircleHelp size={17}/>No matching answers. Try another search.</p>}</div>
      <div className="help-feedback"><label htmlFor="feedback-text">Send feedback</label><textarea id="feedback-text" rows="3" maxLength="2000" value={feedback} onChange={event => { setFeedback(event.target.value); setMessage('') }} placeholder="What would make Taskflow better for you?"/><div className="help-feedback-actions"><span role="status">{message}</span><button className="button button-outline" onClick={copyFeedback} disabled={!feedback.trim()}><Copy size={14}/>Copy feedback</button><a className="button button-quiet" href="https://github.com/Akash9872/smart-task-management-system/issues" target="_blank" rel="noreferrer"><ExternalLink size={14}/>Open GitHub</a></div></div>
    </section>
  </div>
}
