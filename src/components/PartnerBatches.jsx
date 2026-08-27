import React, { useState } from 'react';
import {
  Building2, Package, Plus, Search, Calendar, Phone, MapPin, DollarSign,
  FileText, Send, Printer, Trash2, Edit3, CheckCircle2, AlertCircle, Clock, ChevronRight, X, User
} from 'lucide-react';
import LogoBanner from './LogoBanner';
import { TRANSLATIONS } from '../utils/i18n';
import {
  savePartnerGarage, deletePartnerGarage,
  savePartnerBatch, updatePartnerBatch, deletePartnerBatch
} from '../utils/storage';

export default function PartnerBatches({
  partnerGarages, setPartnerGarages,
  partnerBatches, setPartnerBatches,
  masterServices = {},
  currentLang = 'en'
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Active Tab: 'batches' | 'garages'
  const [subTab, setSubTab] = useState('batches');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Batch for Detail View
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // Modal States
  const [showAddGarageModal, setShowAddGarageModal] = useState(false);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Edit Mode Targets
  const [editingVehicle, setEditingVehicle] = useState(null); // null or vehicle object
  const [editingService, setEditingService] = useState(null); // null or { vehicleId, service }
  const [editingPayment, setEditingPayment] = useState(null); // null or payment object

  // Active Vehicle Selection for Service Logging
  const [targetVehicleId, setTargetVehicleId] = useState(null);

  // Active Receipt Modal State
  const [activeReceiptData, setActiveReceiptData] = useState(null);
  const [activeReceiptType, setActiveReceiptType] = useState(null); // 'batch' | 'vehicle' | 'payment'

  // Forms State
  const [newGarage, setNewGarage] = useState({ name: '', contactPerson: '', mobile: '', address: '', notes: '' });
  const [newBatch, setNewBatch] = useState({
    partnerGarageId: partnerGarages[0]?.id || '',
    dropOffDate: new Date().toISOString().split('T')[0],
    expectedPickupDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', vehicleName: '', notes: '' });
  const [newService, setNewService] = useState({
    serviceKey: 'wheelAlignment',
    customName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    rate: 350,
    notes: ''
  });
  const [newPayment, setNewPayment] = useState({
    stage: '🟢 Advance Payment (Before Service)',
    amount: '',
    paymentMethod: 'UPI / QR Code',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Calculate Financials for a Batch
  const calculateBatchFinancials = (batch) => {
    let totalBilled = 0;
    (batch.vehicles || []).forEach(v => {
      (v.services || []).forEach(s => {
        totalBilled += parseFloat(s.amount) || 0;
      });
    });

    let totalPaid = 0;
    (batch.payments || []).forEach(p => {
      totalPaid += parseFloat(p.amount) || 0;
    });

    const balanceDue = Math.max(0, totalBilled - totalPaid);

    let paymentStatus = 'Unpaid';
    if (totalPaid > 0 && balanceDue > 0) paymentStatus = 'Partially Paid';
    if (totalPaid > 0 && balanceDue === 0 && totalBilled > 0) paymentStatus = 'Fully Paid';

    return { totalBilled, totalPaid, balanceDue, paymentStatus };
  };

  // Garage CRUD
  const handleSaveGarage = (e) => {
    e.preventDefault();
    if (!newGarage.name || !newGarage.mobile) return;

    const garageObj = {
      id: `pg_${Date.now()}`,
      ...newGarage,
      createdAt: new Date().toISOString()
    };
    const updated = savePartnerGarage(garageObj);
    setPartnerGarages(updated);
    setNewGarage({ name: '', contactPerson: '', mobile: '', address: '', notes: '' });
    setShowAddGarageModal(false);
  };

  const handleDeleteGarage = (id, name) => {
    if (window.confirm(`Are you sure you want to delete partner garage "${name}"?`)) {
      const updated = deletePartnerGarage(id);
      setPartnerGarages(updated);
    }
  };

  // Batch CRUD
  const handleCreateBatch = (e) => {
    e.preventDefault();
    const garage = partnerGarages.find(g => g.id === newBatch.partnerGarageId) || partnerGarages[0];
    if (!garage) {
      alert('Please add a partner garage first!');
      return;
    }

    const batchObj = {
      id: `SGB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      partnerGarageId: garage.id,
      partnerGarageName: garage.name,
      partnerContact: garage.contactPerson,
      partnerMobile: garage.mobile,
      dropOffDate: newBatch.dropOffDate,
      expectedPickupDate: newBatch.expectedPickupDate,
      status: 'Active',
      notes: newBatch.notes,
      vehicles: [],
      payments: [],
      createdAt: new Date().toISOString()
    };

    const updated = savePartnerBatch(batchObj);
    setPartnerBatches(updated);
    setShowNewBatchModal(false);
    setSelectedBatchId(batchObj.id);
  };

  const handleUpdateBatchStatus = (batchId, newStatus) => {
    const target = partnerBatches.find(b => b.id === batchId);
    if (target) {
      const updatedBatch = { ...target, status: newStatus };
      const updated = updatePartnerBatch(updatedBatch);
      setPartnerBatches(updated);
    }
  };

  const handleDeleteBatch = (batchId) => {
    if (window.confirm(`Are you sure you want to delete Batch #${batchId}?`)) {
      const updated = deletePartnerBatch(batchId);
      setPartnerBatches(updated);
      if (selectedBatchId === batchId) setSelectedBatchId(null);
    }
  };

  // VEHICLE CRUD (ADD / EDIT / DELETE)
  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.vehicleNumber || !selectedBatchId) return;

    const targetBatch = partnerBatches.find(b => b.id === selectedBatchId);
    if (!targetBatch) return;

    let updatedBatch;
    if (editingVehicle) {
      const updatedVehicles = (targetBatch.vehicles || []).map(v => {
        if (v.id === editingVehicle.id) {
          return {
            ...v,
            vehicleNumber: newVehicle.vehicleNumber.toUpperCase(),
            vehicleName: newVehicle.vehicleName || 'Vehicle',
            notes: newVehicle.notes
          };
        }
        return v;
      });
      updatedBatch = { ...targetBatch, vehicles: updatedVehicles };
      setEditingVehicle(null);
    } else {
      const vehicleObj = {
        id: `veh_${Date.now()}`,
        vehicleNumber: newVehicle.vehicleNumber.toUpperCase(),
        vehicleName: newVehicle.vehicleName || 'Vehicle',
        notes: newVehicle.notes,
        services: []
      };
      updatedBatch = { ...targetBatch, vehicles: [...(targetBatch.vehicles || []), vehicleObj] };
    }

    const updatedBatches = updatePartnerBatch(updatedBatch);
    setPartnerBatches(updatedBatches);
    setNewVehicle({ vehicleNumber: '', vehicleName: '', notes: '' });
    setShowAddVehicleModal(false);
  };

  const handleDeleteVehicle = (vehicleId, vehNumber) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehNumber} from this batch?`)) {
      const targetBatch = partnerBatches.find(b => b.id === selectedBatchId);
      if (targetBatch) {
        const updatedBatch = { ...targetBatch, vehicles: (targetBatch.vehicles || []).filter(v => v.id !== vehicleId) };
        const updatedBatches = updatePartnerBatch(updatedBatch);
        setPartnerBatches(updatedBatches);
      }
    }
  };

  // SERVICE ENTRY CRUD (ADD / EDIT / DELETE)
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!selectedBatchId || !targetVehicleId) return;

    const targetBatch = partnerBatches.find(b => b.id === selectedBatchId);
    if (!targetBatch) return;

    let serviceName = newService.customName;
    if (newService.serviceKey !== 'custom' && masterServices[newService.serviceKey]) {
      serviceName = masterServices[newService.serviceKey].name;
    }

    const qty = parseFloat(newService.quantity) || 1;
    const rate = parseFloat(newService.rate) || 0;
    const amount = qty * rate;

    let updatedBatch;
    if (editingService) {
      const updatedVehicles = (targetBatch.vehicles || []).map(v => {
        if (v.id === targetVehicleId) {
          const updatedServices = (v.services || []).map(s => {
            if (s.id === editingService.service.id) {
              return {
                ...s,
                date: newService.date,
                serviceName: serviceName || 'General Service',
                description: newService.description,
                quantity: qty,
                rate: rate,
                amount: amount,
                notes: newService.notes
              };
            }
            return s;
          });
          return { ...v, services: updatedServices };
        }
        return v;
      });
      updatedBatch = { ...targetBatch, vehicles: updatedVehicles };
      setEditingService(null);
    } else {
      const serviceObj = {
        id: `serv_${Date.now()}`,
        date: newService.date,
        serviceName: serviceName || 'General Service',
        description: newService.description,
        quantity: qty,
        rate: rate,
        amount: amount,
        notes: newService.notes
      };

      const updatedVehicles = (targetBatch.vehicles || []).map(v => {
        if (v.id === targetVehicleId) {
          return { ...v, services: [...(v.services || []), serviceObj] };
        }
        return v;
      });
      updatedBatch = { ...targetBatch, vehicles: updatedVehicles };
    }

    const updatedBatches = updatePartnerBatch(updatedBatch);
    setPartnerBatches(updatedBatches);
    setShowAddServiceModal(false);
    setNewService({
      serviceKey: 'wheelAlignment',
      customName: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      rate: 350,
      notes: ''
    });
  };

  const handleDeleteService = (vehicleId, serviceId) => {
    if (window.confirm(`Are you sure you want to delete this service entry?`)) {
      const targetBatch = partnerBatches.find(b => b.id === selectedBatchId);
      if (targetBatch) {
        const updatedVehicles = (targetBatch.vehicles || []).map(v => {
          if (v.id === vehicleId) {
            return { ...v, services: (v.services || []).filter(s => s.id !== serviceId) };
          }
          return v;
        });
        const updatedBatch = { ...targetBatch, vehicles: updatedVehicles };
        const updatedBatches = updatePartnerBatch(updatedBatch);
        setPartnerBatches(updatedBatches);
      }
    }
  };

  // PAYMENT INSTALLMENT CRUD (ADD / EDIT / DELETE)
  const handleSavePayment = (e) => {
    e.preventDefault();
    const amt = parseFloat(newPayment.amount);
    if (isNaN(amt) || amt <= 0 || !selectedBatchId) return;

    const targetBatch = partnerBatches.find(b => b.id === selectedBatchId);
    if (!targetBatch) return;

    let updatedBatch;
    if (editingPayment) {
      const updatedPayments = (targetBatch.payments || []).map(p => {
        if (p.id === editingPayment.id) {
          return {
            ...p,
            stage: newPayment.stage,
            amount: amt,
            paymentMethod: newPayment.paymentMethod,
            date: newPayment.date,
            note: newPayment.note
          };
        }
        return p;
      });
      updatedBatch = { ...targetBatch, payments: updatedPayments };
      setEditingPayment(null);
    } else {
      const paymentObj = {
        id: `pay_${Date.now()}`,
        stage: newPayment.stage,
        amount: amt,
        paymentMethod: newPayment.paymentMethod,
        date: newPayment.date,
        note: newPayment.note
      };

      const updatedPayments = [...(targetBatch.payments || []), paymentObj];
      updatedBatch = { ...targetBatch, payments: updatedPayments };
    }

    const updatedBatches = updatePartnerBatch(updatedBatch);
    setPartnerBatches(updatedBatches);
    setShowAddPaymentModal(false);
    setNewPayment({
      stage: '🟢 Advance Payment (Before Service)',
      amount: '',
      paymentMethod: 'UPI / QR Code',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm(`Are you sure you want to delete this payment installment?`)) {
      const targetBatch = partnerBatches.find(b => b.id === selectedBatchId);
      if (targetBatch) {
        const updatedPayments = (targetBatch.payments || []).filter(p => p.id !== paymentId);
        const updatedBatch = { ...targetBatch, payments: updatedPayments };
        const updatedBatches = updatePartnerBatch(updatedBatch);
        setPartnerBatches(updatedBatches);
      }
    }
  };

  // Current Selected Batch Object
  const selectedBatch = partnerBatches.find(b => b.id === selectedBatchId);
  const selectedBatchFin = selectedBatch ? calculateBatchFinancials(selectedBatch) : null;

  // Filtered Batches List
  const filteredBatches = partnerBatches.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(term) ||
      b.partnerGarageName.toLowerCase().includes(term) ||
      (b.vehicles || []).some(v => v.vehicleNumber.toLowerCase().includes(term) || v.vehicleName.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  // WhatsApp Sender for Receipts
  const sendWhatsAppReceipt = (type, data) => {
    let lines = [];
    const phone = data.partnerMobile || data.mobile || '9545550087';

    if (type === 'payment') {
      lines = [
        `*STOP & GO TOTAL TYRE CARE CENTRE*`,
        `Beside Solapur Steel, Oppo Chroma Showroom Hotgi road, Solapur.`,
        `Ph: +91 95455 50087, +91 94031 36311`,
        `------------------------------------`,
        `💳 *OFFICIAL PARTNER PAYMENT RECEIPT*`,
        `------------------------------------`,
        `🏢 *Partner Garage:* ${data.partnerGarageName}`,
        `📦 *Batch Ref:* ${data.batchId}`,
        `📅 *Payment Date:* ${data.date}`,
        `📌 *Payment Stage:* ${data.stage}`,
        `💵 *Amount Received:* *₹${data.amount.toLocaleString('en-IN')}*`,
        `📱 *Payment Mode:* ${data.paymentMethod}`,
        data.note ? `📝 *Note:* ${data.note}` : null,
        `------------------------------------`,
        `*CURRENT BATCH STATUS:*`,
        `Total Billed: ₹${data.totalBilled.toLocaleString('en-IN')}`,
        `Total Paid: ₹${data.totalPaid.toLocaleString('en-IN')}`,
        `*REMAINING BALANCE DUE: ₹${data.balanceDue.toLocaleString('en-IN')}*`,
        ``,
        `Thank you for your payment! 🚗💨`
      ];
    } else if (type === 'vehicle') {
      const itemsStr = (data.vehicle.services || []).map(s => `* ${s.serviceName}: ₹${s.amount.toLocaleString('en-IN')}`).join('\n');
      lines = [
        `*STOP & GO TOTAL TYRE CARE CENTRE*`,
        `Beside Solapur Steel, Oppo Chroma Showroom Hotgi road, Solapur.`,
        `------------------------------------`,
        `🚗 *VEHICLE SERVICE SLIP (Batch ${data.batchId})*`,
        `------------------------------------`,
        `🚘 *Vehicle:* ${data.vehicle.vehicleName} (${data.vehicle.vehicleNumber})`,
        `🏢 *Partner Garage:* ${data.partnerGarageName}`,
        `------------------------------------`,
        `*SERVICES PERFORMED:*`,
        itemsStr,
        `------------------------------------`,
        `*VEHICLE TOTAL: ₹${data.vehicleSubtotal.toLocaleString('en-IN')}*`,
        ``,
        `Thank you for trusting STOP & GO!`
      ];
    } else if (type === 'batch') {
      const vehicleLines = (data.batch.vehicles || []).map(v => {
        let vSub = 0;
        (v.services || []).forEach(s => vSub += s.amount);
        return `• *${v.vehicleName} (${v.vehicleNumber})*: ₹${vSub.toLocaleString('en-IN')}`;
      }).join('\n');

      lines = [
        `*STOP & GO TOTAL TYRE CARE CENTRE*`,
        `Beside Solapur Steel, Oppo Chroma Showroom Hotgi road, Solapur.`,
        `Ph: +91 95455 50087, +91 94031 36311`,
        `------------------------------------`,
        `📄 *CONSOLIDATED BATCH STATEMENT ${data.batch.id}*`,
        `------------------------------------`,
        `🏢 *Partner Garage:* ${data.batch.partnerGarageName}`,
        `📅 *Drop-Off Date:* ${data.batch.dropOffDate}`,
        `📅 *Expected Pickup:* ${data.batch.expectedPickupDate}`,
        `------------------------------------`,
        `*VEHICLES SUMMARY (${(data.batch.vehicles || []).length}):*`,
        vehicleLines,
        `------------------------------------`,
        `TOTAL BATCH BILLED: ₹${data.fin.totalBilled.toLocaleString('en-IN')}`,
        `TOTAL PAID INSTALLMENTS: ₹${data.fin.totalPaid.toLocaleString('en-IN')}`,
        `*NET BALANCE DUE: ₹${data.fin.balanceDue.toLocaleString('en-IN')} (${data.fin.paymentStatus.toUpperCase()})*`,
        ``,
        `Thank you for your partnership! 🚗💨`
      ];
    }

    const fullText = lines.filter(line => line !== null).join('\n');
    const cleanMobile = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(fullText);
    window.open(`https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodedText}`, '_blank');
  };

  return (
    <div className="tab-content-container">
      
      {/* Top Header & Sub-Nav Bar */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">🏢 Partner Batches & B2B Contracts</h2>
          <p className="section-desc">Manage bulk vehicle drop-offs (15–20 days), multi-day vehicle service logs, and installment payments</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`segmented-btn ${subTab === 'batches' ? 'active' : ''}`}
            onClick={() => { setSubTab('batches'); setSelectedBatchId(null); }}
          >
            <Package size={16} />
            <span>Batches ({partnerBatches.length})</span>
          </button>

          <button
            type="button"
            className={`segmented-btn ${subTab === 'garages' ? 'active' : ''}`}
            onClick={() => { setSubTab('garages'); setSelectedBatchId(null); }}
          >
            <Building2 size={16} />
            <span>Source Garages ({partnerGarages.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SELECTED BATCH DETAIL WORKSPACE */}
      {/* ========================================================================= */}
      {selectedBatch ? (
        <div>
          
          {/* Back Navigation & Batch Status Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary-sm"
              onClick={() => setSelectedBatchId(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back to Batches List
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status:</span>
              <select
                value={selectedBatch.status}
                onChange={(e) => handleUpdateBatchStatus(selectedBatch.id, e.target.value)}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--yellow-primary)',
                  border: '1px solid var(--yellow-primary)',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                <option value="Active">🟢 Active (Work in Progress)</option>
                <option value="Completed">✅ Completed & Delivered</option>
                <option value="Overdue">🔴 Overdue</option>
              </select>

              <button
                type="button"
                className="btn-delete-icon"
                onClick={() => handleDeleteBatch(selectedBatch.id)}
                title="Delete Entire Batch"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Batch Info Header Card */}
          <div className="card-container" style={{ marginBottom: '24px', border: '1px solid var(--yellow-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge-chip info" style={{ marginBottom: '8px' }}>Batch #{selectedBatch.id}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-white)' }}>
                  🏢 {selectedBatch.partnerGarageName}
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span><User size={13} /> Contact: <strong>{selectedBatch.partnerContact}</strong></span>
                  <span><Phone size={13} /> +91 <strong>{selectedBatch.partnerMobile}</strong></span>
                  <span><Calendar size={13} /> Drop-off: <strong>{selectedBatch.dropOffDate}</strong></span>
                  <span><Clock size={13} /> Expected Pickup: <strong>{selectedBatch.expectedPickupDate}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary-large"
                  style={{ background: 'rgba(250, 204, 21, 0.15)', color: 'var(--yellow-primary)', border: '1px solid var(--yellow-primary)', padding: '10px 16px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setActiveReceiptData({ batch: selectedBatch, fin: selectedBatchFin });
                    setActiveReceiptType('batch');
                  }}
                >
                  <FileText size={16} />
                  <span>Consolidated Batch Bill</span>
                </button>

                <button
                  type="button"
                  className="btn-generate-bill"
                  style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setEditingVehicle(null);
                    setNewVehicle({ vehicleNumber: '', vehicleName: '', notes: '' });
                    setShowAddVehicleModal(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add Vehicle to Batch</span>
                </button>

                <button
                  type="button"
                  className="btn-generate-whatsapp"
                  style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setEditingPayment(null);
                    setNewPayment({
                      stage: '🟢 Advance Payment (Before Service)',
                      amount: '',
                      paymentMethod: 'UPI / QR Code',
                      date: new Date().toISOString().split('T')[0],
                      note: ''
                    });
                    setShowAddPaymentModal(true);
                  }}
                >
                  <DollarSign size={16} />
                  <span>Record Payment Installment</span>
                </button>
              </div>
            </div>

            {/* Financial Progress Banner */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL BATCH BILLED</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedBatchFin.totalBilled.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--emerald-primary)' }}>TOTAL PAID INSTALLMENTS</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedBatchFin.totalPaid.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(250, 204, 21, 0.4)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--yellow-primary)' }}>REMAINING BALANCE DUE</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--yellow-primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedBatchFin.balanceDue.toLocaleString('en-IN')}
                  <span style={{ fontSize: '0.75rem', marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', background: 'var(--yellow-primary)', color: '#000000', fontWeight: '800' }}>
                    {selectedBatchFin.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMNS: LEFT = VEHICLES & MULTI-DAY SERVICE LOG | RIGHT = PAYMENTS LEDGER */}
          <div className="analytics-two-col">
            
            {/* LEFT COLUMN: VEHICLES LIST */}
            <div className="card-container">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package className="card-icon" size={22} />
                  <h2>Vehicles in Batch ({(selectedBatch.vehicles || []).length})</h2>
                </div>

                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => {
                    setEditingVehicle(null);
                    setNewVehicle({ vehicleNumber: '', vehicleName: '', notes: '' });
                    setShowAddVehicleModal(true);
                  }}
                >
                  <Plus size={14} /> Add Vehicle
                </button>
              </div>

              {(selectedBatch.vehicles || []).length === 0 ? (
                <div className="no-results-card" style={{ padding: '30px' }}>
                  <Package size={32} className="text-muted" />
                  <p>No vehicles added to this batch yet.</p>
                  <button type="button" className="btn-generate-bill" onClick={() => setShowAddVehicleModal(true)}>
                    ➕ Add First Vehicle
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedBatch.vehicles.map((v, vIndex) => {
                    let vSubtotal = 0;
                    (v.services || []).forEach(s => vSubtotal += s.amount);

                    return (
                      <div key={v.id} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-medium)', borderRadius: '10px', padding: '16px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--yellow-primary)', fontWeight: '700' }}>Vehicle #{vIndex + 1}</span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-white)' }}>
                              {v.vehicleName} ({v.vehicleNumber})
                            </h3>
                            {v.notes && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Note: {v.notes}</p>}
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div>
                              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--yellow-primary)', fontFamily: 'var(--font-mono)' }}>
                                ₹{vSubtotal.toLocaleString('en-IN')}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(v.services || []).length} Services</span>
                            </div>

                            {/* VEHICLE EDIT & DELETE BUTTONS */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn-secondary-sm"
                                style={{ padding: '4px 8px' }}
                                onClick={() => {
                                  setEditingVehicle(v);
                                  setNewVehicle({ vehicleNumber: v.vehicleNumber, vehicleName: v.vehicleName, notes: v.notes || '' });
                                  setShowAddVehicleModal(true);
                                }}
                                title="Edit Vehicle Info"
                              >
                                <Edit3 size={13} />
                              </button>

                              <button
                                type="button"
                                className="btn-delete-icon"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                                title="Delete Vehicle from Batch"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Services List for this Vehicle */}
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Multi-Day Service History:</strong>
                            <button
                              type="button"
                              className="btn-secondary-sm"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                              onClick={() => {
                                setEditingService(null);
                                setTargetVehicleId(v.id);
                                setNewService({
                                  serviceKey: 'wheelAlignment',
                                  customName: '',
                                  description: '',
                                  date: new Date().toISOString().split('T')[0],
                                  quantity: 1,
                                  rate: 350,
                                  notes: ''
                                });
                                setShowAddServiceModal(true);
                              }}
                            >
                              <Plus size={12} /> Log Service
                            </button>
                          </div>

                          {(v.services || []).length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No service entries logged yet for this vehicle.</p>
                          ) : (
                            <table className="receipt-table" style={{ fontSize: '0.82rem' }}>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Service Item</th>
                                  <th>Qty x Rate</th>
                                  <th className="align-right">Amt (₹)</th>
                                  <th className="align-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {v.services.map(s => (
                                  <tr key={s.id}>
                                    <td>{s.date}</td>
                                    <td>
                                      <strong>{s.serviceName}</strong>
                                      {s.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.description}</div>}
                                    </td>
                                    <td>{s.quantity} x ₹{s.rate}</td>
                                    <td className="align-right" style={{ color: 'var(--yellow-primary)', fontWeight: '700' }}>₹{s.amount}</td>
                                    <td className="align-right">
                                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setTargetVehicleId(v.id);
                                            setEditingService({ vehicleId: v.id, service: s });
                                            setNewService({
                                              serviceKey: 'custom',
                                              customName: s.serviceName,
                                              description: s.description || '',
                                              date: s.date,
                                              quantity: s.quantity,
                                              rate: s.rate,
                                              notes: s.notes || ''
                                            });
                                            setShowAddServiceModal(true);
                                          }}
                                          style={{ background: 'transparent', border: 'none', color: 'var(--yellow-primary)', cursor: 'pointer' }}
                                          title="Edit Service Entry"
                                        >
                                          <Edit3 size={13} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteService(v.id, s.id)}
                                          style={{ background: 'transparent', border: 'none', color: 'var(--ruby-primary)', cursor: 'pointer' }}
                                          title="Delete Service Entry"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Vehicle Action Footer */}
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary-sm"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => {
                              setActiveReceiptData({
                                batchId: selectedBatch.id,
                                partnerGarageName: selectedBatch.partnerGarageName,
                                partnerMobile: selectedBatch.partnerMobile,
                                vehicle: v,
                                vehicleSubtotal: vSubtotal
                              });
                              setActiveReceiptType('vehicle');
                            }}
                          >
                            <FileText size={13} />
                            <span>Vehicle Bill Slip</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PARTIAL PAYMENTS LEDGER */}
            <div className="card-container">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DollarSign className="card-icon" size={22} />
                  <h2>Installment Payment Ledger ({(selectedBatch.payments || []).length})</h2>
                </div>

                <button
                  type="button"
                  className="btn-whatsapp-sm"
                  onClick={() => {
                    setEditingPayment(null);
                    setNewPayment({
                      stage: '🟢 Advance Payment (Before Service)',
                      amount: '',
                      paymentMethod: 'UPI / QR Code',
                      date: new Date().toISOString().split('T')[0],
                      note: ''
                    });
                    setShowAddPaymentModal(true);
                  }}
                >
                  <Plus size={14} /> Record Payment
                </button>
              </div>

              {(selectedBatch.payments || []).length === 0 ? (
                <div className="no-results-card" style={{ padding: '30px' }}>
                  <DollarSign size={32} className="text-muted" />
                  <p>No payment installments recorded yet.</p>
                  <button type="button" className="btn-whatsapp-sm" onClick={() => setShowAddPaymentModal(true)}>
                    💳 Record Advance Payment
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedBatch.payments.map((p) => (
                    <div key={p.id} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--emerald-primary)', fontWeight: '700' }}>{p.stage}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-white)', fontWeight: '600' }}>
                          {p.date} via {p.paymentMethod}
                        </div>
                        {p.note && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Note: {p.note}</div>}
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                          ₹{p.amount.toLocaleString('en-IN')}
                        </div>

                        {/* PAYMENT EDIT & DELETE BUTTONS */}
                        <button
                          type="button"
                          className="btn-secondary-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            setEditingPayment(p);
                            setNewPayment({
                              stage: p.stage,
                              amount: p.amount,
                              paymentMethod: p.paymentMethod,
                              date: p.date,
                              note: p.note || ''
                            });
                            setShowAddPaymentModal(true);
                          }}
                          title="Edit Payment Entry"
                        >
                          <Edit3 size={12} />
                        </button>

                        <button
                          type="button"
                          className="btn-delete-icon"
                          style={{ padding: '4px 8px' }}
                          onClick={() => handleDeletePayment(p.id)}
                          title="Delete Payment Entry"
                        >
                          <Trash2 size={12} />
                        </button>

                        <button
                          type="button"
                          className="btn-secondary-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            setActiveReceiptData({
                              batchId: selectedBatch.id,
                              partnerGarageName: selectedBatch.partnerGarageName,
                              partnerMobile: selectedBatch.partnerMobile,
                              stage: p.stage,
                              amount: p.amount,
                              paymentMethod: p.paymentMethod,
                              date: p.date,
                              note: p.note,
                              totalBilled: selectedBatchFin.totalBilled,
                              totalPaid: selectedBatchFin.totalPaid,
                              balanceDue: selectedBatchFin.balanceDue
                            });
                            setActiveReceiptType('payment');
                          }}
                          title="Generate payment receipt slip"
                        >
                          <FileText size={12} /> Slip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2 & 3: BATCHES DASHBOARD OR SOURCE GARAGES DIRECTORY */
        /* ========================================================================= */
        <div>

          {subTab === 'batches' ? (
            <div>
              
              {/* Filter & Search Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Active', 'Completed', 'Overdue', 'All'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`sub-pill ${statusFilter === st ? 'active' : ''}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="search-box-wide" style={{ width: '280px', margin: 0 }}>
                    <Search className="search-icon" size={16} />
                    <input
                      type="text"
                      placeholder="Search Batch ID, Garage, Car..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-generate-bill"
                    onClick={() => setShowNewBatchModal(true)}
                  >
                    <Plus size={18} />
                    <span>New Batch Drop-Off</span>
                  </button>
                </div>

              </div>

              {/* Batches Grid */}
              <div className="customers-cards-grid">
                {filteredBatches.length === 0 ? (
                  <div className="no-results-card" style={{ gridColumn: '1 / -1' }}>
                    <Package size={36} className="text-muted" />
                    <p>No partner garage batches found.</p>
                    <button type="button" className="btn-generate-bill" onClick={() => setShowNewBatchModal(true)}>
                      ➕ Create First Batch Drop-Off
                    </button>
                  </div>
                ) : (
                  filteredBatches.map(batch => {
                    const fin = calculateBatchFinancials(batch);

                    return (
                      <div
                        key={batch.id}
                        className="customer-card"
                        onClick={() => setSelectedBatchId(batch.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="customer-card-header">
                          <div>
                            <span className="badge-chip info" style={{ marginBottom: '6px' }}>Batch #{batch.id}</span>
                            <h3 className="cust-name">🏢 {batch.partnerGarageName}</h3>
                            <div className="cust-phone"><Phone size={13} /> +91 {batch.partnerMobile}</div>
                          </div>

                          <span className={`visit-badge ${batch.status === 'Completed' ? 'ok' : ''}`}>
                            {batch.status}
                          </span>
                        </div>

                        <div className="customer-card-details">
                          <div className="detail-line">
                            <Calendar size={14} className="detail-icon" />
                            <span>Drop-Off: <strong>{batch.dropOffDate}</strong></span>
                          </div>
                          <div className="detail-line">
                            <Clock size={14} className="detail-icon" />
                            <span>Expected Pickup: <strong>{batch.expectedPickupDate}</strong></span>
                          </div>
                          <div className="detail-line">
                            <Package size={14} className="detail-icon" />
                            <span>Vehicles in Batch: <strong>{(batch.vehicles || []).length} Cars</strong></span>
                          </div>
                        </div>

                        {/* Financial Bar */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Billed: ₹{fin.totalBilled.toLocaleString('en-IN')}</span>
                            <span>Paid: ₹{fin.totalPaid.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '800', marginTop: '4px' }}>
                            <span style={{ color: 'var(--text-white)' }}>Balance Due:</span>
                            <span style={{ color: 'var(--yellow-primary)', fontFamily: 'var(--font-mono)' }}>₹{fin.balanceDue.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="customer-card-footer">
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(250, 204, 21, 0.15)', color: 'var(--yellow-primary)' }}>
                            {fin.paymentStatus}
                          </span>

                          <button type="button" className="btn-details-sm">
                            <span>Open Batch Workspace</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ) : (
            /* SOURCE GARAGES DIRECTORY (SUBTAB = GARAGES) */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-subtitle" style={{ margin: 0 }}>Partner Garage Directory</h3>
                <button type="button" className="btn-generate-bill" onClick={() => setShowAddGarageModal(true)}>
                  <Plus size={18} />
                  <span>Add Partner Garage</span>
                </button>
              </div>

              <div className="customers-cards-grid">
                {partnerGarages.length === 0 ? (
                  <div className="no-results-card" style={{ gridColumn: '1 / -1' }}>
                    <Building2 size={36} className="text-muted" />
                    <p>No partner garages added yet.</p>
                  </div>
                ) : (
                  partnerGarages.map(g => (
                    <div key={g.id} className="customer-card">
                      <div className="customer-card-header">
                        <div>
                          <h3 className="cust-name">🏢 {g.name}</h3>
                          <div className="cust-phone"><Phone size={13} /> +91 {g.mobile}</div>
                        </div>
                      </div>

                      <div className="customer-card-details">
                        <div className="detail-line">
                          <User size={14} className="detail-icon" />
                          <span>Contact Person: <strong>{g.contactPerson || 'N/A'}</strong></span>
                        </div>
                        <div className="detail-line">
                          <MapPin size={14} className="detail-icon" />
                          <span>Address: {g.address || 'N/A'}</span>
                        </div>
                        {g.notes && <div className="detail-line"><span>Note: {g.notes}</span></div>}
                      </div>

                      <div className="customer-card-footer">
                        <button
                          type="button"
                          className="btn-delete-icon"
                          onClick={() => handleDeleteGarage(g.id, g.name)}
                          title="Delete Garage"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-generate-bill"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => {
                            setNewBatch(prev => ({ ...prev, partnerGarageId: g.id }));
                            setShowNewBatchModal(true);
                          }}
                        >
                          <Plus size={14} /> New Batch Drop-Off
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PARTNER GARAGE MODAL */}
      {/* ========================================================================= */}
      {showAddGarageModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header-bar">
              <div className="modal-title">
                <Building2 style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>Add New Partner / Source Garage</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowAddGarageModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveGarage} className="grid-form" style={{ padding: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Garage Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sahara Motors"
                  value={newGarage.name}
                  onChange={(e) => setNewGarage({ ...newGarage, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Aslam Khan"
                  value={newGarage.contactPerson}
                  onChange={(e) => setNewGarage({ ...newGarage, contactPerson: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9822011223"
                  maxLength={10}
                  value={newGarage.mobile}
                  onChange={(e) => setNewGarage({ ...newGarage, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <input
                  type="text"
                  placeholder="e.g. Hotgi Road Industrial Estate, Solapur"
                  value={newGarage.address}
                  onChange={(e) => setNewGarage({ ...newGarage, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} /> Save Partner Garage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW BATCH DROP-OFF MODAL */}
      {/* ========================================================================= */}
      {showNewBatchModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header-bar">
              <div className="modal-title">
                <Package style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>Create New Batch Drop-Off Contract</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowNewBatchModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateBatch} className="grid-form" style={{ padding: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Select Partner / Source Garage *</label>
                <select
                  value={newBatch.partnerGarageId}
                  onChange={(e) => setNewBatch({ ...newBatch, partnerGarageId: e.target.value })}
                  required
                >
                  {partnerGarages.map(g => (
                    <option key={g.id} value={g.id}>🏢 {g.name} (+91 {g.mobile})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Drop-Off Date *</label>
                <input
                  type="date"
                  value={newBatch.dropOffDate}
                  onChange={(e) => setNewBatch({ ...newBatch, dropOffDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Expected Pickup Date (15–20 Days) *</label>
                <input
                  type="date"
                  value={newBatch.expectedPickupDate}
                  onChange={(e) => setNewBatch({ ...newBatch, expectedPickupDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Contract Notes / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 10 vehicles drop-off for wheel alignment and engine repairs"
                  value={newBatch.notes}
                  onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} /> Create & Open Batch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT VEHICLE TO BATCH MODAL */}
      {/* ========================================================================= */}
      {showAddVehicleModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header-bar">
              <div className="modal-title">
                <Package style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>{editingVehicle ? 'Edit Vehicle Info' : `Add Vehicle to Batch #${selectedBatchId}`}</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowAddVehicleModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveVehicle} className="grid-form" style={{ padding: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Vehicle Reg. Number *</label>
                <input
                  type="text"
                  placeholder="e.g. MH-12-AB-1234"
                  value={newVehicle.vehicleNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Make / Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maruti Swift / Tata Ace / Creta"
                  value={newVehicle.vehicleName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Initial Vehicle Condition / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Left front tyre damaged"
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} /> {editingVehicle ? 'Update Vehicle Info' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LOG / EDIT MULTI-DAY SERVICE ENTRY MODAL */}
      {/* ========================================================================= */}
      {showAddServiceModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header-bar">
              <div className="modal-title">
                <FileText style={{ color: 'var(--yellow-primary)' }} size={22} />
                <span>{editingService ? 'Edit Service Entry' : 'Log Service Entry'}</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowAddServiceModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveService} className="grid-form" style={{ padding: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Select Service Type</label>
                <select
                  value={newService.serviceKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    const defaultRate = masterServices[key]?.price || 350;
                    setNewService({ ...newService, serviceKey: key, rate: defaultRate });
                  }}
                >
                  <option value="wheelAlignment">1. Wheel Alignment (₹350)</option>
                  <option value="wheelBalancing">2. Wheel Balancing Fees (₹200)</option>
                  <option value="weight">3. Wheel Weight (Sticker/Brass)</option>
                  <option value="tyreFitting">4. Tyre Fitting & Valves</option>
                  <option value="tyreRotation">5. Tyre Rotation (₹200)</option>
                  <option value="headlightBuffing">6. Head Light Buffing (₹700)</option>
                  <option value="airFilling">7. Air Filling / Nitrogen (₹150)</option>
                  <option value="tubelessPuncher">8. Tubeless Puncher Repair (₹100)</option>
                  <option value="camberSetting">9. Camber Setting (₹1,200)</option>
                  <option value="carWashing">10. Car Washing (₹350)</option>
                  <option value="internalCleaning">11. Internal Cleaning (₹800)</option>
                  <option value="oilChange">12. Engine Oil Change (₹1,500)</option>
                  <option value="custom">⚙️ Free-Text Custom Repair (Engine, Painting, Denting)</option>
                </select>
              </div>

              {newService.serviceKey === 'custom' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Custom Repair / Service Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Engine Overhaul, Body Painting, Denting Repair"
                    value={newService.customName}
                    onChange={(e) => setNewService({ ...newService, customName: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Service Date *</label>
                <input
                  type="date"
                  value={newService.date}
                  onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={newService.quantity}
                  onChange={(e) => setNewService({ ...newService, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rate / Price (₹) *</label>
                <input
                  type="number"
                  value={newService.rate}
                  onChange={(e) => setNewService({ ...newService, rate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Amount (₹)</label>
                <input
                  type="text"
                  value={`₹${(parseFloat(newService.quantity || 1) * parseFloat(newService.rate || 0)).toLocaleString('en-IN')}`}
                  readOnly
                  style={{ background: 'var(--bg-surface-elevated)', color: 'var(--yellow-primary)', fontWeight: '800' }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Work Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Replaced front brake pads & aligned front tyres"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} /> {editingService ? 'Update Service Entry' : 'Log Service Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RECORD / EDIT PAYMENT INSTALLMENT MODAL */}
      {/* ========================================================================= */}
      {showAddPaymentModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header-bar">
              <div className="modal-title">
                <DollarSign style={{ color: 'var(--emerald-primary)' }} size={22} />
                <span>{editingPayment ? 'Edit Payment Installment' : 'Record Installment Payment'}</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowAddPaymentModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSavePayment} className="grid-form" style={{ padding: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Payment Stage / Category *</label>
                <select
                  value={newPayment.stage}
                  onChange={(e) => setNewPayment({ ...newPayment, stage: e.target.value })}
                >
                  <option value="🟢 Advance Payment (Before Service)">🟢 Advance Payment (Before Service)</option>
                  <option value="🟡 Mid-Batch Installment">🟡 Mid-Batch Installment</option>
                  <option value="🔵 Final Settlement (After Service)">🔵 Final Settlement (After Service)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Payment Mode *</label>
                <div className="radio-group-segmented">
                  <button
                    type="button"
                    className={`segmented-btn ${newPayment.paymentMethod === 'UPI / QR Code' ? 'active' : ''}`}
                    onClick={() => setNewPayment({ ...newPayment, paymentMethod: 'UPI / QR Code' })}
                  >
                    📱 UPI / QR Code
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${newPayment.paymentMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setNewPayment({ ...newPayment, paymentMethod: 'Cash' })}
                  >
                    💵 Cash
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Payment Note / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Received advance via PhonePe"
                  value={newPayment.note}
                  onChange={(e) => setNewPayment({ ...newPayment, note: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-whatsapp-sm" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  <DollarSign size={18} /> {editingPayment ? 'Update Payment Entry' : 'Record & Generate Payment Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT MODAL: BATCH / VEHICLE / PAYMENT SLIPS (80mm Thermal & WhatsApp) */}
      {/* ========================================================================= */}
      {activeReceiptData && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header-bar">
              <div className="modal-title">
                <CheckCircle2 style={{ color: 'var(--emerald-primary)' }} size={22} />
                <span>
                  {activeReceiptType === 'payment' && 'Payment Installment Slip'}
                  {activeReceiptType === 'vehicle' && 'Single Vehicle Service Slip'}
                  {activeReceiptType === 'batch' && 'Consolidated Batch Statement'}
                </span>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveReceiptData(null)}><X size={20} /></button>
            </div>

            {/* Printable Area */}
            <div className="printable-receipt-area" id="printable-partner-receipt">
              <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '12px' }}>
                <LogoBanner height="50px" useVector={false} forPrint={true} />
                <div className="receipt-address" style={{ marginTop: '8px', fontWeight: '600', fontSize: '0.85rem' }}>
                  Beside Solapur Steel, Oppo Chroma Showroom Hotgi road, Solapur.
                </div>
                <div className="receipt-address" style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '2px' }}>
                  Ph: +91 95455 50087, +91 94031 36311
                </div>
              </div>

              <div className="receipt-divider">---------------------------------------------</div>

              {/* PAYMENT SLIP PRINT TEMPLATE */}
              {activeReceiptType === 'payment' && (
                <>
                  <div className="receipt-meta">
                    <div className="meta-row"><span>Batch Ref: <strong>#{activeReceiptData.batchId}</strong></span><span>Date: {activeReceiptData.date}</span></div>
                    <div className="meta-row"><span>Partner Garage: <strong>{activeReceiptData.partnerGarageName}</strong></span></div>
                    <div className="meta-row"><span>Stage: <strong>{activeReceiptData.stage}</strong></span><span>Mode: {activeReceiptData.paymentMethod}</span></div>
                  </div>
                  <div className="receipt-divider">---------------------------------------------</div>
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '0.85rem' }}>AMOUNT RECEIVED</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>₹{activeReceiptData.amount.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="receipt-divider">---------------------------------------------</div>
                  <div className="receipt-totals">
                    <div className="total-row"><span>Total Billed:</span><span>₹{activeReceiptData.totalBilled.toLocaleString('en-IN')}</span></div>
                    <div className="total-row"><span>Total Paid To Date:</span><span>₹{activeReceiptData.totalPaid.toLocaleString('en-IN')}</span></div>
                    <div className="total-row grand-total"><span>BALANCE DUE:</span><span>₹{activeReceiptData.balanceDue.toLocaleString('en-IN')}</span></div>
                  </div>
                </>
              )}

              {/* VEHICLE SLIP PRINT TEMPLATE */}
              {activeReceiptType === 'vehicle' && (
                <>
                  <div className="receipt-meta">
                    <div className="meta-row"><span>Batch Ref: <strong>#{activeReceiptData.batchId}</strong></span><span>Partner: {activeReceiptData.partnerGarageName}</span></div>
                    <div className="meta-row"><span>Vehicle: <strong>{activeReceiptData.vehicle.vehicleName}</strong></span><span>Reg: <strong>{activeReceiptData.vehicle.vehicleNumber}</strong></span></div>
                  </div>
                  <div className="receipt-divider">---------------------------------------------</div>
                  <table className="receipt-table">
                    <thead>
                      <tr><th className="align-left">Service Item</th><th className="align-right">Amt (₹)</th></tr>
                    </thead>
                    <tbody>
                      {(activeReceiptData.vehicle.services || []).map((s, i) => (
                        <tr key={i}>
                          <td className="align-left">{s.serviceName} ({s.date})</td>
                          <td className="align-right">{s.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="receipt-divider">---------------------------------------------</div>
                  <div className="receipt-totals">
                    <div className="total-row grand-total"><span>VEHICLE TOTAL:</span><span>₹{activeReceiptData.vehicleSubtotal.toLocaleString('en-IN')}</span></div>
                  </div>
                </>
              )}

              {/* CONSOLIDATED BATCH PRINT TEMPLATE */}
              {activeReceiptType === 'batch' && (
                <>
                  <div className="receipt-meta">
                    <div className="meta-row"><span>Batch ID: <strong>#{activeReceiptData.batch.id}</strong></span><span>Drop-off: {activeReceiptData.batch.dropOffDate}</span></div>
                    <div className="meta-row"><span>Partner Garage: <strong>{activeReceiptData.batch.partnerGarageName}</strong></span><span>Mob: {activeReceiptData.batch.partnerMobile}</span></div>
                  </div>
                  <div className="receipt-divider">---------------------------------------------</div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px' }}>ITEMIZED VEHICLE BREAKDOWN:</div>
                  <table className="receipt-table">
                    <thead>
                      <tr><th className="align-left">Vehicle Details</th><th className="align-right">Amt (₹)</th></tr>
                    </thead>
                    <tbody>
                      {(activeReceiptData.batch.vehicles || []).map((v, i) => {
                        let vSum = 0;
                        (v.services || []).forEach(s => vSum += s.amount);
                        return (
                          <tr key={i}>
                            <td className="align-left">{v.vehicleName} ({v.vehicleNumber}) - {v.services?.length || 0} Serv</td>
                            <td className="align-right">{vSum.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="receipt-divider">---------------------------------------------</div>
                  <div className="receipt-totals">
                    <div className="total-row"><span>Total Billed:</span><span>₹{activeReceiptData.fin.totalBilled.toLocaleString('en-IN')}</span></div>
                    <div className="total-row"><span>Total Paid Installments:</span><span>-₹{activeReceiptData.fin.totalPaid.toLocaleString('en-IN')}</span></div>
                    <div className="total-row grand-total"><span>NET BALANCE DUE:</span><span>₹{activeReceiptData.fin.balanceDue.toLocaleString('en-IN')}</span></div>
                  </div>
                </>
              )}

              <div className="receipt-divider">---------------------------------------------</div>
              <div className="receipt-footer">
                <p>*** Thank You For Your Partnership ***</p>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="modal-actions-bar">
              <button
                className="btn-whatsapp-large"
                onClick={() => sendWhatsAppReceipt(activeReceiptType, activeReceiptData)}
              >
                <Send size={18} />
                <span>Send via WhatsApp</span>
              </button>

              <button
                className="btn-print-large"
                onClick={() => window.print()}
              >
                <Printer size={18} />
                <span>Print Thermal Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
