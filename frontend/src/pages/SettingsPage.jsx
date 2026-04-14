import React, { useState, useEffect } from 'react';
import { useApp, USERS } from '../context/AppContext';
import { Save, Check, Send } from 'lucide-react';
import { apiUrl } from '../lib/api';

const RC = { admin:'#F59E0B', manager:'#3B82F6', staff:'#10B981' };

export default function SettingsPage() {
  const { settings, saveSettings } = useApp();
  const [form,  setForm]  = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Inventory category state
  const [invCategories, setInvCategories] = useState([]);
  const [invCatInput, setInvCatInput] = useState('');
  const [invCatEdit, setInvCatEdit] = useState(null); // {old, new}
  const [invCatError, setInvCatError] = useState('');
  // Menu category state
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuCatInput, setMenuCatInput] = useState('');
  const [menuCatEdit, setMenuCatEdit] = useState(null); // {old, new}
  const [menuCatError, setMenuCatError] = useState('');

  // Load categories from backend
  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  useEffect(() => {
    fetch(apiUrl('/api/settings')).then(r=>r.json()).then(data => {
      setInvCategories(Array.isArray(data.inventoryCategories) ? data.inventoryCategories : []);
      setMenuCategories(Array.isArray(data.menuCategories) ? data.menuCategories : []);
    });
  }, []);


  // Inventory category handlers (with context sync)
  const handleAddInvCategory = async () => {
    if (!invCatInput.trim()) return setInvCatError('Category required');
    setInvCatError('');
    try {
      const res = await fetch(apiUrl('/api/settings/inventory-category'), {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ category: invCatInput.trim() })
      });
      if (!res.ok) throw new Error('Failed to add');
      const cats = await res.json();
      setInvCategories(cats);
      setInvCatInput('');
      await saveSettings({ ...settings, inventoryCategories: cats });
    } catch (e) {
      setInvCatError(e.message || 'Failed to add');
    }
  };
  const handleRemoveInvCategory = async (cat) => {
    try {
      const res = await fetch(apiUrl('/api/settings/inventory-category'), {
        method: 'DELETE', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ category: cat })
      });
      if (!res.ok) throw new Error('Failed to remove');
      const cats = await res.json();
      setInvCategories(cats);
      await saveSettings({ ...settings, inventoryCategories: cats });
    } catch (e) {
      setInvCatError(e.message || 'Failed to remove');
    }
  };

  // Menu category handlers (with context sync)
  const handleAddMenuCategory = async () => {
    if (!menuCatInput.trim()) return setMenuCatError('Category required');
    setMenuCatError('');
    try {
      const res = await fetch(apiUrl('/api/settings/menu-category'), {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ category: menuCatInput.trim() })
      });
      if (!res.ok) throw new Error('Failed to add');
      const cats = await res.json();
      setMenuCategories(cats);
      setMenuCatInput('');
      await saveSettings({ ...settings, menuCategories: cats });
    } catch (e) {
      setMenuCatError(e.message || 'Failed to add');
    }
  };
  const handleRemoveMenuCategory = async (cat) => {
    try {
      const res = await fetch(apiUrl('/api/settings/menu-category'), {
        method: 'DELETE', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ category: cat })
      });
      if (!res.ok) throw new Error('Failed to remove');
      const cats = await res.json();
      setMenuCategories(cats);
      await saveSettings({ ...settings, menuCategories: cats });
    } catch (e) {
      setMenuCatError(e.message || 'Failed to remove');
    }
  };

  const [email, setEmail]  = useState({
    senderEmail: '2k23.cs2312451@gmail.com',
    adminEmail: settings.adminEmail || '',
  });
  const setE = (k,v) => setEmail(f=>({...f,[k]:v}));

  useEffect(() => {
    setEmail({
      senderEmail: '2k23.cs2312451@gmail.com',
      adminEmail: settings.adminEmail || '',
    });
  }, [settings.senderEmail, settings.adminEmail]);

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [summary,  setSummary]  = useState(null);
  const [loadingSum, setLoadingSum] = useState(false);

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    setLoadingSum(true);
    try {
      const r = await fetch(apiUrl('/api/reports/daily-summary'));
      if (r.ok) setSummary(await r.json());
    } catch {}
    setLoadingSum(false);
  };

  const handleSaveSettings = async () => {
    await saveSettings(form);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const handleSaveEmail = async () => {
    const savedSettings = await saveSettings({
      ...settings,
      adminEmail: email.adminEmail.trim(),
    });
    if (savedSettings) {
      setEmail({
        senderEmail: '2k23.cs2312451@gmail.com',
        adminEmail: savedSettings.adminEmail || '',
      });
      setSaved(true);
      setTimeout(()=>setSaved(false), 2000);
    }
  };

  const handleSendReport = async () => {
    if (!email.adminEmail) {
      setSendResult({ ok:false, msg:'Fill admin email first. Sender email is fixed.' });
      return;
    }
    setSending(true); setSendResult(null);
    try {
      const r = await fetch(apiUrl('/api/reports/send-daily'), {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          emailConfig: {
            senderEmail: '2k23.cs2312451@gmail.com',
            adminEmail: email.adminEmail.trim(),
          },
          settings: form,
          inventory: [],
        })
      });
      const d = await r.json();
      setSendResult(d.success
        ? { ok:true,  msg:`✅ Report sent to ${email.adminEmail} (${d.ordersCount} orders)` }
        : { ok:false, msg:`❌ ${d.error}` }
      );
    } catch(e) {
      setSendResult({ ok:false, msg:`❌ ${e.message}` });
    }
    setSending(false);
  };

  const c = form.currency;

  return (
    <div className="fi" style={{ padding: '10px'  }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div className="ph">
          <div className="ph-title">Settings</div>
          <div className="ph-sub">Business configuration & email reports</div>
        </div>
        <button className="btn btn-primary" onClick={handleSaveSettings} style={{ minWidth:120 }}>
          {saved ? <><Check size={12}/>Saved</> : <><Save size={12}/>Save</>}
        </button>
      </div>



      <div className="settings-grid">

        {/* INVENTORY CATEGORY MANAGEMENT */}
        <div className="card card-p settings-full category-card">
          <div className="sdiv">🗂️ Inventory Categories</div>
          <div className="cat-input-row">
            <input className="cat-input" value={invCatInput} onChange={e=>setInvCatInput(e.target.value)} placeholder="Add inventory category" />
            <button className="btn btn-primary" onClick={handleAddInvCategory}>Add</button>
          </div>
          {invCatError && <div className="cat-error">{invCatError}</div>}
          <div className="cat-list">
            {invCategories.map(cat => (
              <div key={cat} className="cat-chip">
                {invCatEdit && invCatEdit.old === cat ? (
                  <>


                  </>
                ) : (
                  <>
                    <span>{cat}</span>
                    <button className="btn btn-xs btn-danger" onClick={()=>handleRemoveInvCategory(cat)}>Remove</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MENU CATEGORY MANAGEMENT */}
        <div className="card card-p settings-full category-card">
          <div className="sdiv">🍽️ Menu Categories</div>
          <div className="cat-input-row">
            <input className="cat-input" value={menuCatInput} onChange={e=>setMenuCatInput(e.target.value)} placeholder="Add menu category" />
            <button className="btn btn-primary" onClick={handleAddMenuCategory}>Add</button>
          </div>
          {menuCatError && <div className="cat-error">{menuCatError}</div>}
          <div className="cat-list">
            {menuCategories.map(cat => (
              <div key={cat} className="cat-chip">
                {menuCatEdit && menuCatEdit.old === cat ? (
                  <>
                  </>
                ) : (
                  <>
                    <span>{cat}</span>
                    <button className="btn btn-xs btn-danger" onClick={()=>handleRemoveMenuCategory(cat)}>Remove</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-p">
          <div className="sdiv">🏪 Business Info</div>
          <div className="fgroup"><label className="lbl">Restaurant Name</label><input value={form.restaurantName} onChange={e=>set('restaurantName',e.target.value)}/></div>
          <div className="fgroup"><label className="lbl">Address</label><input value={form.address} onChange={e=>set('address',e.target.value)}/></div>
          <div className="frow2" style={{ flexWrap:'wrap', gap:10 }}>
            <div className="fgroup" style={{ flex:1 }}><label className="lbl">GSTIN</label><input value={form.gstin} onChange={e=>set('gstin',e.target.value)}/></div>
            <div className="fgroup" style={{ flex:1 }}><label className="lbl">Phone</label><input value={form.phone||''} onChange={e=>set('phone',e.target.value)}/></div>
          </div>
        </div>

        <div className="card card-p">
          <div className="sdiv">💰 Tax & Billing</div>
          <div className="frow2" style={{ flexWrap:'wrap', gap:10 }}>
            <div className="fgroup" style={{ flex:1 }}><label className="lbl">SGST Rate %</label><input type="number" value={form.sgstRate} onChange={e=>set('sgstRate',parseFloat(e.target.value)||0)}/></div>
            <div className="fgroup" style={{ flex:1 }}><label className="lbl">CGST Rate %</label><input type="number" value={form.cgstRate} onChange={e=>set('cgstRate',parseFloat(e.target.value)||0)}/></div>
          </div>
        </div>

        <div className="card card-p settings-full">
          <div className="sdiv">📧 Gmail Daily Report</div>

          {summary && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10, marginBottom:16 }}>
              {[
                { label:"Revenue", value:`${c}${summary.revenue?.toFixed(0)||0}` },
                { label:"Orders", value:summary.ordersCount||0 },
                { label:"Dues", value:`${c}${summary.due?.toFixed(0)||0}` },
              ].map(k=>(
                <div key={k.label} className="kpi" style={{ padding:'10px', background:'var(--s1)', color:'var(--t0)',  border: '1px solid var(--b1)',borderRadius:10 }}>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value" style={{ fontSize:16 }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="email-grid">
            <div className="fgroup">
              <label className="lbl">Sender Email</label>
              <input value="2k23.cs2312451@gmail.com" readOnly style={{ background: 'var(--s2)', color: 'var(--t1)', cursor: 'not-allowed' }} />
            </div>
            <div className="fgroup">
              <label className="lbl">Admin Email</label>
              <input value={email.adminEmail || ''} onChange={e => setE('adminEmail', e.target.value)} placeholder="owner@company.com" />
            </div>
          </div>

          <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:10 }}>
            <button className="btn btn-ghost" onClick={handleSaveEmail}>
              Save Email Settings
            </button>
            <button className="btn btn-primary" onClick={handleSendReport} disabled={sending}>
              {sending ? 'Sending…' : 'Send Report'}
            </button>
          </div>

          {sendResult && (
            <div style={{ marginTop:10, padding:10, borderRadius:8, fontSize:12 }}>
              {sendResult.msg}
            </div>
          )}
        </div>

        <div className="card card-p settings-full">
          <div className="sdiv">👥 Staff Accounts</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
            {USERS.map(u=>(
              <div key={u.id} style={{ background:'var(--s1)', borderRadius:10, padding:10, display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:28, height:28, borderRadius:6, background:RC[u.role]+'20', display:'flex', alignItems:'center', justifyContent:'center' }}>{u.name[0]}</div>
                <div style={{ fontSize:12 }}>{u.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
/* CATEGORY MANAGEMENT MODERN STYLES */
.category-card {
  background: var(--s1);
  border-radius: 18px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding-bottom: 18px;
}
.cat-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}
.cat-input {
  flex: 1;
  border-radius: 8px;
  border: 1px solid var(--b1);
  padding: 8px 12px;
  background: var(--s2);
  color: var(--t0);
  font-size: 15px;
  transition: border 0.2s;
}
.cat-input:focus {
  outline: none;
  border-color: var(--amber);
  background: var(--s2);
}
.cat-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
}
.cat-chip {
  background: var(--s2);
  color: var(--t1);
  border-radius: 16px;
  padding: 5px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
  font-size: 14px;
  min-height: 32px;
}
.cat-edit-input {
  border-radius: 8px;
  border: 1px solid var(--b1);
  padding: 4px 8px;
  font-size: 14px;
  background: var(--s1);
  color: var(--t0);
}
.cat-error {
  color: var(--red);
  margin-bottom: 8px;
  font-size: 13px;
}

/* MAIN GRID */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* FORCE FULL WIDTH CARDS */
.settings-full {
  grid-column: 1 / -1;
}

/* LAPTOP (your issue area) */
@media (max-width: 1200px) {
  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* TABLET */
@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

/* MOBILE */
@media (max-width: 600px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* IMPROVE CARD HEIGHT CONSISTENCY */
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* INPUT GRID INSIDE EMAIL SECTION */
.email-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 768px) {
  .email-grid {
    grid-template-columns: 1fr;
  }

  .cat-input-row {
    flex-direction: column;
    align-items: stretch;
  }
}

`}</style>
    </div>
  );
}
