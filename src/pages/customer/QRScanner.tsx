import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export default function QRScanner() {
  const [tableNo, setTableNo] = useState('');
  const navigate = useNavigate();
  const setTable = useStore(state => state.setTable);

  const handleEnter = () => {
    if (tableNo.trim()) {
      setTable(tableNo.trim());
      navigate('/menu');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }}>Welcome to AI-SMARTSERVE</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Scan QR code on your table or enter table number below.</p>
      
      <div style={{ padding: '2rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '2px dashed var(--accent-secondary)' }}>
        [ QR Scanner Mock ]
      </div>

      <div className="input-group">
        <input 
          type="text" 
          placeholder="Table Number (e.g. T01)" 
          value={tableNo} 
          onChange={e => setTableNo(e.target.value)} 
        />
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleEnter}>
        Enter Menu
      </button>
    </div>
  );
}
