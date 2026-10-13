import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Circle, Clock3, LayoutDashboard, LogOut, Plus, Trash2, Target, Timer, GraduationCap } from 'lucide-react';
import { api } from './api';

const today = () => new Date().toISOString().slice(0, 10);

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('smartstudy_token', result.token);
      onAuth(result.user);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="auth-wrap"><section className="auth-card">
    <div className="brand-mark"><GraduationCap size={27}/></div><p className="eyebrow">YOUR PERSONAL STUDY SPACE</p>
    <h1>Study smarter.<br/><span>Feel more prepared.</span></h1>
    <p className="muted">Keep your subjects, tasks and exam dates in one calm place.</p>
    <form onSubmit={submit} className="stack">
      {mode === 'register' && <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
      <label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
      <label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
    </form>
    <p className="switch-auth">{mode === 'login' ? 'New to SmartStudy?' : 'Already have an account?'} <button className="text-button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Create account':'Log in'}</button></p>
  </section></main>;
}

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [section, setSection] = useState('Overview');
  const [error, setError] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [seconds, setSeconds] = useState(25 * 60);
  const [timerOn, setTimerOn] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t,s,e] = await Promise.all([api('/tasks'), api('/subjects'), api('/exams')]);
      setTasks(t); setSubjects(s); setExams(e); setError('');
    } catch (err) {
      setError(err.message);
      if (/token|auth/i.test(err.message)) { localStorage.removeItem('smartstudy_token'); setUser(null); }
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('smartstudy_token')) return;
    api('/tasks').then(async () => {
      try {
        const [t,s,e] = await Promise.all([api('/tasks'),api('/subjects'),api('/exams')]);
        setTasks(t); setSubjects(s); setExams(e); setUser({name: 'Student'});
      } catch { localStorage.removeItem('smartstudy_token'); }
    }).catch(() => localStorage.removeItem('smartstudy_token'));
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => setSeconds(s => { if (s <= 1) { setTimerOn(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  const completed = useMemo(() => tasks.filter(t=>t.completed).length, [tasks]);
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const upcoming = exams.filter(e=>new Date(e.examDate) >= new Date(today())).slice(0,4);

  async function addTask(e) {
    e.preventDefault(); if (!taskTitle.trim()) return;
    try { const t = await api('/tasks',{method:'POST',body:JSON.stringify({title:taskTitle,subject:taskSubject})}); setTasks([t,...tasks]); setTaskTitle(''); setTaskSubject(''); }
    catch(err){setError(err.message);}
  }
  async function toggleTask(task) {
    try { const updated=await api(`/tasks/${task._id}`,{method:'PATCH',body:JSON.stringify({completed:!task.completed})}); setTasks(tasks.map(t=>t._id===task._id?updated:t)); }
    catch(err){setError(err.message);}
  }
  async function deleteTask(id) {
    try { await api(`/tasks/${id}`,{method:'DELETE'}); setTasks(tasks.filter(t=>t._id!==id)); }
    catch(err){setError(err.message);}
  }
  async function addSubject(e) {
    e.preventDefault(); if(!subjectName.trim())return;
    try { const s=await api('/subjects',{method:'POST',body:JSON.stringify({name:subjectName})}); setSubjects([s,...subjects]); setSubjectName(''); }
    catch(err){setError(err.message);}
  }
  async function deleteSubject(id) {
    try { await api(`/subjects/${id}`,{method:'DELETE'}); setSubjects(subjects.filter(s=>s._id!==id)); }
    catch(err){setError(err.message);}
  }
  async function addExam(e) {
    e.preventDefault(); if(!examTitle.trim()||!examDate)return;
    try { const ex=await api('/exams',{method:'POST',body:JSON.stringify({title:examTitle,subject:examSubject,examDate})}); setExams([...exams,ex].sort((a,b)=>new Date(a.examDate)-new Date(b.examDate))); setExamTitle('');setExamSubject('');setExamDate(''); }
    catch(err){setError(err.message);}
  }
  async function deleteExam(id) {
    try { await api(`/exams/${id}`,{method:'DELETE'}); setExams(exams.filter(e=>e._id!==id)); }
    catch(err){setError(err.message);}
  }
  function logout(){localStorage.removeItem('smartstudy_token');setUser(null);setTasks([]);setSubjects([]);setExams([]);}

  if (!user) return <Auth onAuth={setUser}/>;
  const nav = [
    {name:'Overview', icon:LayoutDashboard},
    {name:'My Tasks', icon:CheckCircle2},
    {name:'Subjects', icon:BookOpen},
    {name:'Exam Planner', icon:CalendarDays},
    {name:'Focus Timer', icon:Timer}
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="logo"><span className="logo-icon"><GraduationCap size={22}/></span><span>Smart<span className="logo-accent">Study</span><small>STUDENT WORKSPACE</small></span></div>
      <p className="nav-label">MENU</p>
      <nav>{nav.map(n=><button key={n.name} className={`nav-item ${section===n.name?'active':''}`} onClick={()=>setSection(n.name)}><n.icon size={18}/>{n.name}</button>)}</nav>
      <div className="sidebar-bottom"><div className="avatar">{(user.name||'S').charAt(0).toUpperCase()}</div><div className="user-label"><b>{user.name}</b><small>Student account</small></div><button className="icon-button" title="Log out" onClick={logout}><LogOut size={17}/></button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="eyebrow">MONDAY MOTIVATION, EVERY DAY</p><h2>{section==='Overview'?'Your study overview':section}</h2></div><div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</div></header>
      {error && <div className="alert">{error}<button onClick={()=>setError('')}>Dismiss</button></div>}
      {section==='Overview' && <div className="content">
        <section className="welcome"><div><span className="welcome-tag">✦ A LITTLE PROGRESS ADDS UP</span><h1>Hey, {user.name?.split(' ')[0] || 'Student'}!<br/>Ready to make today count?</h1><p>Your goals are within reach. Let’s take it one task at a time.</p><button className="light-button" onClick={()=>setSection('My Tasks')}>View my tasks <span>→</span></button></div><div className="welcome-art"><div className="art-circle"><BookOpen size={70}/></div><span className="spark spark-one">✦</span><span className="spark spark-two">✧</span></div></section>
        <div className="stats-grid">
          <Stat icon={CheckCircle2} label="Tasks completed" value={`${completed}/${tasks.length}`} note="Keep going, you're doing great" />
          <Stat icon={BookOpen} label="Your subjects" value={subjects.length} note="Your learning, organized" />
          <Stat icon={CalendarDays} label="Upcoming exams" value={upcoming.length} note="Stay one step ahead" />
          <Stat icon={Target} label="Task progress" value={`${progress}%`} note="Small wins matter" />
        </div>
        <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h3>Today's focus</h3><p>Make a little progress today</p></div><button className="text-button" onClick={()=>setSection('My Tasks')}>See all</button></div><form className="quick-add" onSubmit={addTask}><input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Add a task to your list…" required/><button className="primary small"><Plus size={17}/> Add</button></form><TaskList tasks={tasks.slice(0,5)} onToggle={toggleTask} onDelete={deleteTask}/></section>
        <section className="panel"><div className="panel-heading"><div><h3>Upcoming exams</h3><p>Be ready before the big day</p></div><button className="text-button" onClick={()=>setSection('Exam Planner')}>View all</button></div>{upcoming.length===0?<Empty text="No exams planned yet."/>:upcoming.map(ex=><div className="exam-row" key={ex._id}><div className="exam-date"><b>{new Date(ex.examDate).getDate()}</b><small>{new Date(ex.examDate).toLocaleDateString(undefined,{month:'short'})}</small></div><div className="exam-info"><b>{ex.title}</b><small>{ex.subject||'General subject'}</small></div><button className="icon-button" onClick={()=>deleteExam(ex._id)} title="Delete exam"><Trash2 size={15}/></button></div>)}</section></div>
      </div>}
      {section==='My Tasks' && <div className="content"><section className="panel"><div className="panel-heading"><div><h3>Your task list</h3><p>{completed} completed out of {tasks.length} tasks</p></div></div><form className="add-form" onSubmit={addTask}><input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="What do you need to study?" required/><select value={taskSubject} onChange={e=>setTaskSubject(e.target.value)}><option value="">Choose subject (optional)</option>{subjects.map(s=><option key={s._id}>{s.name}</option>)}</select><button className="primary"><Plus size={17}/> Add task</button></form><TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask}/></section></div>}
      {section==='Subjects' && <div className="content"><section className="panel"><div className="panel-heading"><div><h3>Your subjects</h3><p>Keep your learning areas organized</p></div></div><form className="add-form" onSubmit={addSubject}><input value={subjectName} onChange={e=>setSubjectName(e.target.value)} placeholder="e.g. Data Structures" required/><button className="primary"><Plus size={17}/> Add subject</button></form><div className="subject-grid">{subjects.map((s,i)=><div className="subject-card" key={s._id}><span className="subject-icon" style={{background:['#e9e8ff','#def6ed','#fff0df','#ffe4ec'][i%4]}}><BookOpen size={22}/></span><div><b>{s.name}</b><small>Study subject</small></div><button className="icon-button" onClick={()=>deleteSubject(s._id)} title="Delete subject"><Trash2 size={16}/></button></div>)}</div>{subjects.length===0&&<Empty text="Add your first subject to get started."/>}</section></div>}
      {section==='Exam Planner' && <div className="content"><section className="panel"><div className="panel-heading"><div><h3>Plan your exams</h3><p>Keep important dates in one place</p></div></div><form className="add-form" onSubmit={addExam}><input value={examTitle} onChange={e=>setExamTitle(e.target.value)} placeholder="Exam name" required/><input value={examSubject} onChange={e=>setExamSubject(e.target.value)} placeholder="Subject (optional)"/><input type="date" min={today()} value={examDate} onChange={e=>setExamDate(e.target.value)} required/><button className="primary"><Plus size={17}/> Add exam</button></form>{exams.length===0?<Empty text="No exams yet. Add an exam date above."/>:exams.map(ex=><div className="exam-row exam-row-large" key={ex._id}><div className="exam-date"><b>{new Date(ex.examDate).getDate()}</b><small>{new Date(ex.examDate).toLocaleDateString(undefined,{month:'short'})}</small></div><div className="exam-info"><b>{ex.title}</b><small>{ex.subject||'General subject'} · {new Date(ex.examDate).getFullYear()}</small></div><button className="icon-button" onClick={()=>deleteExam(ex._id)} title="Delete exam"><Trash2 size={16}/></button></div>)}</section></div>}
      {section==='Focus Timer' && <div className="content"><section className="panel timer-panel"><div className="timer-badge"><Timer size={23}/></div><p className="eyebrow">FOCUS MODE</p><h3>One thing at a time.</h3><p className="muted">Give one task your full attention. You’ve got this.</p><div className="timer-display">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</div><div className="timer-actions"><button className="primary" onClick={()=>setTimerOn(!timerOn)}>{timerOn?'Pause focus':'Start focus'}</button><button className="secondary" onClick={()=>{setTimerOn(false);setSeconds(25*60)}}>Reset 25 min</button></div><p className="timer-tip"><Clock3 size={16}/> Tip: take a short break after a focused session.</p></section></div>}
    </main>
  </div>;
}

function Stat({icon:Icon,label,value,note}) {
  return <section className="stat-card"><div className="stat-top"><span className="stat-icon"><Icon size={19}/></span><span className="stat-dot">↗</span></div><p>{label}</p><strong>{value}</strong><small>{note}</small></section>;
}
function Empty({text}) { return <div className="empty-state"><BookOpen size={25}/><p>{text}</p></div>; }
function TaskList({tasks,onToggle,onDelete}) {
  if (!tasks.length) return <Empty text="Nothing here yet. Add a task above."/>;
  return <div className="task-list">{tasks.map(t=><div className={`task-row ${t.completed?'task-done':''}`} key={t._id}><button className="check-button" onClick={()=>onToggle(t)} title={t.completed?'Mark incomplete':'Mark complete'}>{t.completed?<CheckCircle2 size={20}/>:<Circle size={20}/>}</button><div className="task-info"><b>{t.title}</b><small>{t.subject||'General study'}{t.dueDate?` · Due ${new Date(t.dueDate).toLocaleDateString()}`:''}</small></div><span className={`priority priority-${(t.priority||'Medium').toLowerCase()}`}>{t.priority||'Medium'}</span><button className="icon-button" onClick={()=>onDelete(t._id)} title="Delete task"><Trash2 size={15}/></button></div>)}</div>;
}
export default App;
