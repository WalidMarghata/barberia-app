import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase.js'

const ADMIN_PASSWORD = 'admin2025'

function fmt(dateObj) {
  return dateObj.toISOString().split('T')[0]
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return fmt(d)
}

function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
}

const STATUS_LABELS = { confirmed: 'Confermato', done: 'Fatto', cancelled: 'Annullato', no_show: 'Non presentato' }
const STATUS_COLORS = { confirmed: '#C79A45', done: '#4ade80', cancelled: '#f87171', no_show: '#fb923c' }

export default function AdminPanel() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [date, setDate] = useState(fmt(new Date()))
  const [appointments, setAppointments] = useState([])
  const [barbers, setBarbers] = useState([])
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(false)
  // Block form
  const [blockBarber, setBlockBarber] = useState('')
  const [blockDate, setBlockDate] = useState(fmt(new Date()))
  const [blockTime, setBlockTime] = useState('')
  const [blockReason, setBlockReason] = useState('Indisponibile')
  const [blockFullDay, setBlockFullDay] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: apps }, { data: brs }, { data: blk }] = await Promise.all([
      supabase.from('appointments').select('*').eq('date', date).order('time'),
      supabase.from('barbers').select('*').eq('active', true).order('name'),
      supabase.from('blocked_slots').select('*').eq('date', date)
    ])
    setAppointments(apps || [])
    setBarbers(brs || [])
    setBlocked(blk || [])
    setLoading(false)
  }, [date])

  useEffect(() => { if (auth) load() }, [auth, load])

  async function updateStatus(id, status) {
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    load()
  }

  async function addBlock() {
    if (!blockBarber || !blockDate) return
    await supabase.from('blocked_slots').insert({
      barber_id: blockBarber,
      date: blockDate,
      time: blockFullDay ? null : (blockTime || null),
      reason: blockReason || 'Indisponibile'
    })
    setBlockTime('')
    setBlockReason('Indisponibile')
    load()
  }

  async function deleteBlock(id) {
    await supabase.from('blocked_slots').delete().eq('id', id)
    load()
  }

  if (!auth) return (
    <div style={{ minHeight: '100svh', background: '#0d0804', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Work Sans', sans-serif" }}>
      <div style={{ background: 'rgba(20,15,8,0.95)', border: '1px solid rgba(199,154,69,0.3)', borderRadius: 20, padding: '40px 36px', width: 340, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#e8c87a,#9a6b1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem', fontWeight: 900, color: '#1a1105', fontFamily: 'serif' }}>H</div>
        <h1 style={{ color: '#e8c87a', fontSize: '1.1rem', letterSpacing: '0.15em', fontFamily: 'serif', marginBottom: 4 }}>ADMIN PANEL</h1>
        <p style={{ color: 'rgba(182,165,135,0.5)', fontSize: '0.75rem', marginBottom: 28 }}>Hassan Barber — Verona</p>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => { setPw(e.target.value); setPwErr(false) }}
          onKeyDown={e => e.key === 'Enter' && (pw === ADMIN_PASSWORD ? setAuth(true) : setPwErr(true))}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${pwErr ? '#f87171' : 'rgba(199,154,69,0.25)'}`, background: 'rgba(10,8,4,0.8)', color: '#f0e6d0', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: 12, outline: 'none' }}
        />
        {pwErr && <p style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: 8 }}>Password errata</p>}
        <button
          onClick={() => pw === ADMIN_PASSWORD ? setAuth(true) : setPwErr(true)}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#e8c87a,#c79a45)', color: '#1a1105', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
          Accedi
        </button>
      </div>
    </div>
  )

  const today = fmt(new Date())
  const totalToday = appointments.length
  const byStatus = { confirmed: 0, done: 0, cancelled: 0, no_show: 0 }
  appointments.forEach(a => { if (byStatus[a.status] !== undefined) byStatus[a.status]++ })

  return (
    <div style={{ minHeight: '100svh', background: '#0d0804', fontFamily: "'Work Sans', sans-serif", color: '#f0e6d0' }}>
      {/* Header */}
      <div style={{ background: 'rgba(10,8,4,0.95)', borderBottom: '1px solid rgba(199,154,69,0.15)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#e8c87a,#c79a45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#1a1105', fontFamily: 'serif', fontSize: '1rem' }}>H</div>
          <div>
            <p style={{ fontFamily: 'serif', fontSize: '0.85rem', color: '#e8c87a', letterSpacing: '0.1em' }}>HASSAN BARBER</p>
            <p style={{ fontSize: '0.65rem', color: 'rgba(182,165,135,0.5)', letterSpacing: '0.08em' }}>PANNELLO ADMIN</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.75rem', color: 'rgba(182,165,135,0.5)', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(199,154,69,0.15)', borderRadius: 8 }}>&#8592; Sito</a>
          <button onClick={() => setAuth(false)} style={{ fontSize: '0.75rem', color: 'rgba(182,165,135,0.5)', background: 'none', border: '1px solid rgba(199,154,69,0.15)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>Esci</button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Totale oggi', value: totalToday, color: '#e8c87a' },
            { label: 'Confermati', value: byStatus.confirmed, color: '#C79A45' },
            { label: 'Completati', value: byStatus.done, color: '#4ade80' },
            { label: 'Annullati', value: byStatus.cancelled + byStatus.no_show, color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(20,15,8,0.8)', border: '1px solid rgba(199,154,69,0.12)', borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(182,165,135,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1, fontFamily: 'serif' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Date nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setDate(addDays(date, -1))} style={{ padding: '8px 16px', background: 'rgba(20,15,8,0.8)', border: '1px solid rgba(199,154,69,0.2)', borderRadius: 10, color: '#e8c87a', cursor: 'pointer', fontSize: '0.85rem' }}>&#8249; Prec</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: 'serif', fontSize: '1.1rem', color: '#e8c87a', textTransform: 'capitalize' }}>{dayLabel(date)}</p>
            {date === today && <span style={{ fontSize: '0.65rem', background: 'rgba(199,154,69,0.15)', color: '#c79a45', padding: '2px 8px', borderRadius: 100, letterSpacing: '0.1em' }}>OGGI</span>}
          </div>
          <button onClick={() => setDate(addDays(date, 1))} style={{ padding: '8px 16px', background: 'rgba(20,15,8,0.8)', border: '1px solid rgba(199,154,69,0.2)', borderRadius: 10, color: '#e8c87a', cursor: 'pointer', fontSize: '0.85rem' }}>Succ &#8250;</button>
          <button onClick={() => setDate(today)} style={{ padding: '8px 14px', background: 'linear-gradient(135deg,#e8c87a,#c79a45)', border: 'none', borderRadius: 10, color: '#1a1105', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>Oggi</button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(20,15,8,0.8)', border: '1px solid rgba(199,154,69,0.2)', borderRadius: 10, color: '#e8c87a', fontSize: '0.82rem', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Barber columns */}
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'rgba(182,165,135,0.4)', padding: 40 }}>Caricamento...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(barbers.length, 3)}, 1fr)`, gap: 14 }}>
                {barbers.map(barber => {
                  const appts = appointments.filter(a => a.barber_id === barber.id)
                  const blks = blocked.filter(b => b.barber_id === barber.id)
                  const color = barber.color || '#C79A45'
                  return (
                    <div key={barber.id} style={{ background: 'rgba(16,12,6,0.9)', border: `1px solid ${color}30`, borderRadius: 16, overflow: 'hidden' }}>
                      {/* Barber header */}
                      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${color}25`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'serif', fontSize: '0.9rem', color: '#f0e6d0', letterSpacing: '0.08em' }}>{barber.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'rgba(182,165,135,0.4)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 100 }}>{appts.length} appunt.</span>
                      </div>
                      {/* Blocked slots */}
                      {blks.map(b => (
                        <div key={b.id} style={{ margin: '8px 10px 0', padding: '8px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: '#f87171' }}>🚫 {b.time || 'Tutto il giorno'} — {b.reason}</span>
                          <button onClick={() => deleteBlock(b.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}>&#x2715;</button>
                        </div>
                      ))}
                      {/* Appointments */}
                      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {appts.length === 0 && blks.length === 0 && (
                          <p style={{ textAlign: 'center', color: 'rgba(182,165,135,0.25)', fontSize: '0.75rem', padding: '20px 0' }}>Nessun appuntamento</p>
                        )}
                        {appts.map(a => (
                          <div key={a.id} style={{ background: 'rgba(20,15,8,0.8)', border: `1px solid ${STATUS_COLORS[a.status] || color}30`, borderRadius: 12, padding: '12px', opacity: a.status === 'cancelled' || a.status === 'no_show' ? 0.55 : 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <span style={{ fontFamily: 'serif', fontSize: '1.05rem', color: color }}>{a.time}</span>
                              <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 100, background: `${STATUS_COLORS[a.status]}18`, color: STATUS_COLORS[a.status], border: `1px solid ${STATUS_COLORS[a.status]}40`, letterSpacing: '0.06em' }}>{STATUS_LABELS[a.status] || a.status}</span>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#f0e6d0', fontWeight: 600, marginBottom: 2 }}>{a.customer_name}</p>
                            <p style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.6)', marginBottom: 4 }}>{a.service_name} · €{a.service_price}</p>
                            <a href={`tel:${a.customer_phone}`} style={{ fontSize: '0.7rem', color: 'rgba(182,165,135,0.5)', textDecoration: 'none', display: 'block', marginBottom: 8 }}>📞 {a.customer_phone}</a>
                            {a.notes && <p style={{ fontSize: '0.68rem', color: 'rgba(182,165,135,0.45)', fontStyle: 'italic', marginBottom: 8, borderTop: '1px solid rgba(199,154,69,0.08)', paddingTop: 6 }}>{a.notes}</p>}
                            {a.status === 'confirmed' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => updateStatus(a.id, 'done')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600 }}>&#x2713; Fatto</button>
                                <button onClick={() => updateStatus(a.id, 'no_show')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c', fontSize: '0.68rem', cursor: 'pointer' }}>Ghost</button>
                                <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: '0.68rem', cursor: 'pointer' }}>&#x2715; Ann.</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Side panel - Block slots */}
          <div style={{ background: 'rgba(16,12,6,0.9)', border: '1px solid rgba(199,154,69,0.15)', borderRadius: 16, padding: 20, position: 'sticky', top: 80 }}>
            <p style={{ fontFamily: 'serif', fontSize: '0.85rem', color: '#e8c87a', letterSpacing: '0.12em', marginBottom: 16 }}>BLOCCA ORARIO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select
                value={blockBarber}
                onChange={e => setBlockBarber(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.82rem' }}>
                <option value="">Seleziona barbiere</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input
                type="date"
                value={blockDate}
                onChange={e => setBlockDate(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.82rem' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'rgba(182,165,135,0.6)', cursor: 'pointer' }}>
                <input type="checkbox" checked={blockFullDay} onChange={e => setBlockFullDay(e.target.checked)} />
                Tutto il giorno
              </label>
              {!blockFullDay && (
                <input
                  type="time"
                  value={blockTime}
                  onChange={e => setBlockTime(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.82rem' }}
                />
              )}
              <input
                type="text"
                placeholder="Motivo (es. Ferie)"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(10,8,4,0.8)', border: '1px solid rgba(199,154,69,0.2)', color: '#f0e6d0', fontSize: '0.82rem' }}
              />
              <button
                onClick={addBlock}
                style={{ padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#e8c87a,#c79a45)', color: '#1a1105', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
                + Blocca
              </button>
            </div>

            {/* Today's blocked slots */}
            {blocked.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(199,154,69,0.1)' }}>
                <p style={{ fontSize: '0.65rem', color: 'rgba(182,165,135,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>BLOCCATI OGGI</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {blocked.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(182,165,135,0.6)' }}>{barbers.find(x => x.id === b.barber_id)?.name} · {b.time || 'Tutto giorno'}</span>
                      <button onClick={() => deleteBlock(b.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem' }}>&#x2715;</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
