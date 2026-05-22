import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Board from './pages/Board';
import Roadmap from './pages/Roadmap';
import Changelog from './pages/Changelog';
import FeatureDetail from './pages/FeatureDetail';
import HunterProfile from './pages/HunterProfile';
import AdminWealth from './pages/AdminWealth';
import Portfolio from './pages/Portfolio';
import WhaleAlert from './components/WhaleAlert';
import DividendAlert from './components/DividendAlert';
import NewsTicker from './components/NewsTicker';
import UserProfile from './components/UserProfile';
import Foundry from './pages/Foundry';
import Pricing from './pages/Pricing';
import LuxuryStore from './pages/LuxuryStore';
import Agency from './pages/Agency';
import VCPitch from './pages/VCPitch';
import ICO from './pages/ICO';
import CrashGame from './pages/CrashGame';
import Empire from './pages/Empire';

function App() {
  return (
    <>
    <NewsTicker />
    <WhaleAlert />
    <DividendAlert />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Board />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="feature/:id" element={<FeatureDetail />} />
        <Route path="hunter" element={<HunterProfile />} />
        <Route path="admin/wealth" element={<AdminWealth />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="foundry" element={<Foundry />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="luxury" element={<LuxuryStore />} />
        <Route path="agency" element={<Agency />} />
        <Route path="pitch" element={<VCPitch />} />
        <Route path="ico" element={<ICO />} />
        <Route path="crash" element={<CrashGame />} />
        <Route path="empire" element={<Empire />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
