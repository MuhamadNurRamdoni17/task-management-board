import { useEffect, useMemo, useState } from 'react'
import './App.css'

type ColumnId = 'todo' | 'doing' | 'review' | 'done' | 'rework'
type Label = 'Feature' | 'Bug' | 'Issue' | 'Undefined'
type Priority = 'Low' | 'Medium' | 'High'

type TeamMember = {
  id: string
  name: string
  color: string
}

type ChecklistItem = {
  id: string
  title: string
  done: boolean
}

type Task = {
  id: string
  title: string
  description: string
  columnId: ColumnId
  assigneeIds: string[]
  dueDate: string
  label: Label
  priority: Priority
  checklist: ChecklistItem[]
  attachments: string[]
  coverImage?: string
}

type TaskFormState = {
  title: string
  description: string
  columnId: ColumnId
  assigneeIds: string[]
  dueDate: string
  label: Label
  priority: Priority
  checklistText: string
  attachmentsText: string
  coverImage: string
}

type Toast = {
  id: string
  kind: 'success' | 'info' | 'danger'
  message: string
}

const STORAGE_KEY = 'adhiasindo-task-board'
const TEAM_KEY = 'adhiasindo-team-members'
const THEME_KEY = 'adhiasindo-theme'

const columns: Array<{ id: ColumnId; title: string; accent: string }> = [
  { id: 'todo', title: 'To Do', accent: '#4f8cff' },
  { id: 'doing', title: 'Doing', accent: '#2fb7a1' },
  { id: 'review', title: 'Review', accent: '#f59e0b' },
  { id: 'done', title: 'Done', accent: '#22c55e' },
  { id: 'rework', title: 'Rework', accent: '#ef4444' },
]

const seedTeam: TeamMember[] = [
  { id: 'ari', name: 'Ari', color: '#4f8cff' },
  { id: 'bela', name: 'Bela', color: '#ff8a65' },
  { id: 'citra', name: 'Citra', color: '#8b5cf6' },
  { id: 'dimas', name: 'Dimas', color: '#10b981' },
  { id: 'eka', name: 'Eka', color: '#f59e0b' },
]

const assigneeColors = ['#1f2937', '#d97706', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b']

const labelColors: Record<Label, string> = {
  Feature: '#4f8cff',
  Bug: '#ef4444',
  Issue: '#f59e0b',
  Undefined: '#94a3b8',
}

const priorityColors: Record<Priority, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
}

const seedTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Research for podcast and video website',
    description: 'Collect references and outline the first IA for the creator landing page.',
    columnId: 'todo',
    assigneeIds: ['ari', 'bela'],
    dueDate: '2026-08-08',
    label: 'Feature',
    priority: 'Medium',
    checklist: [
      { id: 'task-1-c1', title: 'Benchmark 3 references', done: true },
      { id: 'task-1-c2', title: 'Draft hero section', done: false },
      { id: 'task-1-c3', title: 'Prepare moodboard', done: false },
    ],
    attachments: ['brief.pdf', 'moodboard.png'],
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'task-2',
    title: 'Design wireframes for the landing page revamp',
    description: 'Translate the content strategy into mobile-first wireframes.',
    columnId: 'doing',
    assigneeIds: ['citra', 'dimas'],
    dueDate: '2026-08-12',
    label: 'Feature',
    priority: 'High',
    checklist: [
      { id: 'task-2-c1', title: 'Header layout', done: true },
      { id: 'task-2-c2', title: 'CTA placement', done: false },
    ],
    attachments: ['wireframe.fig'],
    coverImage:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'task-3',
    title: 'Create and refine logo designs for the UI brand',
    description: 'Prepare a clean logo set and export variants for the design system.',
    columnId: 'review',
    assigneeIds: ['bela', 'eka'],
    dueDate: '2026-08-18',
    label: 'Issue',
    priority: 'Medium',
    checklist: [
      { id: 'task-3-c1', title: 'Monochrome version', done: true },
      { id: 'task-3-c2', title: 'Favicon export', done: false },
      { id: 'task-3-c3', title: 'Usage rules', done: false },
    ],
    attachments: ['logo-v1.ai', 'brand-guideline.pdf'],
    coverImage:
      'https://images.unsplash.com/photo-1494386346843-e12284507169?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'task-4',
    title: 'Create the Email Page layout and necessary components',
    description: 'Finish the responsive email page components and microcopy.',
    columnId: 'done',
    assigneeIds: ['ari', 'eka'],
    dueDate: '2026-08-04',
    label: 'Feature',
    priority: 'Low',
    checklist: [
      { id: 'task-4-c1', title: 'Sidebar', done: true },
      { id: 'task-4-c2', title: 'Message list', done: true },
    ],
    attachments: ['email-layout.sketch'],
    coverImage:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'task-5',
    title: 'Plan and execute training sessions for new hires',
    description: 'Turn the onboarding materials into a short learning path.',
    columnId: 'rework',
    assigneeIds: ['citra'],
    dueDate: '2026-08-09',
    label: 'Undefined',
    priority: 'Medium',
    checklist: [
      { id: 'task-5-c1', title: 'Draft agenda', done: true },
      { id: 'task-5-c2', title: 'Collect feedback', done: false },
    ],
    attachments: ['training-outline.docx'],
    coverImage:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80',
  },
]

