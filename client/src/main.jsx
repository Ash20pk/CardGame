import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import useSound from 'use-sound';
import App from './App.jsx';
import './index.css';

const Root = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [play, { stop }] = useSound('/assets/background-music.mp3', { 
    loop: true,
    volume: 0.5 // Adjust this value as needed
  });

  useEffect(() => {
    const checkWalletConnection = () => {
      const walletConnected = localStorage.getItem('walletConnected') === 'true';
      setIsWalletConnected(walletConnected);
      if (walletConnected) {
        play();
      } else {
        stop();
      }
    };

    checkWalletConnection();

    // Set up an interval to check the localStorage value periodically
    const intervalId = setInterval(checkWalletConnection, 1000);

    // Clean up function
    return () => {
      clearInterval(intervalId);
      stop();
    };
  }, [play, stop]);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);