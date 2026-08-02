import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './context/ProtectedRoute.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { InvoicesPage } from './pages/InvoicesPage.jsx';
import { InvoiceCreatePage } from './pages/InvoiceCreatePage.jsx';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage.jsx';
import { PartiesPage } from './pages/PartiesPage.jsx';
import { PartyDetailPage } from './pages/PartyDetailPage.jsx';
import { ItemsPage } from './pages/ItemsPage.jsx';
import { FactoriesPage } from './pages/FactoriesPage.jsx';
import { PaymentsPage } from './pages/PaymentsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard & App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/invoices/create" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/invoices/create" element={<InvoiceCreatePage />} />
                  <Route path="/invoices/new" element={<Navigate to="/invoices/create" replace />} />
                  <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="/parties" element={<PartiesPage />} />
                  <Route path="/parties/:id" element={<PartyDetailPage />} />
                  <Route path="/items" element={<ItemsPage />} />
                  <Route path="/factories" element={<FactoriesPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/invoices/create" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
