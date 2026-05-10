import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AnalyzeProduct from './pages/AnalyzeProduct';
import Reviews from './pages/Reviews';
import ModelDemo from './pages/ModelDemo';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyze" element={<AnalyzeProduct />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/model" element={<ModelDemo />} />
        <Route path="/insights" element={<AIInsights />} />
        <Route path="/settings" element={<Settings />} />
        {/* Redirect unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
