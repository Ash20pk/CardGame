import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import BattleGame from './BattleGame';
import useWallet from '../components/ConnectWallet';
import CardBattleGame from '../artifacts/CardBattleGame.json';
import { ethers } from 'ethers'

const BattleArea = () => {
  const { battleId } = useParams();
  const [battleData, setBattleData] = useState(null);
  const { account, signer } = useWallet();

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
    await contract.resolveBattle(
      battleId,
      battleData.player2.address,
      battleData.player1.tokenId,
      battleData.player2.tokenId,
      winner,
      expGained,
      Math.floor(expGained / 2),
      // Add signature parameters here
    );

    // Update battle status in localStorage
    const battleData = JSON.parse(localStorage.getItem(`battle_${battleId}`));
    battleData.status = 'completed';
    battleData.winner = winner;
    battleData.expGained = expGained;
    localStorage.setItem(`battle_${battleId}`, JSON.stringify(battleData));

    // Navigate to result page or update UI
    // navigation('/battle-result', { state: { battleId } });
  };

  if (!battleData) return <Text>Loading...</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Heading>Battle Arena</Heading>
      <Text>{`Battle ID: ${battleId}`}</Text>
      <Text>{`${battleData.player1.name} vs Computer`}</Text>
      <Box borderWidth={1} borderRadius="lg" overflow="hidden" p={4}>
        <BattleGame
          battleId={battleId}
          player1={battleData.player1}
          player2={battleData.player2}
          isComputerOpponent={true}
          onBattleEnd={handleBattleEnd}
        />
      </Box>
    </VStack>
  );
};

export default BattleArea;