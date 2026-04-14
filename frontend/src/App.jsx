import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import InvoiceModal from './components/InvoiceModal';
import LoginPage from './pages/LoginPage';
import BillingPage from './pages/BillingPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import SalesPage from './pages/SalesPage';
import WorkersPage from './pages/WorkersPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import { Menu } from 'lucide-react';
import './index.css';

function Shell() {
  const { currentUser, activeSection, settings, loading, error, loadData, sidebarOpen, setSidebarOpen, invoiceOrder } = useApp();

  useEffect(() => {
    document.body.className = settings.darkMode ? '' : 'lm';
  }, [settings.darkMode]);

  useEffect(() => { if (currentUser) loadData(); }, [currentUser, loadData]);

  if (!currentUser) return <LoginPage />;

  const pages = { billing:<BillingPage/>, menu:<MenuPage/>, orders:<OrdersPage/>, sales:<SalesPage/>, workers:<WorkersPage/>, inventory:<InventoryPage/>, settings:<SettingsPage/> };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:14, background:'var(--bg)' }}>
      <div style={{ width:46,height:46,borderRadius:12,background:'linear-gradient(135deg,#F59E0B,#FCD34D)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Pacifico,cursive',fontWeight:900,fontSize:18,color:'#000' }}>HT</div>
      <div style={{ fontSize:13, color:'var(--t1)' }}>Loading…</div>
      <div style={{ width:90,height:2,background:'var(--s3)',borderRadius:2,overflow:'hidden' }}>
        <div style={{ height:'100%',background:'var(--a)',borderRadius:2,animation:'lb 1.1s ease-in-out infinite' }}/>
      </div>
      <style>{`@keyframes lb{0%{width:0%;margin-left:0}50%{width:80%}100%{width:0%;margin-left:100%}}`}</style>
    </div>
  );

  return (
    <div className="shell">
      <Sidebar/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Mobile bar */}
        <div id="mbar" style={{ display:'none', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--s1)', borderBottom:'1px solid var(--b1)', flexShrink:0 }}>
          <button className="iBtn" onClick={()=>setSidebarOpen(o=>!o)}><Menu size={16}/></button>
          <span style={{ fontFamily:'Pacifico,cursive', color:'var(--a)', fontSize:14 }}>HumTum</span>
        </div>
        {error && (
          <div style={{ background:'rgba(239,68,68,0.07)', borderBottom:'1px solid rgba(239,68,68,0.18)', padding:'6px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:'var(--red)', flexShrink:0 }}>
            <span>⚠️ {error}</span>
            <button className="btn btn-danger btn-sm" onClick={loadData}>Retry</button>
          </div>
        )}
        <main className="main">{pages[activeSection]||<BillingPage/>}</main>
      </div>
      {invoiceOrder && <InvoiceModal/>}
      <style>{`@media(max-width:900px){#mbar{display:flex!important}}`}</style>
    </div>
  );
}

export default function App() { return <AppProvider><Shell/></AppProvider>; }
