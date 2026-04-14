import React, { useState } from 'react';
import { useApp, ROLE_HIERARCHY, USERS } from '../context/AppContext';
import { Lock, User, ShieldCheck } from 'lucide-react';

const RC = { admin:'#F59E0B', manager:'#3B82F6', staff:'#10B981' };

export default function LoginPage() {
  const { login, settings } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [busy,  setBusy]        = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(''); setBusy(true);
    await new Promise(r => setTimeout(r, 350));
    const r = login(username.trim(), password);
    setBusy(false);
    if (r.error) setError(r.error);
  };

  const quick = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <div className="lpage">
      <div className="lcard fi">

        {/* Brand */}
        <div className="llogo">
          
          <div className="ltitle">{settings.restaurantName?.split(' ').slice(0,2).join(' ') || 'HumTum'}</div>
          <div className="lsub">Login</div>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div className="fgroup">
            <label className="lbl">Username</label>
            <div style={{ position:'relative' }}>
              <User size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--t2)' }}/>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" required style={{ paddingLeft:30 }}/>
            </div>
          </div>

          <div className="fgroup">
            <label className="lbl">Password</label>
            <div style={{ position:'relative' }}>
              <Lock size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--t2)' }}/>
              <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required style={{ paddingLeft:30, paddingRight:34 }}/>
            </div>
          </div>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:7, padding:'7px 11px', fontSize:12, color:'var(--red)', marginBottom:11 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', marginTop:2 }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {/* Quick login */}
        <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--b0)' }}>
          <div style={{ fontSize:10, color:'var(--t2)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginBottom:8 }}>Quick Access</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {USERS.map(u => (
              <button key={u.id} onClick={()=>quick(u.username,u.password)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--s2)', border:'1px solid var(--b1)', borderRadius:7, padding:'7px 11px', cursor:'pointer', transition:'border-color 0.15s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor=RC[u.role]}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--b1)'}
              >
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:20, height:20, borderRadius:5, background:RC[u.role]+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:RC[u.role] }}>{u.name[0]}</div>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--t0)' }}>{u.name}</span>
                </div>
                <span style={{ fontSize:10, color:'var(--t1)', background:`${RC[u.role]}18`, padding:'1px 7px', borderRadius:20, fontWeight:700 }}>
                  {ROLE_HIERARCHY[u.role]?.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Access info */}
        <div style={{ marginTop:14, background:'var(--s2)', borderRadius:8, padding:'10px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7 }}>
            <ShieldCheck size={11} style={{ color:'var(--t2)' }}/>
            <span style={{ fontSize:10, color:'var(--t2)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Role Hierarchy</span>
          </div>
          {[['admin','Full access — all sections & reports'],['manager','Menu · Sales · Inventory · Staff'],['staff','Billing & Order History only']].map(([r,d])=>(
            <div key={r} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:RC[r], flexShrink:0, display:'inline-block' }}/>
              <span style={{ fontSize:11, color:'var(--t1)' }}><b style={{ color:RC[r] }}>{ROLE_HIERARCHY[r]?.label}</b> — {d}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign:'center', fontSize:10, color:'var(--t2)', marginTop:14 }}>
          © {new Date().getFullYear()} {settings.restaurantName}
        </p>
      </div>
    <style>{`
/* PAGE WRAPPER */
.lpage{
  min-height:100dvh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
}

/* CARD */
.lcard{
  width:100%;
  max-width:420px;
  padding:22px;
  border-radius:14px;
}

/* MOBILE FIX */
@media (max-width: 480px){

  .lpage{
    padding:8px;
    align-items:flex-start;
    margin-top:10px;
  }


  .ltitle{
    font-size:18px;
  }

  .lsub{
    font-size:11px;
  }

  .fgroup input{
    font-size:13px;
    padding:8px 10px;
  }

  .lcard button{
    font-size:12px;
  }
}
  
`}</style>
    </div>

  );
}
