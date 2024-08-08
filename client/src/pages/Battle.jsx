import React from 'react';
import { useParams } from 'react-router-dom';
import { VStack, Text } from '@chakra-ui/react';
import BattleArena from '../components/BattleArena';

function Battle() {
  const { battleName } = useParams();

  return (
    <VStack spacing={8} align="stretch" p={8}>
      <Text fontSize="2xl" fontWeight="bold">Battle: {battleName}</Text>
      <BattleArena battleName={battleName} />
    </VStack>
  );
}

export default Battle;