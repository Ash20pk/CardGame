import React, { useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import useSound from 'use-sound';
import MainLP from './pages/MainLP';
import HomePage from './pages/HomePage';
import WaitingRoom from './components/WaitingRoom';
import BattleArea from './components/BattleArea';
import useWallet from './components/ConnectWallet'; 
import bgMusic from '../public/assets/bgMusic.mp3'

function App() {
  const [play, { stop }] = useSound(bgMusic, { 
    loop: true,
    volume: 0.5 // Adjust as needed
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const isConnected = localStorage.getItem('walletConnected') === 'true';
    setIsConnected(isConnected);
    if (isConnected) {
      console.log('playing')
      play();
    } else {
      stop();
    }
    
    // Cleanup function to stop the sound when component unmounts
    return () => stop();
  }, [isConnected]);

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