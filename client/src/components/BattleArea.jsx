import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, VStack, Heading, Text, Button, Flex, Modal, ModalOverlay, ModalContent, ModalBody, Image, keyframes } from '@chakra-ui/react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import BattleGame from './BattleGame';
import useWallet from '../components/ConnectWallet';
import CardBattleGame from '../artifacts/CardBattleGame.json';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';


const BattleArea = () => {
  const { battleId } = useParams();
  const [battleData, setBattleData] = useState(null);
  const { account, signer } = useWallet();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winner, setWinner] = useState(null);
  const [expGained, setExpGained] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const gameContainerRef = useRef(null);
  const navigate = useNavigate();

  const gameContractAddress = process.env.VITE_GAME_CONTRACT;
  const contract = new ethers.Contract(gameContractAddress, CardBattleGame.abi, signer);

  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;

  useEffect(() => {
    if (isModalOpen && expGained > 0) {
      let start = 0;
      const interval = setInterval(() => {
        start += Math.ceil(expGained / 20); // Adjust the divisor to control animation speed
        if (start >= expGained) {
          clearInterval(interval);
          setCurrentXP(expGained);
        } else {
          setCurrentXP(start);
        }
      }, 30);
    }
  }, [isModalOpen, expGained]);

  useEffect(() => {
    const battleData = JSON.parse(localStorage.getItem(`battle_${battleId}`));
    if (battleData) {
      setBattleData(battleData);
    } else {
      console.error("No such battle!");
    }
  }, [battleId]);

  const handleBattleEnd = async (battleId, winnerAddress, expGained) => {
    const winner = winnerAddress === battleData.player1.address ? battleData.player1 : battleData.player2;
    setWinner(winner);
    setExpGained(expGained);
    setIsModalOpen(true);
  
    try {
      await contract.resolveBattle(battleId, winnerAddress, expGained);
      console.log("Battle resolved successfully");
    } catch (error) {
      console.error("Error resolving battle:", error);
    } finally {
      localStorage.removeItem(`battle_${battleId}`)
      localStorage.removeItem(`battleGame_${battleId}`)
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!battleData) return <Text>Loading...</Text>;

  return (
    <Box 
      ref={gameContainerRef}
      position="relative" 
      width="100%" 
      height="100vh"
      overflow="hidden"
    >
      <BattleGame
        battleId={battleId}
        player1={battleData.player1}
        player2={battleData.player2}
        isComputerOpponent={true}
        onBattleEnd={handleBattleEnd}
      />
      <Button
        position="absolute"
        top="10px"
        right="10px"
        onClick={toggleFullscreen}
        zIndex="1"
      >
        {isFullscreen ? <FaCompress /> : <FaExpand />}
      </Button>
  
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg="gray.800"
          color="white"
          borderRadius="xl"
          boxShadow="0 0 20px rgba(0,0,0,0.4)"
          p={6}
          maxW="400px"
          textAlign="center"
        >
          <ModalBody>
            <VStack spacing={6}>
              <Heading
                fontSize="4xl"
                fontWeight="extrabold"
                color="yellow.400"
                animation={`${fadeIn} 0.5s ease-out`}
              >
                Battle Victory!
              </Heading>
              <Box 
                width="200px" 
                height="200px" 
                borderRadius="full"
                overflow="hidden"
                boxShadow="0 0 20px rgba(255,255,0,0.5)"
                animation={`${pulse} 2s infinite`}
              >
                <Image 
                  src={winner?.image} 
                  alt={winner?.name} 
                  objectFit="auto"
                  width="100%"
                  height="100%"
                  transform="translate(51%, 50%) scale(2.6)"
                />
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="green.300">
                {winner?.name} Wins!
              </Text>
              <Box>
                <Text fontSize="xl" mb={2}>Experience Gained:</Text>
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  color="cyan.300"
                  textShadow="0 0 5px cyan"
                >
                  {currentXP} XP
                </Text>
              </Box>
              <Button
                colorScheme="yellow"
                size="lg"
                onClick={() => {setIsModalOpen(false), navigate('/home');}}
                _hover={{ bg: "yellow.500" }}
                transition="all 0.2s"
              >
                Continue
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default BattleArea;