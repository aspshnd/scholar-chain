import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import { useFreighter } from './hooks/useFreighter';

import Overview from './pages/Overview';
import Grants from './pages/Grants';
import Recipients from './pages/Recipients';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Admin from './pages/Admin';

import './styles/global.css';

export default function App() {
  const [contractId, setContractId] = useState('');
  const { publicKey, isConnected } = useFreighter();

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <Navbar contractId={contractId} />
        <main>
          <Routes>
            <Route path="/"           element={<Overview    contractId={contractId} connected={isConnected} publicKey={publicKey} />} />
            <Route path="/grants"     element={<Grants      publicKey={publicKey} />} />
            <Route path="/recipients" element={<Recipients  contractId={contractId} />} />
            <Route path="/register"   element={<Register    contractId={contractId} isConnected={isConnected} publicKey={publicKey} />} />
            <Route path="/verify"     element={<Verify      contractId={contractId} isConnected={isConnected} publicKey={publicKey} />} />
            <Route path="/admin"      element={<Admin       contractId={contractId} isConnected={isConnected} publicKey={publicKey} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}