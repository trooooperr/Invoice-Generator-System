import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { apiUrl } from '../lib/api';

const AppContext = createContext(null);
const TABLES_KEY = 'humtum_table_bills';
const AUTH_KEY   = 'humtum_auth';

// ── Role hierarchy ──────────────────────────────────────────────
// admin > manager > staff  (admin can access all lower role views)
export const ROLE_HIERARCHY = {
  admin: {
    label: 'Admin',
    level: 3,
    color: '#FF8C00',
    permissions: ['billing','menu','orders','sales','workers','inventory','settings']
  },
  manager: {
    label: 'Manager',
    level: 2,
    color: '#3B82F6',
    permissions: ['billing','menu','orders','sales','inventory','settings']
  },
  staff: {
    label: 'Staff',
    level: 1,
    color: '#22C55E',
    permissions: ['billing','orders']
  },
};

// Hard-coded credentials (in production replace with DB-backed auth)
export const USERS = [
  { id:1, name:'Owner',    username:'admin',   password:'admin123',   role:'admin'   },
  { id:2, name:'Manager', username:'manager', password:'manager123', role:'manager' },
  { id:3, name:'Staff',   username:'staff',   password:'staff123',   role:'staff'   },
];

const NUM_TABLES = 12;

const DEFAULT_SETTINGS = {
  restaurantName:  'HumTum Bar & Restaurant',
  address:         'Rajendra Nagar, Gorakhpur',
  gstin:           '09AXFPG9491D1Z8',
  phone:           '',
  sgstRate:        2.5,
  cgstRate:        2.5,
  currency:        '₹',
  thankYouMsg:     'Thank you for visiting!',
  darkMode:        true,
  adminEmail:      '',
  senderEmail:     '',
};

function initTables() {
  const t = {};
  for (let i = 1; i <= NUM_TABLES; i++) {
    t[`T${i}`] = { items:[], discount:'', customerPhone:'', customerName:'', startTime:null, dueAmount:0 };
  }
  return t;
}

function loadTableBills() {
  try {
    const raw = localStorage.getItem(TABLES_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const base = initTables();
      return { ...base, ...saved };
    }
  } catch {}
  return initTables();
}

