import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, VStack, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import BattleGame from './BattleGame';
import useWallet from '../components/ConnectWallet';
import CardBattleGame from '../artifacts/CardBattleGame.json';
import { ethers } from 'ethers'

const BattleArea = () => {
  const { battleId } = useParams();
  const [battleData, setBattleData] = useState(null);
  const { account, signer } = useWallet();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gameContractAddress = process.env.VITE_GAME_CONTRACT;
  const contract = new ethers.Contract(gameContractAddress, CardBattleGame.abi, signer);

  useEffect(() => {
    const battleData = JSON.parse(localStorage.getItem(`battle_${battleId}`));
    if (battleData) {
      setBattleData(battleData);
    } else {
      console.error("No such battle!");
    }
  }, [battleId]);

  const handleBattleEnd = async (battleId, winner, expGained) => {
    // ... (keep your existing handleBattleEnd logic)
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!battleData) return <Text>Loading...</Text>;

  return (
    <VStack spacing={4} align="stretch" h="100vh">
      <Flex justify="space-between" align="center" p={4}>
        <VStack align="start" spacing={2}>
          <Heading>Battle Arena</Heading>
          <Text>{`Battle ID: ${battleId}`}</Text>
          <Text>{`${battleData.player1.name} vs Computer`}</Text>
        </VStack>
        <Button leftIcon={isFullscreen ? <FaCompress /> : <FaExpand />} onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </Flex>
      <Box flex={1} display="flex" justifyContent="center" alignItems="center">
      <Box 
          width={["100%", "80%", "70%", "60%"]} 
          height={["100%", "80vh"]} 
          borderWidth={1} 
          borderRadius="lg" 
          overflow="hidden"
        >
          <BattleGame
            battleId={battleId}
            player1={battleData.player1}
            player2={battleData.player2}
            isComputerOpponent={true}
            onBattleEnd={handleBattleEnd}
          />
        </Box>
      </Box>
    </VStack>
  );
};

export default BattleArea;