import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CadastralViewerPage } from './pages/CadastralViewerPage';
import { PropertyExplorerPage } from './pages/PropertyExplorerPage';
import { FloorExplorerPage } from './pages/FloorExplorerPage';
import { UndergroundPage } from './pages/UndergroundPage';
import { ValidationPage } from './pages/ValidationPage';
import { ULPINGeneratorPage } from './pages/ULPINGeneratorPage';
import { PropertyPassportPage } from './pages/PropertyPassportPage';
import { DataImportPage } from './pages/DataImportPage';
import { AssistantPage } from './pages/AssistantPage';
import { AuditPage } from './pages/AuditPage';
import { AboutPage } from './pages/AboutPage';
import { VerifyPage } from './pages/VerifyPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public standalone verification route */}
        <Route path="/verify/:ulpin" element={<VerifyPage />} />

        {/* Main Application Routes inside Standard Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/viewer3d" element={<CadastralViewerPage />} />
          <Route path="/properties" element={<PropertyExplorerPage />} />
          <Route path="/floors" element={<FloorExplorerPage />} />
          <Route path="/underground" element={<UndergroundPage />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/generator" element={<ULPINGeneratorPage />} />
          <Route path="/passport/:ulpin" element={<PropertyPassportPage />} />
          <Route path="/import" element={<DataImportPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
