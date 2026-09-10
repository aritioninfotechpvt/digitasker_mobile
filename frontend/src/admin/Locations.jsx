import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { MapPinned, Store, Upload, Plus, Search, Navigation, FileSpreadsheet, Download, X } from 'lucide-react';
import { stores as initialStores } from '../data/dummy';
import { showSuccess, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';

export default function Locations() {
  const [storeList, setStoreList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('tasks');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    city: 'Chandigarh',
    code: '',
    lat: '30.7398',
    lng: '76.7827',
    tasks: 10
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newStore.name || !newStore.code) {
      showToast('Please provide store name and unique store code.', 'error');
      return;
    }

    setStoreList([newStore, ...storeList]);
    setShowAddModal(false);
    setNewStore({ name: '', address: '', city: 'Chandigarh', code: '', lat: '30.7398', lng: '76.7827', tasks: 10 });
    showSuccess('Store Registered! 📍', `${newStore.name} added to location master.`);
  };

  const handleExportCSV = () => {
    const headers = ['Store Code', 'Store Name', 'Address', 'City', 'Latitude', 'Longitude', 'Active Tasks'];
    const rows = filteredStores.map(s => [
      s.code,
      `"${s.name}"`,
      `"${s.address}"`,
      `"${s.city}"`,
      s.lat,
      s.lng,
      s.tasks
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `stores_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showSuccess('Export Complete!', 'Downloaded location master CSV.');
  };

  const filteredStores = useMemo(() => {
    let result = storeList.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = cityFilter === 'All' || s.city === cityFilter;

      return matchesSearch && matchesCity;
    });

    result.sort((a, b) => {
      if (sortBy === 'tasks') return b.tasks - a.tasks;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [storeList, searchQuery, cityFilter, sortBy]);

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [filteredStores, currentPage, pageSize]);

  return (
    <AppLayout role='admin' title='Location & Store Master'>
      <div className='between pageAction' style={{ marginBottom: '20px' }}>
        <div>
          <h2>Physical Outlets & Radius Master</h2>
          <p className='muted'>Reusable location directory for campaigns, radius targeting and bulk task generation.</p>
        </div>
        <div className='row gap8'>
          <button className='ghost' onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className='primary' onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Store
          </button>
        </div>
      </div>

      <div className='statsGrid' style={{ marginBottom: '20px' }}>
        <Stat label='Stores Mapped' value={storeList.length.toString()} icon={<Store />} />
        <Stat label='Active Cities' value={Array.from(new Set(storeList.map(s => s.city))).length.toString()} icon={<MapPinned />} />
        <Stat label='Mapped GPS' value={storeList.filter(s => s.lat && s.lng).length.toString()} icon={<Navigation />} />
        <Stat label='Import Templates' value={storeList.length > 0 ? '4' : '0'} icon={<FileSpreadsheet />} />
      </div>

      <div className='twoCol' style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        <Card style={{ padding: '20px' }}>
          <div className='tableToolbar' style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div className='searchBox' style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 10px' }}>
              <Search size={16} color="#64748b" />
              <input 
                placeholder='Search store, code, city...' 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ border: 0, outline: 'none', width: '100%', padding: '6px 0', fontSize: '13px' }}
              />
            </div>

            <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px' }}>
              <option value="All">All Cities</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Zirakpur">Zirakpur</option>
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12.5px' }}>
              <option value="tasks">Sort: Most Tasks</option>
              <option value="name">Sort: Store Name</option>
            </select>
          </div>

          <div className='storeTable'>
            <div className='dataHead' style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr 1fr 0.6fr 0.5fr', padding: '10px 12px', background: '#f8fafc', fontWeight: 700, fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
              <span>Store</span>
              <span>City</span>
              <span>Code</span>
              <span>Coordinates</span>
              <span>Status</span>
              <span>Tasks</span>
            </div>

            {paginatedStores.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No stores mapped yet. Click + Add Store to add your first outlet.</div>
            ) : (
              paginatedStores.map(s => (
                <div className='dataRow' key={s.code} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr 1fr 0.6fr 0.5fr', gap: '8px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '12.5px' }}>
                  <div>
                    <b style={{ color: '#0f172a', display: 'block' }}>{s.name}</b>
                    <small className='muted block' style={{ fontSize: '11px', color: '#64748b' }}>{s.address}</small>
                  </div>
                  <span>{s.city}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.code}</span>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>{s.lat}, {s.lng}</small>
                  <div>
                    <Badge tone='green'>Mapped</Badge>
                  </div>
                  <b style={{ color: '#0066ff' }}>{s.tasks}</b>
                </div>
              ))
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(filteredStores.length / pageSize)}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredStores.length}
          />
        </Card>

        <Card className='stickyCard' style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px' }}>Map & Geo-Cluster Preview</h3>
          <div className='mapMock' style={{ height: '180px', background: '#e0f2fe', borderRadius: '12px', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '20px', border: '1px border #93c5fd', marginBottom: '16px' }}>
            <MapPinned size={38} color="#0284c7" />
            <b style={{ color: '#0369a1', marginTop: '6px' }}>Selected locations</b>
            <span className='muted' style={{ fontSize: '12px', color: '#0284c7' }}>
              {storeList.length > 0 ? `${storeList[0].city} Cluster (${storeList.length} outlets)` : 'No store outlets mapped'}
            </span>
          </div>

          <h3 style={{ margin: '0 0 10px' }}>Region Hierarchy</h3>
          {storeList.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No store outlet hierarchy mapped yet.</p>
          ) : (
            <div className='treeList' style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#334155' }}>
              <b>India</b>
              <span style={{ paddingLeft: '12px' }}>↳ {storeList[0].city} Region</span>
              <span style={{ paddingLeft: '24px' }}>↳ {storeList[0].name}</span>
              <span style={{ paddingLeft: '36px', color: '#0066ff', fontWeight: 600 }}>↳ Store {storeList[0].code}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div className='between' style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Register Outlet / Store</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Store Name
                <input type="text" placeholder="e.g. Croma Sector 35" value={newStore.name} onChange={e => setNewStore({ ...newStore, name: e.target.value })} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </label>

              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Unique Store Code
                <input type="text" placeholder="e.g. CHD-CRM35" value={newStore.code} onChange={e => setNewStore({ ...newStore, code: e.target.value })} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </label>

              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Full Address
                <input type="text" placeholder="SCO 44, Sector 35C" value={newStore.address} onChange={e => setNewStore({ ...newStore, address: e.target.value })} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  City
                  <input type="text" value={newStore.city} onChange={e => setNewStore({ ...newStore, city: e.target.value })} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </label>
                <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  Active Tasks Quota
                  <input type="number" value={newStore.tasks} onChange={e => setNewStore({ ...newStore, tasks: Number(e.target.value) })} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
