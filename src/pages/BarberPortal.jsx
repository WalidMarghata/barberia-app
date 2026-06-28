import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase.js'

const STATUS_LABELS = { confirmed: 'Confermato', done: 'Fatto', cancelled: 'Annullato', no_show: 'Non presentato' }
const STATUS_COLORS = { confirmed: '#C79A45', done: '#4ade80', cancelled: '#f87171', no_show: '#fb923c' }

function fmt(d) { return d.toISOString().split('T')[0] }
function addDays(s, n) { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return fmt(d) }
function dayLabel(s) { return new Date(s + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) }

const ADMIN_PASSWORD = 'admin2025'

const PROFILE_TYPES = [
  { id: 'barber', icon: '✂', label: 'Barbiere', desc: 'Accedi con il tuo PIN personale', color: '#C79A45' },
  { id: 'admin',  icon: '👑', label: 'Amministratore', desc: 'Gestione completa del salone', color: '#E8A87C' },
]

function LoginScreen({ barbers, onBarberLogin }) {
  const [profile, setProfile] = useState(null)       // null | 'barber' | 'admin'
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [credential, setCredential] = useState('')
  const [err, setErr] = useState(false)

  function handleLogin() {
    if (profile === 'admin') {
      if (credential === ADMIN_PASSWORD) { window.location.hash = '/admin' }
      else setErr(true)
    } else {
      if (credential === selectedBarber.pin) onBarberLogin(selectedBarber)
      else setErr(true)
    }
  }

  function goBack() {
    if (selectedBarber) { setSelectedBarber(null); setCredential(''); setErr(false) }
    else { setProfile(null); setCredential(''); setErr(false) }
  }

  const pt = PROFILE_TYPES.find(p => p.id === profile)

  return (
    <div style={{ minHeight: '100svh', background: '#0d0804', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Work Sans', sans-serif", padding: 16 }}>
      <div style={{ background: 'rgba(16,12,6,0.97)', border: '1px solid rgba(199,154,69,0.25)', borderRadius: 24, padding: '36px 28px', width: '100%', maxWidth: 360, textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#e8c87a,#9a6b1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: '0 6px 24px rgba(199,154,69,0.3)' }}>✂</div>
        <h1 style={{ fontFamily: 'serif', color: '#e8c87a', fontSize: '1rem', letterSpacing: '0.2em', marginBottom: 4 }}>AREA RISERVATA</h1>
        <p style={{ color: 'rgba(182,165,135,0.4)', fontSize: '0.72rem', marginBottom: 28 }}>Hassan Barber — Verona</p>

        {/* STEP 1 — tipo perfil */}
        {!profile && (
          <>
            <p style={{ fontSize: '0.7rem', color: 'rgba(182,165,135,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Seleziona il profilo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROFILE_TYPES.map(p => (
                <button key={p.id} onClick={() => { setProfile(p.id); setCredential(''); setErr(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, border: `1px solid ${p.color}40`, background: `${p.color}0a`, cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${p.color},${p.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0e6d0', marginBottom: 3 }}>{p.label}</p>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(182,165,135,0.45)' }}>{p.desc}</p>
                  </div>
                  <span style={{ color: p.color, fontSize: '1.1rem', opacity: 0.6 }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — seleciona barbeiro (só se perfil = barber) */}
        {profile === 'barber' && !selectedBarber && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={goBack} style={{ padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,154,69,0.15)', color: 'rgba(182,165,135,0.5)', fontSize: '0.75rem', cursor: 'pointer' }}>← Indietro</button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10, background: `${pt.color}0d`, border: `1px solid ${pt.color}30` }}>
                <span>{pt.icon}</span>
                <span style={{ fontSize: '0.78rem', color: '#f0e6d0', fontWeight: 600 }}>{pt.label}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(182,165,135,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Chi sei?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {barbers.map(b => (
                <button key={b.id} onClick={() => { setSelectedBarber(b); setCredential(''); setErr(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: `1px solid ${b.color || '#C79A45'}35`, background: `${b.color || '#C79A45'}08`, cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${b.color || '#C79A45'},${b.color || '#C79A45'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>✂</div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f0e6d0' }}>{b.name}</span>
                  <span style={{ marginLeft: 'auto', color: b.color || '#C79A45', fontSize: '1rem', opacity: 0.5 }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 — inserir PIN ou password */}
        {(profile === 'admin' || (profile === 'barber' && selectedBarber)) && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <button onClick={goBack} style={{ padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,154,69,0.15)', color: 'rgba(182,165,135,0.5)', fontSize: '0.75rem', cursor: 'pointer' }}>← Indietro</button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10, background: `${pt.color}0d`, border: `1px solid ${pt.color}30` }}>
                <span>{pt.icon}</span>
                <span style={{ fontSize: '0.78rem', color: '#f0e6d0', fontWeight: 600 }}>
                  {profile === 'admin' ? pt.label : selectedBarber.name}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.45)', marginBottom: 12 }}>
              {profile === 'admin' ? 'Inserisci la password' : `PIN di ${selectedBarber.name}`}
            </p>

            <input
              type="password"
              inputMode={profile === 'barber' ? 'numeric' : 'text'}
              maxLength={profile === 'barber' ? 4 : undefined}
              placeholder={profile === 'barber' ? '● ● ● ●' : 'Password'}
              value={credential}
              autoFocus
              onChange={e => { setCredential(e.target.value); setErr(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: `1px solid ${err ? '#f87171' : 'rgba(199,154,69,0.25)'}`, background: 'rgba(10,8,4,0.8)', color: '#f0e6d0', fontSize: profile === 'barber' ? '1.4rem' : '1rem', textAlign: 'center', letterSpacing: profile === 'barber' ? '0.4em' : '0.05em', boxSizing: 'border-box', marginBottom: 12, outline: 'none' }}
            />
            {err && <p style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: 10 }}>{profile === 'admin' ? 'Password errata' : 'PIN non valido'}</p>}

            <button onClick={handleLogin}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#e8c87a,#c79a45)', color: '#1a1105', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.92rem', letterSpacing: '0.05em' }}>
              Accedi
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function BarberPortal() {
  const [barber, setBarber] = useState(null)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [barbers, setBarbers] = useState([])
  const [date, setDate] = useState(fmt(new Date()))
  const [appointments, setAppointments] = useState([])
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(false)
  const [blockTime, setBlockTime] = useState('')
  const [blockReason, setBlockReason] = useState('Indisponibile')
  const [blockFullDay, setBlockFullDay] = useState(false)
  const [view, setView] = useState('today') // 'today' | 'week' | 'block'
  const [weekAppts, setWeekAppts] = useState([])

  useEffect(() => {
    supabase.from('barbers').select('*').eq('active', true).then(({ data }) => setBarbers(data || []))
  }, [])

  const load = useCallback(async () => {
    if (!barber) return
    setLoading(true)
    const [{ data: apps }, { data: blk }] = await Promise.all([
      supabase.from('appointments').select('*').eq('barber_id', barber.id).eq('date', date).order('time'),
      supabase.from('blocked_slots').select('*').eq('barber_id', barber.id).eq('date', date)
    ])
    setAppointments(apps || [])
    setBlocked(blk || [])
    setLoading(false)
  }, [barber, date])

  const loadWeek = useCallback(async () => {
    if (!barber) return
    const start = fmt(new Date())
    const end = addDays(start, 7)
    const { data } = await supabase.from('appointments').select('*')
      .eq('barber_id', barber.id).gte('date', start).lte('date', end)
      .neq('status', 'cancelled').order('date').order('time')
    setWeekAppts(data || [])
  }, [barber])

  useEffect(() => { if (barber) { load(); loadWeek() } }, [barber, load, loadWeek])

  async function tryLogin() {
    const found = barbers.find(b => b.pin === pin)
    if (found) { setBarber(found); setPinErr(false) }
    else setPinErr(true)
  }

  async function updateStatus(id, status) {
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    load(); loadWeek()
  }

  async function addBlock() {
    await supabase.from('blocked_slots').insert({
      barber_id: barber.id,
      date: date,
      time: blockFullDay ? null : (blockTime || null),
      reason: blockReason || 'Indisponibile'
    })
    setBlockTime('')
    load()
  }

  async function deleteBlock(id) {
    await supabase.from('blocked_slots').delete().eq('id', id)
    load()
  }

  const color = barber?.color || '#C79A45'
  const today = fmt(new Date())

  if (!barber) return <LoginScreen barbers={barbers} onBarberLogin={b => { setBarber(b); setPinErr(false) }} />


  return (
    <div style={{ minHeight: '100svh', background: '#0d0804', fontFamily: "'Work Sans', sans-serif", color: '#f0e6d0' }}>
      {/* Header */}
      <div style={{ background: 'rgba(10,8,4,0.97)', borderBottom: `1px solid ${color}30`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          <span style={{ fontFamily: 'serif', fontSize: '1rem', color: '#f0e6d0', letterSpacing: '0.08em' }}>{barber.name}</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(182,165,135,0.4)', background: 'rgba(255,255,255,0.04)', padding: '2px 10px', borderRadius: 100, letterSpacing: '0.08em' }}>BARBIERE</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.4)', textDecoration: 'none', padding: '6px 10px', border: '1px solid rgba(199,154,69,0.12)', borderRadius: 8 }}>&#8592; Sito</a>
          <button onClick={() => { setBarber(null); setPin('') }} style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.4)', background: 'none', border: '1px solid rgba(199,154,69,0.12)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Esci</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
        {/* View tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4 }}>
          {[{ k: 'today', label: 'Oggi' }, { k: 'week', label: 'Prossimi 7 giorni' }, { k: 'block', label: 'Blocca orario' }].map(t => (
            <button key={t.k} onClick={() => setView(t.k)}
              style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: view === t.k ? color : 'transparent', color: view === t.k ? '#1a1105' : 'rgba(182,165,135,0.5)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY view */}
        {view === 'today' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setDate(addDays(date, -1))} style={{ padding: '7px 14px', background: 'rgba(20,15,8,0.8)', border: '1px solid rgba(199,154,69,0.2)', borderRadius: 9, color: '#e8c87a', cursor: 'pointer' }}>&#8249;</button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontFamily: 'serif', fontSize: '0.95rem', color: '#e8c87a', textTransform: 'capitalize' }}>{dayLabel(date)}</p>
              </div>
              <button onClick={() => setDate(addDays(date, 1))} style={{ padding: '7px 14px', background: 'rgba(20,15,8,0.8)', border: '1px solid rgba(199,154,69,0.2)', borderRadius: 9, color: '#e8c87a', cursor: 'pointer' }}>&#8250;</button>
              {date !== today && <button onClick={() => setDate(today)} style={{ padding: '7px 12px', background: 'linear-gradient(135deg,#e8c87a,#c79a45)', border: 'none', borderRadius: 9, color: '#1a1105', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Oggi</button>}
            </div>
            {/* Blocked */}
            {blocked.map(b => (
              <div key={b.id} style={{ marginBottom: 8, padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#f87171' }}>🚫 {b.time || 'Tutto il giorno'} — {b.reason}</span>
                <button onClick={() => deleteBlock(b.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>&#x2715;</button>
              </div>
            ))}
            {loading ? (
              <p style={{ textAlign: 'center', color: 'rgba(182,165,135,0.4)', padding: 40 }}>Caricamento...</p>
            ) : appointments.length === 0 && blocked.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>&#x2615;</p>
                <p style={{ color: 'rgba(182,165,135,0.4)', fontSize: '0.85rem' }}>Nessun appuntamento per questo giorno</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {appointments.map(a => (
                  <div key={a.id} style={{ background: 'rgba(18,13,6,0.9)', border: `1px solid ${STATUS_COLORS[a.status] || color}30`, borderRadius: 14, padding: '16px', opacity: ['cancelled', 'no_show'].includes(a.status) ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'serif', fontSize: '1.3rem', color }}>{a.time}</span>
                      <span style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 100, background: `${STATUS_COLORS[a.status]}18`, color: STATUS_COLORS[a.status], border: `1px solid ${STATUS_COLORS[a.status]}35` }}>{STATUS_LABELS[a.status] || a.status}</span>
                    </div>
                    <p style={{ fontSize: '1rem', color: '#f0e6d0', fontWeight: 600, marginBottom: 3 }}>{a.customer_name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(182,165,135,0.55)', marginBottom: 4 }}>{a.service_name} · €{a.service_price} · {a.service_duration} min</p>
                    <a href={`tel:${a.customer_phone}`} style={{ fontSize: '0.75rem', color: color, textDecoration: 'none', display: 'block', marginBottom: a.notes ? 6 : 0 }}>📞 {a.customer_phone}</a>
                    {a.notes && <p style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.45)', fontStyle: 'italic', borderTop: '1px solid rgba(199,154,69,0.08)', paddingTop: 8, marginTop: 6 }}>{a.notes}</p>}
                    {a.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => updateStatus(a.id, 'done')} style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>&#x2713; Fatto</button>
                        <button onClick={() => updateStatus(a.id, 'no_show')} style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c', fontSize: '0.78rem', cursor: 'pointer' }}>Non venuto</button>
                        <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}>Annulla</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WEEK view */}
        {view === 'week' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weekAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: 'rgba(182,165,135,0.4)', fontSize: '0.85rem' }}>Nessun appuntamento nei prossimi 7 giorni</p>
              </div>
            ) : weekAppts.map(a => (
              <div key={a.id} style={{ background: 'rgba(18,13,6,0.9)', border: '1px solid rgba(199,154,69,0.15)', borderRadius: 12, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(182,165,135,0.5)', textTransform: 'capitalize' }}>{dayLabel(a.date)}</span>
                  <span style={{ fontFamily: 'serif', fontSize: '0.95rem', color }}>{a.time}</span>
                </div>
                <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f0e6d0', marginBottom: 2 }}>{a.customer_name}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.5)' }}>{a.service_name} · €{a.service_price}</p>
              </div>
            ))}
          </div>
        )}

        {/* BLOCK view */}
        {view === 'block' && (
          <div style={{ background: 'rgba(16,12,6,0.9)', border: '1px solid rgba(199,154,69,0.15)', borderRadius: 16, padding: 24 }}>
            <p style={{ fontFamily: 'serif', fontSize: '0.9rem', color: '#e8c87a', letterSpacing: '0.1em', marginBottom: 20 }}>BLOCCA ORARIO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.5)', display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>DATA</label>
                <input
                  type="date"
                  value={date}
                  min={fmt(new Date())}
                  onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: 'rgba(182,165,135,0.6)', cursor: 'pointer' }}>
                <input type="checkbox" checked={blockFullDay} onChange={e => setBlockFullDay(e.target.checked)} style={{ accentColor: color }} />
                Tutto il giorno
              </label>
              {!blockFullDay && (
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.5)', display: 'block', marginBottom: 6 }}>ORARIO</label>
                  <input
                    type="time"
                    value={blockTime}
                    onChange={e => setBlockTime(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.5)', display: 'block', marginBottom: 6 }}>MOTIVO</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="es. Ferie, Pausa pranzo..."
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={addBlock}
                style={{ padding: '13px', borderRadius: 10, background: `linear-gradient(135deg,${color},#9a6b1a)`, color: '#1a1105', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}>
                + Blocca orario
              </button>
            </div>

            {/* Current blocked for this date */}
            {blocked.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(199,154,69,0.1)' }}>
                <p style={{ fontSize: '0.65rem', color: 'rgba(182,165,135,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>BLOCCATI IN {dayLabel(date).toUpperCase()}</p>
                {blocked.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(182,165,135,0.55)' }}>{b.time || 'Tutto il giorno'} — {b.reason}</span>
                    <button onClick={() => deleteBlock(b.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.82rem' }}>&#x2715;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
