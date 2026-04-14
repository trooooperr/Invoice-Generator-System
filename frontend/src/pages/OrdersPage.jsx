import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, CalendarDays, X } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

function DateField({ value, onChange, inputRef, label }) {
  return (
    <div className="date-field">
      <span className="date-field-label">{label}</span>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="date-picker-clean unified-date-input"
        ref={inputRef}
      />
      <button
        type="button"
        className="calendar-trigger"
        aria-label={`Open ${label} date picker`}
        onClick={() => inputRef?.current?.showPicker && inputRef.current.showPicker()}
      >
        <CalendarDays size={15} />
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const { orderHistory, setInvoiceOrder, invoiceOrder, settings } = useApp();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const c = settings.currency;
  const startInputRef = React.useRef(null);
  const endInputRef = React.useRef(null);

  const filtered = useMemo(() => {
    return (Array.isArray(orderHistory) ? orderHistory : []).filter(o => {
      const d = new Date(o.date);
      const matchDate = (!startDate || d >= new Date(startDate)) && (!endDate || d <= new Date(endDate + 'T23:59:59'));
      const matchSearch = !search || o.billNo?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchSearch;
    });
  }, [orderHistory, search, startDate, endDate]);

  const totalDue = filtered.reduce((s, o) => s + (o.dueAmount || 0), 0);

  const payBadge = (mode) => {
    const cls = { cash: 'badge-cash', card: 'badge-card', upi: 'badge-upi' };
    return <span className={`badge ${cls[mode] || 'badge-cash'}`}>{mode?.toUpperCase()}</span>;
  };

  return (
    <div className="fi fade-in orders-container">
      {/* HEADER SECTION */}
      <div className="orders-header">
        <div>
          <div className="ph-title">Order History</div>
        </div>
      </div>

      {/* FILTER BAR - FIXED ALIGNMENT */}
      <div className="orders-filters-row">
        <div className="search-wrapper-unified">
          <Search size={16} className="search-icon-inside" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bill no. or customer..."
            className="search-input-unified"
          />
        </div>

        <div className="date-group-unified">
          <DateField label="From" value={startDate} onChange={e => setStartDate(e.target.value)} inputRef={startInputRef} />
          <DateField label="To" value={endDate} onChange={e => setEndDate(e.target.value)} inputRef={endInputRef} />
          {(startDate || endDate || search) && (
            <button className="clear-filter-btn" onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="mobile-orders-list">
        {filtered.length === 0 ? <div className="empty-msg">No orders found</div> : 
          filtered.map(o => (
            <div key={o._id} className="order-mobile-card" onClick={() => setInvoiceOrder(o)}>
              <div className="order-card-row">
                <div>
                  <div className="bill-no-tag">HT-{o.billNo}</div>
                  <div className="card-meta">{new Date(o.date).toLocaleDateString()} · Table {o.tableNo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="card-total">{c}{o.grandTotal.toFixed(0)}</div>
                  {payBadge(o.paymentMode)}
                </div>
              </div>
              <div className="card-footer-info">
                <span className="cust-name-card">{o.customerName || 'Walk-in Customer'}</span>
                {o.dueAmount > 0 ? (
                  <span className="due-tag-card">Due: {c}{o.dueAmount.toFixed(0)}</span>
                ) : (
                  <span className="paid-tag-card">Paid</span>
                )}
              </div>
            </div>
          ))
        }
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="desktop-orders-table">
        <div className="card-table-wrapper">
          <table className="dtable">
            <thead>
              <tr>
                <th>Date</th><th>Bill No.</th><th style={{ textAlign: 'center' }}>Table</th>
                <th>Customer</th><th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Due</th><th style={{ textAlign: 'center' }}>Mode</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id}>
                  <td className="td-date">{new Date(o.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>HT-{o.billNo}</td>
                  <td style={{ textAlign: 'center' }}>T{o.tableNo}</td>
                  <td className="td-date">{o.customerName || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--amber)' }}>{c}{o.grandTotal.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: o.dueAmount > 0 ? 'var(--red)' : 'inherit', fontWeight: 700 }}>
                    {o.dueAmount > 0 ? `${c}${o.dueAmount.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>{payBadge(o.paymentMode)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setInvoiceOrder(o)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invoiceOrder && <InvoiceModal />}

      <style>{`
        .orders-container { padding-bottom: 20px; }
        .orders-title { fontSize: 22px; fontWeight: 800; color: var(--t0); }
        .orders-subtitle { fontSize: 12px; color: var(--t2); margin-top: 2px; }
        .due-text { color: var(--red); margin-left: 8px; font-weight: 600; }

        /* FILTER BAR CSS */
        .orders-filters-row { 
          display: flex; 
          gap: 12px; 
          margin: 18px 0; 
          align-items: center; 
          width: 100%;
        }

        .search-wrapper-unified {
          display: flex; 
          align-items: center; 
          background: var(--s2); 
          border: 1px solid var(--b1); 
          border-radius: 12px; 
          height: 44px; 
          padding: 0 14px; 
          flex: 1;
        }
        .search-icon-inside { color: var(--t3); margin-right: 10px; }
        .search-input-unified { background: none; border: none; outline: none; color: var(--t0); flex: 1; font-size: 14px; }

        .date-group-unified { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; width: min(100%, 430px); }
        .date-field {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          background: var(--s1);
          border: 1px solid var(--b1);
          border-radius: 12px;
          padding: 0 8px 0 10px;
          box-shadow: inset 0 1px 0 var(--b0);
        }
        .date-field-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--t2);
        }
        .date-picker-clean {
          background: none;
          border: none;
          color: var(--t0);
          outline: none;
          font-size: 12px;
          cursor: pointer;
          width: 100%;
          padding: 0;
          box-shadow: none;
        }
        .unified-date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
        }
        .unified-date-input {
          min-width: 0;
          color-scheme: light;
        }
        .lm .unified-date-input {
          color-scheme: light;
        }
        body:not(.lm) .unified-date-input {
          color-scheme: dark;
        }
        .calendar-trigger {
          width: 28px;
          height: 28px;
          border: 1px solid var(--b1);
          border-radius: 8px;
          background: var(--s2);
          color: var(--t1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .calendar-trigger:hover {
          background: var(--s3);
          color: var(--t0);
          border-color: var(--b2);
        }
        .clear-filter-btn { background: var(--s3); border: 1px solid var(--b2); border-radius: 10px; width: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--t1); }

        /* MOBILE LIST CSS */
        .mobile-orders-list { display: block; }
        .order-mobile-card { 
          background: var(--s1); 
          border: 1px solid var(--b1); 
          border-radius: 16px; 
          padding: 15px; 
          margin-bottom: 12px; 
          cursor: pointer;
        }
        .order-card-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .bill-no-tag { font-weight: 800; font-size: 14px; color: var(--t0); }
        .card-meta { font-size: 11px; color: var(--t2); }
        .card-total { font-weight: 800; color: var(--amber); font-size: 17px; }
        .card-footer-info { display: flex; justify-content: space-between; border-top: 1px dashed var(--b1); padding-top: 10px; align-items: center; }
        .cust-name-card { font-size: 12px; color: var(--t1); font-weight: 500; }
        .due-tag-card { color: var(--red); font-size: 12px; font-weight: 700; }
        .paid-tag-card { color: var(--green); font-size: 11px; font-weight: 800; text-transform: uppercase; }

        /* WHATSAPP DARK MODE FIX */
        .method-text-fix { color: var(--t0) !important; font-weight: 600; font-size: 12px; }

        .desktop-orders-table { display: none; }
        .card-table-wrapper { background: var(--s1); border: 1px solid var(--b1); border-radius: var(--rl); overflow: hidden; }

        @media (min-width: 768px) {
          .mobile-orders-list { display: none; }
          .desktop-orders-table { display: block; }
          .orders-filters-row { flex-direction: row; }
        }

        @media (max-width: 750px) {
          .orders-filters-row { flex-direction: column; align-items: stretch; }
          .date-group-unified { width: 100%; }
        }

/* 2. Update the Date Group for Mobile */
@media (max-width: 750px) {
  .orders-filters-row { 
    flex-direction: column; 
    align-items: stretch; 
  }

  .date-group-unified { 
    width: 100%; 
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px; 
    height: auto;
  }

  .date-field { 
    width: 100%;
    overflow: hidden;
  }

  .clear-filter-btn {
    height: 44px;
    width: 100%;
  }
}
      `}</style>
    </div>
  );
}
