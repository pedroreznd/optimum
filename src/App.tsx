import { Navigate, Route, Routes } from 'react-router-dom';
import StocksDashboard from '@/pages/StocksDashboard';
import CryptoDashboard from '@/pages/CryptoDashboard';
import OfflinePage from '@/pages/OfflinePage';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<StocksDashboard />} />
      <Route path="/crypto" element={<CryptoDashboard />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
