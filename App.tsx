import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import About from './components/About';
import CreateChallenge from './components/CreateChallenge';
import MyChallenges from './components/MyChallenges';
import Profile from './components/Profile';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-habitica-darker font-sans">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/create" element={<CreateChallenge />} />
            <Route path="/challenges" element={<MyChallenges />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
