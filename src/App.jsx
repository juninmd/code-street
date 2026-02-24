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
      </Route>
    </Routes>
    </>
  );
}

export default App;