const emptyForm: TaskFormState = {
  title: '',
  description: '',
  columnId: 'todo',
  assigneeIds: ['ari'],
  dueDate: '',
  label: 'Feature',
  priority: 'Medium',
  checklistText: '',
  attachmentsText: '',
  coverImage: '',
}

const buildFormState = (task: Task): TaskFormState => ({
  title: task.title,
  description: task.description,
  columnId: task.columnId,
  assigneeIds: task.assigneeIds,
  dueDate: task.dueDate,
  label: task.label,
  priority: task.priority,
  checklistText: task.checklist.map((item) => item.title).join('\n'),
  attachmentsText: task.attachments.join('\n'),
  coverImage: task.coverImage ?? '',
})

const formatDate = (value: string) => {
  if (!value) return 'No due date'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const createTaskId = () => `task-${crypto.randomUUID()}`
const createChecklistId = () => `check-${crypto.randomUUID()}`
const createAssigneeId = () => `member-${crypto.randomUUID()}`

const createAssigneeColor = (name: string) => {
  const hash = name
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0)

  return assigneeColors[hash % assigneeColors.length]
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Task[]) : seedTasks
    } catch {
      return seedTasks
    }
  })
  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const storedTeam = localStorage.getItem(TEAM_KEY)
      return storedTeam ? (JSON.parse(storedTeam) as TeamMember[]) : seedTeam
    } catch {
      return seedTeam
    }
  })
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY)
      if (storedTheme) {
        return storedTheme === 'dark'
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })
  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [labelFilter, setLabelFilter] = useState('all')
  const [dueDateFilter, setDueDateFilter] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formState, setFormState] = useState<TaskFormState>(emptyForm)
  const [newAssigneeName, setNewAssigneeName] = useState('')
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(TEAM_KEY, JSON.stringify(team))
  }, [team])

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    if (toasts.length === 0) return

    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1))
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [toasts])

  const isEditingExistingTask = editingTask
    ? tasks.some((task) => task.id === editingTask.id)
    : false

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const assigneeNames = task.assigneeIds
        .map((assigneeId) => team.find((member) => member.id === assigneeId)?.name ?? '')
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [task.title, task.description, assigneeNames, task.label, task.priority]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesAssignee = assigneeFilter === 'all' || task.assigneeIds.includes(assigneeFilter)
      const matchesLabel = labelFilter === 'all' || task.label === labelFilter
      const matchesDueDate = !dueDateFilter || task.dueDate === dueDateFilter

      return matchesSearch && matchesAssignee && matchesLabel && matchesDueDate
    })
  }, [assigneeFilter, dueDateFilter, labelFilter, search, tasks, team])

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  )

  const totals = useMemo(
    () =>
      columns.map((column) => {
        const columnTasks = filteredTasks.filter((task) => task.columnId === column.id)
        const completedChecklistItems = columnTasks.reduce(
          (sum, task) => sum + task.checklist.filter((item) => item.done).length,
          0,
        )
        const totalChecklistItems = columnTasks.reduce((sum, task) => sum + task.checklist.length, 0)
        const progress = totalChecklistItems === 0 ? 0 : Math.round((completedChecklistItems / totalChecklistItems) * 100)

        return {
          ...column,
          count: columnTasks.length,
          progress,
          checklistCount: totalChecklistItems,
        }
      }),
    [filteredTasks],
  )

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.columnId === 'done').length
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const activeUsers = team.slice(0, 4)
  const profileName = 'Muhamad Nur Ramdoni'
  const profileRole = 'Frontend'

  const showToast = (kind: Toast['kind'], message: string) => {
    setToasts((current) => [...current, { id: crypto.randomUUID(), kind, message }])
  }

  const addAssignee = () => {
    const name = newAssigneeName.trim()

    if (!name) {
      return
    }

    const existingMember = team.find((member) => member.name.toLowerCase() === name.toLowerCase())

    if (existingMember) {
      setFormState((current) =>
        current.assigneeIds.includes(existingMember.id)
          ? current
          : { ...current, assigneeIds: [...current.assigneeIds, existingMember.id] },
      )
      setNewAssigneeName('')
      showToast('info', `${existingMember.name} added as assignee`)
      return
    }

    const newMember: TeamMember = {
      id: createAssigneeId(),
      name,
      color: createAssigneeColor(name),
    }

    setTeam((current) => [...current, newMember])
    setFormState((current) => ({
      ...current,
      assigneeIds: [...current.assigneeIds, newMember.id],
    }))
    setNewAssigneeName('')
    showToast('success', `${newMember.name} added as assignee`)
  }

  const openCreateModal = (columnId: ColumnId) => {
    const draftTask: Task = {
      id: createTaskId(),
      title: '',
      description: '',
      columnId,
      assigneeIds: ['ari'],
      dueDate: '',
      label: 'Feature',
      priority: 'Medium',
      checklist: [],
      attachments: [],
      coverImage: '',
    }

    setEditingTask(draftTask)
    setFormState(buildFormState(draftTask))
    setNewAssigneeName('')
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormState(buildFormState(task))
    setNewAssigneeName('')
  }

  const closeModal = () => {
    setEditingTask(null)
  }

  const saveTask = () => {
    if (!editingTask || formState.title.trim().length === 0) {
      return
    }

    const checklist = formState.checklistText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((title) => ({ id: createChecklistId(), title, done: false }))

    const attachments = formState.attachmentsText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    const updatedTask: Task = {
      ...editingTask,
      title: formState.title.trim(),
      description: formState.description.trim(),
      columnId: formState.columnId,
      assigneeIds: formState.assigneeIds,
      dueDate: formState.dueDate,
      label: formState.label,
      priority: formState.priority,
      checklist: checklist.length > 0 ? checklist : editingTask.checklist,
      attachments: attachments.length > 0 ? attachments : editingTask.attachments,
      coverImage: formState.coverImage.trim() || undefined,
    }

    const wasExisting = tasks.some((task) => task.id === updatedTask.id)

    setTasks((current) => {
      if (wasExisting) {
        return current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      }

      return [updatedTask, ...current]
    })

    showToast(wasExisting ? 'success' : 'success', wasExisting ? 'Task updated successfully' : 'Task created successfully')
    closeModal()
  }

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId))
    setSelectedTaskId(null)
    showToast('danger', 'Task deleted')
  }

  const moveTask = (taskId: string, columnId: ColumnId) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, columnId } : task)),
    )
    showToast('info', `Task moved to ${columns.find((column) => column.id === columnId)?.title}`)
  }

  const toggleTheme = () => {
    setIsDarkMode((current) => !current)
  }

  const toggleChecklistItem = (taskId: string, checklistItemId: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        return {
          ...task,
          checklist: task.checklist.map((item) =>
            item.id === checklistItemId ? { ...item, done: !item.done } : item,
          ),
        }
      }),
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-copy">
          <p className="eyebrow">Adhiasindo</p>
          <h1>Task Management Board</h1>
          <p className="subtitle">
            React Kanban board with local persistence, filtering, drag-and-drop, and editable task detail.
          </p>
        </div>

        <div className="topbar-panel">
          <div className="topbar-metrics">
            <div className="metric-chip">
              <span>Total tasks</span>
              <strong>{totalTasks}</strong>
            </div>
            <div className="metric-chip metric-chip--accent">
              <span>Done</span>
              <strong>{completionPercentage}%</strong>
            </div>
          </div>

          <div className="topbar-persona">
            <div className="avatar-stack" aria-label="Team members">
              {activeUsers.map((member) => (
                <span key={member.id} className="avatar avatar--stack" title={member.name} style={{ backgroundColor: member.color }}>
                  {initials(member.name)}
                </span>
              ))}
            </div>

            <button type="button" className="icon-button" aria-label={`Notifications ${toasts.length}`}>
              <span aria-hidden="true">🔔</span>
              {toasts.length > 0 ? <span className="icon-badge">{toasts.length}</span> : null}
            </button>

            <button type="button" className="icon-button" onClick={toggleTheme} aria-label="Toggle dark mode">
              <span aria-hidden="true">{isDarkMode ? '☀' : '🌙'}</span>
            </button>

            <div className="profile-chip">
              <span className="profile-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.86 0-7 2.24-7 5v1h14v-1c0-2.76-3.14-5-7-5Z" />
                </svg>
              </span>
              <div className="profile-meta">
                <strong>{profileName}</strong>
                <span>{profileRole}</span>
              </div>
            </div>
          </div>

          <button className="primary-button header-cta" type="button" onClick={() => openCreateModal('todo')}>
            + New Task
          </button>
        </div>
      </header>

      <section className="toolbar" aria-label="Task filters">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={search}
            placeholder="Search title, description, label, or assignee"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          <span>Assignee</span>
          <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
            <option value="all">All assignees</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Label</span>
          <select value={labelFilter} onChange={(event) => setLabelFilter(event.target.value)}>
            <option value="all">All labels</option>
            {(['Feature', 'Bug', 'Issue', 'Undefined'] as Label[]).map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Due Date</span>
          <input type="date" value={dueDateFilter} onChange={(event) => setDueDateFilter(event.target.value)} />
        </label>
      </section>

      <section className="stats-row" aria-label="Board summary">
        {totals.map((column) => (
          <article key={column.id} className="stat-card stat-card--modern" style={{ ['--accent' as string]: column.accent }}>
            <div className="stat-card-header">
              <div>
                <span>{column.title}</span>
                <strong>{column.count}</strong>
              </div>
              <div className="stat-card-badge">{column.progress}%</div>
            </div>

            <div className="stat-card-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${column.progress}%`, background: column.accent }} />
              </div>
            </div>

            <div className="stat-card-footer">
              <span>{column.checklistCount} checklist items</span>
              <span>{column.count === 0 ? 'No tasks yet' : 'Active column'}</span>
            </div>
          </article>
        ))}
      </section>

      <main className="board" onDragOver={(event) => event.preventDefault()}>
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((task) => task.columnId === column.id)

          return (
            <section
              key={column.id}
              className={`column ${dragOverColumnId === column.id ? 'column--drag-over' : ''}`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOverColumnId(column.id)
              }}
              onDragEnter={() => setDragOverColumnId(column.id)}
              onDragLeave={() => setDragOverColumnId((current) => (current === column.id ? null : current))}
              onDrop={() => {
                if (draggedTaskId) {
                  moveTask(draggedTaskId, column.id)
                  setDraggedTaskId(null)
                }
                setDragOverColumnId(null)
              }}
            >
              <header className="column-header">
                <div>
                  <h2>{column.title}</h2>
                  <p>{columnTasks.length} task(s)</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => openCreateModal(column.id)}>
                  + Add
                </button>
              </header>

              <div className="column-content">
                {columnTasks.length === 0 ? (
                  <button type="button" className="empty-state" onClick={() => openCreateModal(column.id)}>
                    Drop task here or add a new one
                  </button>
                ) : (
                  columnTasks.map((task) => {
                    const completedCount = task.checklist.filter((item) => item.done).length
                    const checklistProgress =
                      task.checklist.length > 0 ? (completedCount / task.checklist.length) * 100 : 0

                    return (
                      <article
                        key={task.id}
                        className="task-card"
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        {task.coverImage ? <img src={task.coverImage} alt="Task cover" className="cover" /> : null}

                        <div className="task-card-body">
                          <div className="task-card-topline">
                            <span className="label-pill" style={{ ['--pill' as string]: labelColors[task.label] }}>
                              {task.label}
                            </span>
                            <span
                              className="priority-pill"
                              style={{ ['--priority' as string]: priorityColors[task.priority] }}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <h3>{task.title}</h3>
                          <p>{task.description}</p>

                          <div className="task-meta">
                            <span>{formatDate(task.dueDate)}</span>
                            <span>{task.checklist.length} subtasks</span>
                          </div>

                          <div className="avatars">
                            {task.assigneeIds.map((assigneeId) => {
                              const member = team.find((item) => item.id === assigneeId)
                              if (!member) return null

                              return (
                                <span
                                  key={member.id}
                                  className="avatar"
                                  title={member.name}
                                  style={{ backgroundColor: member.color }}
                                >
                                  {initials(member.name)}
                                </span>
                              )
                            })}
                          </div>

                          <div className="progress-block">
                            <div className="progress-label">
                              <span>Checklist progress</span>
                              <strong>{task.checklist.length === 0 ? '0%' : `${Math.round(checklistProgress)}%`}</strong>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: `${checklistProgress}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="task-actions">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openEditModal(task)
                            }}
                          >
                            <span aria-hidden="true">✏</span>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              deleteTask(task.id)
                            }}
                          >
                            <span aria-hidden="true">🗑</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </article>
                    )
                  })
                )}
              </div>
            </section>
          )
        })}
      </main>

      {selectedTask ? (
        <div className="detail-panel" role="dialog" aria-modal="true" aria-label="Task detail panel">
          <div className="detail-panel-card">
            <div className="detail-header">
              <div>
                <p className="eyebrow">Task detail</p>
                <h2>{selectedTask.title}</h2>
              </div>
              <button type="button" className="ghost-button" onClick={() => setSelectedTaskId(null)}>
                Close
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-main">
                <section>
                  <h3>Description</h3>
                  <p>{selectedTask.description || 'No description available.'}</p>
                </section>

                <section>
                  <h3>Checklist</h3>
                  <div className="checklist-progress">
                    <span>
                      {selectedTask.checklist.filter((item) => item.done).length}/{selectedTask.checklist.length}
                    </span>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width:
                            selectedTask.checklist.length === 0
                              ? '0%'
                              : `${(selectedTask.checklist.filter((item) => item.done).length / selectedTask.checklist.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="checklist-list">
                    {selectedTask.checklist.length === 0 ? (
                      <p>No subtasks added yet.</p>
                    ) : (
                      selectedTask.checklist.map((item) => (
                        <label key={item.id} className="checklist-item">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleChecklistItem(selectedTask.id, item.id)}
                          />
                          <span>{item.title}</span>
                        </label>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <h3>Attachments</h3>
                  <div className="attachment-list">
                    {selectedTask.attachments.length === 0 ? (
                      <p>No attachments.</p>
                    ) : (
                      selectedTask.attachments.map((attachment) => <span key={attachment}>{attachment}</span>)
                    )}
                  </div>
                </section>
              </div>

              <aside className="detail-side">
                <section>
                  <h3>Properties</h3>
                  <dl>
                    <div>
                      <dt>Column</dt>
                      <dd>{columns.find((column) => column.id === selectedTask.columnId)?.title}</dd>
                    </div>
                    <div>
                      <dt>Label</dt>
                      <dd>{selectedTask.label}</dd>
                    </div>
                    <div>
                      <dt>Priority</dt>
                      <dd>{selectedTask.priority}</dd>
                    </div>
                    <div>
                      <dt>Due date</dt>
                      <dd>{formatDate(selectedTask.dueDate)}</dd>
                    </div>
                    <div>
                      <dt>Assignee</dt>
                      <dd>
                        {selectedTask.assigneeIds
                          .map((assigneeId) => team.find((member) => member.id === assigneeId)?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </dd>
                    </div>
                  </dl>
                </section>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      openEditModal(selectedTask)
                      setSelectedTaskId(null)
                    }}
                  >
                    Edit task
                  </button>
                  <button type="button" className="danger-button" onClick={() => deleteTask(selectedTask.id)}>
                    Delete task
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {editingTask ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Task form modal">
          <form
            className="task-modal"
            onSubmit={(event) => {
              event.preventDefault()
              saveTask()
            }}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">{isEditingExistingTask ? 'Edit task' : 'Create task'}</p>
                <h2>Task form</h2>
              </div>
              <button type="button" className="ghost-button" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="modal-grid">
              <label>
                <span>Title</span>
                <input
                  value={formState.title}
                  onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Task title"
                  required
                />
              </label>

              <label>
                <span>Column</span>
                <select
                  value={formState.columnId}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, columnId: event.target.value as ColumnId }))
                  }
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-width">
                <span>Description</span>
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  placeholder="Short task description"
                />
              </label>

              <label className="assignee-field full-width">
                <span>Assignee</span>
                <div className="assignee-field-row">
                  <select
                    multiple
                    value={formState.assigneeIds}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        assigneeIds: Array.from(event.target.selectedOptions, (option) => option.value),
                      }))
                    }
                  >
                    {team.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>

                  <div className="assignee-add-box">
                    <input
                      value={newAssigneeName}
                      onChange={(event) => setNewAssigneeName(event.target.value)}
                      placeholder="Type new assignee name"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addAssignee()
                        }
                      }}
                    />
                    <button type="button" className="ghost-button" onClick={addAssignee}>
                      + Add
                    </button>
                  </div>
                </div>
              </label>

              <label>
                <span>Due date</span>
                <input
                  type="date"
                  value={formState.dueDate}
                  onChange={(event) => setFormState((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </label>

              <label>
                <span>Label</span>
                <select
                  value={formState.label}
                  onChange={(event) => setFormState((current) => ({ ...current, label: event.target.value as Label }))}
                >
                  {(['Feature', 'Bug', 'Issue', 'Undefined'] as Label[]).map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Priority</span>
                <select
                  value={formState.priority}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, priority: event.target.value as Priority }))
                  }
                >
                  {(['Low', 'Medium', 'High'] as Priority[]).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-width">
                <span>Checklist items</span>
                <textarea
                  value={formState.checklistText}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, checklistText: event.target.value }))
                  }
                  rows={4}
                  placeholder="One subtask per line"
                />
              </label>

              <label className="full-width">
                <span>Attachments</span>
                <textarea
                  value={formState.attachmentsText}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, attachmentsText: event.target.value }))
                  }
                  rows={3}
                  placeholder="One file name per line"
                />
              </label>

              <label className="full-width">
                <span>Cover image URL</span>
                <input
                  value={formState.coverImage}
                  onChange={(event) => setFormState((current) => ({ ...current, coverImage: event.target.value }))}
                  placeholder="Optional cover image"
                />
              </label>
            </div>

            <div className="modal-footer">
              {isEditingExistingTask ? (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => {
                    deleteTask(editingTask.id)
                    closeModal()
                  }}
                >
                  Delete
                </button>
              ) : null}

              <div className="footer-actions">
                <button type="button" className="ghost-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save task
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.kind}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