function saveTableBills(bills) {
  try { localStorage.setItem(TABLES_KEY, JSON.stringify(bills)); } catch {}
}

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.error(`API ${res.status}: ${url}`); return []; }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Fetch failed: ${url}`, err.message);
    return [];
  }
}

export function AppProvider({ children }) {
  // ── Auth ────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
  });

  // ── Settings ────────────────────────────────────────────────────
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const saveSettings = useCallback(async (updates) => {
    try {
      const res = await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to save settings');
        const saved = await res.json();
        setSettings({ ...DEFAULT_SETTINGS, ...saved });
      return saved;
    } catch (err) {
      console.error('Save settings error', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/settings'));
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch {}
    })();
    // Expose menu context update for InventoryPage
    window.updateMenuContext = (menuData) => {
      if (menuData) setMenuItems(menuData);
      else fetch(apiUrl('/api/menu')).then(r=>r.json()).then(setMenuItems);
    };
    return () => { delete window.updateMenuContext; };
  }, []);

  // ── UI ──────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('billing');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  // ── Data ────────────────────────────────────────────────────────
  const [menuItems,    setMenuItems]    = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [workers,      setWorkers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Tables — persist to localStorage ────────────────────────────
  const [tableBills, _setTableBills] = useState(loadTableBills);
  const setTableBills = useCallback((updater) => {
    _setTableBills(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveTableBills(next);
      return next;
    });
  }, []);

  const [activeTableId,   setActiveTableId]   = useState('T1');
  const [categoryFilter,  setCategoryFilter]  = useState('All');
  const [menuSearch,      setMenuSearch]      = useState('');
  const [invoiceOrder,    setInvoiceOrder]    = useState(null);

  // ── Auth helpers ────────────────────────────────────────────────
  const login = useCallback((username, password) => {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) return { error: 'Invalid username or password' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  }, []);

  const role = currentUser?.role || 'staff';
  const can  = useCallback((action) => {
    return ROLE_HIERARCHY[role]?.permissions.includes(action) || false;
  }, [role]);

  // Admin can switch to any lower role view; manager can switch to staff
  const canAccessRole = useCallback((targetRole) => {
    const myLevel  = ROLE_HIERARCHY[role]?.level || 0;
    const tgtLevel = ROLE_HIERARCHY[targetRole]?.level || 0;
    return myLevel >= tgtLevel;
  }, [role]);

  // ── Data loading ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [menuData, ordersData, workersData] = await Promise.all([
      safeFetch(apiUrl('/api/menu')),
      safeFetch(apiUrl('/api/orders')),
      safeFetch(apiUrl('/api/workers')),
    ]);
    setMenuItems(menuData);
    setOrderHistory([...ordersData].sort((a,b) => new Date(b.date)-new Date(a.date)));
    setWorkers(workersData);
    setLoading(false);
  }, []);

  // ── Table helpers ────────────────────────────────────────────────
  const selectTable = useCallback((id) => setActiveTableId(id), []);

  const updateTableItem = useCallback(async (tableId, itemId, action, items) => {
    setTableBills(prev => {
      const table = { ...prev[tableId], items: [...prev[tableId].items] };
      const idx   = table.items.findIndex(i => i._id === itemId);
      const item  = (Array.isArray(items) ? items : []).find(i => i._id === itemId);
      if (action === 'increase') {
        if (idx >= 0) table.items[idx] = { ...table.items[idx], quantity: table.items[idx].quantity + 1 };
        else if (item) table.items.push({ ...item, quantity: 1 });
        if (!table.startTime) table.startTime = new Date().toISOString();
      } else if (action === 'decrease') {
        if (idx >= 0) {
          if (table.items[idx].quantity <= 1) table.items.splice(idx, 1);
          else table.items[idx] = { ...table.items[idx], quantity: table.items[idx].quantity - 1 };
        }
      } else if (action === 'remove') {
        if (idx >= 0) table.items.splice(idx, 1);
      }
      return { ...prev, [tableId]: table };
    });
  }, [setTableBills]);

  const clearTable = useCallback((tableId) => {
    setTableBills(prev => ({
      ...prev,
      [tableId]: { items:[], discount:'', customerPhone:'', customerName:'', startTime:null, dueAmount:0 }
    }));
  }, [setTableBills]);

  const setTableField = useCallback((tableId, field, val) => {
    setTableBills(prev => ({ ...prev, [tableId]: { ...prev[tableId], [field]: val } }));
  }, [setTableBills]);

  // ── Bill totals ──────────────────────────────────────────────────
  const billTotals = useMemo(() => {
    const table    = tableBills[activeTableId] || { items:[], discount:'' };
    const subtotal = table.items.reduce((s,i) => s + i.price * i.quantity, 0);
    const sgst     = subtotal * (settings.sgstRate / 100);
    const cgst     = subtotal * (settings.cgstRate / 100);
    const dv       = (table.discount || '').trim();
    const discountAmount = dv.endsWith('%')
      ? subtotal * (parseFloat(dv)/100) || 0
      : parseFloat(dv) || 0;
    const grandTotal = Math.max(0, subtotal + sgst + cgst - discountAmount);
    return { subtotal, sgst, cgst, discountAmount, grandTotal };
  }, [tableBills, activeTableId, settings]);

  // ── Filtered menu ────────────────────────────────────────────────
  const filteredMenu = useMemo(() => {
    if (!Array.isArray(menuItems)) return [];
    return menuItems.filter(item => {
      const mc = categoryFilter === 'All' || item.category === categoryFilter;
      const ms = item.name.toLowerCase().includes(menuSearch.toLowerCase());
      return mc && ms;
    });
  }, [menuItems, categoryFilter, menuSearch]);

  const categories = useMemo(() => {
    if (!Array.isArray(menuItems)) return ['All'];
    return ['All', ...new Set(menuItems.map(i => i.category))];
  }, [menuItems]);

  const getTableStatus = useCallback((tableId) => {
    const t = tableBills[tableId];
    if (!t || t.items.length === 0) return 'free';
    if (t.dueAmount > 0) return 'due';
    return 'occupied';
  }, [tableBills]);

  // ── Generate bill (clears table ONLY after successful save) ──────
  const generateBill = useCallback(async (paymentMode, paidAmount) => {
    const table = tableBills[activeTableId];
    if (!table || table.items.length === 0) return { error: 'No items in bill' };
    const today      = new Date().toISOString().slice(0,10);
    const todaysOrds = (Array.isArray(orderHistory)?orderHistory:[]).filter(o=>o.date?.startsWith(today));
    const billNo     = (todaysOrds.length + 1).toString().padStart(4,'0');
    const { subtotal, sgst, cgst, discountAmount, grandTotal } = billTotals;
    const paid = parseFloat(paidAmount) || grandTotal;
    const due  = Math.max(0, grandTotal - paid);
    const orderData = {
      billNo,
      tableNo: parseInt(activeTableId.substring(1)),
      items:   table.items.map(i => ({ name:i.name, quantity:i.quantity, price:i.price })),
      subtotal, sgst, cgst,
      discount:      discountAmount,
      grandTotal,
      paidAmount:    paid,
      dueAmount:     due,
      paymentMode,
      date:          new Date().toISOString(),
      customerPhone: table.customerPhone || '',
      customerName:  table.customerName  || '',
    };
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Failed to save order');
      const saved = await res.json();
      setOrderHistory(prev => [saved, ...(Array.isArray(prev)?prev:[])]);
      setInvoiceOrder(saved);
      // ← Table cleared ONLY here, after successful DB save
      if (due === 0) clearTable(activeTableId);
      else setTableField(activeTableId, 'dueAmount', due);
      return { success:true, order:saved };
    } catch (err) {
      return { error: err.message };
    }
  }, [tableBills, activeTableId, orderHistory, billTotals, clearTable, setTableField]);

  // ── Menu CRUD ────────────────────────────────────────────────────
  const saveMenuItem = useCallback(async (data, id) => {
    const method = id ? 'PUT' : 'POST';
    const url    = id ? apiUrl(`/api/menu/${id}`) : apiUrl('/api/menu');
    const res    = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to save menu item');
    const saved = await res.json();
    setMenuItems(prev => id ? prev.map(i=>i._id===id?saved:i) : [...prev, saved]);
    return saved;
  }, []);

  const deleteMenuItem = useCallback(async (id) => {
    const res = await fetch(apiUrl(`/api/menu/${id}`), { method:'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setMenuItems(prev => prev.filter(i=>i._id!==id));
  }, []);

  // ── Worker CRUD ──────────────────────────────────────────────────────
  const saveWorker = useCallback(async (data, id) => {
    const method = id ? 'PUT' : 'POST';
    const url    = id ? apiUrl(`/api/workers/${id}`) : apiUrl('/api/workers');
    const res    = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to save worker');
    const saved = await res.json();
    setWorkers(prev => id ? prev.map(w=>w._id===id?saved:w) : [...prev, saved]);
    return saved;
  }, []);

  const deleteWorker = useCallback(async (id) => {
    const res = await fetch(apiUrl(`/api/workers/${id}`), { method:'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setWorkers(prev => prev.filter(w=>w._id!==id));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      role, can, canAccessRole, ROLE_HIERARCHY,
      settings, saveSettings,
      activeSection, setActiveSection,
      sidebarOpen, setSidebarOpen,
      menuItems, orderHistory, workers,
      loading, error, loadData,
      tableBills, activeTableId, selectTable,
      updateTableItem, clearTable, setTableField,
      billTotals, filteredMenu, categories,
      categoryFilter, setCategoryFilter,
      menuSearch, setMenuSearch,
      getTableStatus, generateBill,
      invoiceOrder, setInvoiceOrder,
      saveMenuItem, deleteMenuItem,
      saveWorker, deleteWorker,
      NUM_TABLES,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
