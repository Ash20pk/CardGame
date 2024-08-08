import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLP from './pages/MainLP';
import HomePage from './pages/HomePage';
import WaitingRoom from './components/WaitingRoom';
import BattleArea from './components/BattleArea';


function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLP />} />
          <Route path="/waiting-room/:battleId" element={<WaitingRoom />} />
          <Route path="/battle/:battleId" element={<BattleArea />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;