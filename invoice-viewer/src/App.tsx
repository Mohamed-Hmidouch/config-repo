import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InvoiceListPage } from './pages/InvoiceListPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { UploadPage } from './pages/UploadPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F7F6] font-sans antialiased text-[#1A252A]">
        <Routes>
          <Route path="/" element={<InvoiceListPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
