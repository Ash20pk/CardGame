import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const BattleGame = ({ battleId, player1, player2, isComputerOpponent, onBattleEnd }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: {
        preload: preload,
        create: create,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);

    let gameState;
    let player1Card, player2Card;
    let actionButtons;
    let turnText, actionLogText;
    let animationLayer;

    const classes = {
        Barbarian: {
          name: 'Barbarian',
          powers: [
            { name: 'Mighty Swing', description: 'Deal 12-18 damage', manaCost: 1, minDamage: 12, maxDamage: 18, type: 'attack' },
            { name: 'Battle Cry', description: 'Gain 5-10 shield and increase next attack damage by 5', manaCost: 2, minShield: 5, maxShield: 10, nextAttackBonus: 5, type: 'defend' },
            { name: 'Berserker Rage', description: 'Deal 25-35 damage, take 10 damage', manaCost: 3, minDamage: 25, maxDamage: 35, selfDamage: 10, type: 'special', cooldown: 2 }
          ]
        },
        Knight: {
          name: 'Knight',
          powers: [
            { name: 'Sword Slash', description: 'Deal 10-15 damage', manaCost: 1, minDamage: 10, maxDamage: 15, type: 'attack' },
            { name: 'Shield Wall', description: 'Gain 8-12 shield', manaCost: 2, minShield: 8, maxShield: 12, type: 'defend' },
            { name: 'Righteous Strike', description: 'Deal 20-30 damage and gain 5-10 shield', manaCost: 4, minDamage: 20, maxDamage: 30, minShield: 5, maxShield: 10, type: 'special', cooldown: 3 }
          ]
        },
        Ranger: {
          name: 'Ranger',
          powers: [
            { name: 'Quick Shot', description: 'Deal 8-14 damage, gain 1 mana', manaCost: 1, minDamage: 8, maxDamage: 14, manaGain: 1, type: 'attack' },
            { name: 'Evasive Maneuver', description: 'Gain 4-8 shield and 2 mana', manaCost: 1, minShield: 4, maxShield: 8, manaGain: 2, type: 'defend' },
            { name: 'Precise Shot', description: 'Deal 22-32 damage, ignore 50% of enemy shield', manaCost: 3, minDamage: 22, maxDamage: 32, shieldPenetration: 0.5, type: 'special', cooldown: 2 }
          ]
        },
        Rogue: {
          name: 'Rogue',
          powers: [
            { name: 'Backstab', description: 'Deal 9-15 damage, gain 1 mana', manaCost: 1, minDamage: 9, maxDamage: 15, manaGain: 1, type: 'attack' },
            { name: 'Smoke Screen', description: 'Gain 5-9 shield, next attack deals +4 damage', manaCost: 1, minShield: 5, maxShield: 9, nextAttackBonus: 4, type: 'defend' },
            { name: 'Assassinate', description: 'Deal 20-30 damage, ignore shield', manaCost: 4, minDamage: 20, maxDamage: 30, ignoreShield: true, type: 'special', cooldown: 3 }
          ]
        },
        Wizard: {
          name: 'Wizard',
          powers: [
            { name: 'Arcane Bolt', description: 'Deal 9-13 damage', manaCost: 1, minDamage: 9, maxDamage: 13, type: 'attack' },
            { name: 'Mana Shield', description: 'Gain 6-10 shield and 2 mana', manaCost: 2, minShield: 6, maxShield: 10, manaGain: 2, type: 'defend' },
            { name: 'Fireball', description: 'Deal 28-38 damage', manaCost: 5, minDamage: 28, maxDamage: 38, type: 'special', cooldown: 3 }
          ]
        },
        Cleric: {
          name: 'Cleric',
          powers: [
            { name: 'Holy Smite', description: 'Deal 8-12 damage, heal 2-4 HP', manaCost: 1, minDamage: 8, maxDamage: 12, minHeal: 2, maxHeal: 4, type: 'attack' },
            { name: 'Divine Protection', description: 'Gain 7-11 shield, heal 3-5 HP', manaCost: 2, minShield: 7, maxShield: 11, minHeal: 3, maxHeal: 5, type: 'defend' },
            { name: 'Blessing of Light', description: 'Deal 15-25 damage, heal 10-15 HP', manaCost: 4, minDamage: 15, maxDamage: 25, minHeal: 10, maxHeal: 15, type: 'special', cooldown: 3 }
          ]
        }
      };
  
      function preload() {
        this.load.image('background', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/background.jpg');
        this.load.image('card_frame', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/card.png');
        console.log(player1.image, player2.image);
        this.load.image('player1', player1.image);
        this.load.image('player2', player2.image);
        this.load.spritesheet('attack_effect', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/attack_spritesheet.jpg', {
          frameWidth: 70,
          frameHeight: 128
        });
        this.load.image('defend_effect', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/attack_spritesheet.jpg');
        this.load.image('special_effect', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/attack_spritesheet.jpg');
      }
  
      function create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const scaleRatio = Math.min(width / 1024, height / 768);
  
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
  
        createAnimations(this);
  
        gameState = loadGameState() || initializeGameState();
  
        player1Card = createPlayerCard(this, width * 0.5, height * 0.3, gameState.player1, 'top', scaleRatio);
        player2Card = createPlayerCard(this, width * 0.5, height * 0.75, gameState.player2, 'bottom', scaleRatio);
  
        turnText = createTurnText(this, width, height, scaleRatio);
        actionLogText = createActionLogText(this, width, height, scaleRatio);
        actionButtons = createActionButtons(this, width, height, scaleRatio);
  
        animationLayer = this.add.container(0, 0);
  
        updateUI();
        saveGameState();
  
        this.scale.on('resize', (gameSize) => resize(this, gameSize));
      }
  
      function createAnimations(scene) {
        scene.anims.create({
          key: 'attack_top',
          frames: scene.anims.generateFrameNumbers('attack_effect', { start: 0, end: 3, first: 0 }),
          frameRate: 10,
          repeat: 0
        });
  
        scene.anims.create({
          key: 'attack_bottom',
          frames: scene.anims.generateFrameNumbers('attack_effect', { start: 4, end: 7, first: 4 }),
          frameRate: 10,
          repeat: 0
        });
      }
  
      function initializeGameState() {
        console.log(player1, player2)
        return {
          player1: {
            ...player1,
            health: player1.health,
            mana: player1.mana,
            shield: 0,
            class: classes[player1.class],
            cooldowns: (classes[player1.class])?.powers.map(() => 0),
          },
          player2: {
            ...player2,
            health: player2.health,
            mana: player2.mana,
            shield: 0,
            class: classes[player2.class],
            cooldowns: (classes[player2.class])?.powers.map(() => 0),
            name: isComputerOpponent ? "Computer" : player2.name
          },
          currentTurn: 1,
          turnPlayer: 'player1',
          actionLog: [],
          roundNumber: 1,
        };
      }

      function createPlayerCard(scene, x, y, player, position, scaleRatio) {
        const card = scene.add.container(x, y);
        const frame = scene.add.image(0, 0, 'card_frame').setScale(0.5 * scaleRatio);
        
        // Load player image dynamically
        scene.load.once('complete', () => {
          const portrait = scene.add.image(0, -30 * scaleRatio, `player_${player.name}`).setScale(0.15 * scaleRatio);
          card.add(portrait);
        });
        scene.load.image(`player_${player.name}`, player.image);
        scene.load.start();
      
        const nameText = scene.add.text(0, 40 * scaleRatio, player.name, { 
          fontSize: `${16 * scaleRatio}px`, 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 2 * scaleRatio
        }).setOrigin(0.5);
      
        const classText = scene.add.text(0, 60 * scaleRatio, player.class.name, { 
          fontSize: `${14 * scaleRatio}px`, 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 2 * scaleRatio
        }).setOrigin(0.5);
      
        // Create bars for health, mana, and shield
        const barWidth = 80 * scaleRatio;
        const barHeight = 10 * scaleRatio;
        const barSpacing = 15 * scaleRatio;
        const barY = position === 'top' ? 90 * scaleRatio : -90 * scaleRatio;
      
        // Health bar
        const healthBar = scene.add.rectangle(-40 * scaleRatio, barY, barWidth, barHeight, 0xff0000).setOrigin(0, 0.5);
        const healthText = scene.add.text(0, barY, 'HP: 100', { 
          fontSize: `${10 * scaleRatio}px`, 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 1 * scaleRatio
        }).setOrigin(0.5, 0.5);
      
        // Mana bar
        const manaBar = scene.add.rectangle(-40 * scaleRatio, barY + barSpacing, barWidth, barHeight, 0x0000ff).setOrigin(0, 0.5);
        const manaText = scene.add.text(0, barY + barSpacing, 'MP: 100', { 
          fontSize: `${10 * scaleRatio}px`, 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 1 * scaleRatio
        }).setOrigin(0.5, 0.5);
      
        // Shield bar
        const shieldBar = scene.add.rectangle(-40 * scaleRatio, barY + barSpacing * 2, barWidth, barHeight, 0xffff00).setOrigin(0, 0.5);
        const shieldText = scene.add.text(0, barY + barSpacing * 2, 'Shield: 0', { 
          fontSize: `${10 * scaleRatio}px`, 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 1 * scaleRatio
        }).setOrigin(0.5, 0.5);
      
        // Power bar (Dota style)
        const powerBarY = position === 'top' ? 130 * scaleRatio : -130 * scaleRatio;
        const powerBar = scene.add.container(0, powerBarY);
        
        player.class.powers.forEach((power, index) => {
          const powerIcon = scene.add.rectangle((index - 1) * 30 * scaleRatio, 0, 25 * scaleRatio, 25 * scaleRatio, 0x4b0082);
          const powerText = scene.add.text((index - 1) * 30 * scaleRatio, 0, power.name[0], {
            fontSize: `${12 * scaleRatio}px`,
            fill: '#fff',
          }).setOrigin(0.5);
          powerBar.add([powerIcon, powerText]);
        });
      
        card.add([frame, nameText, classText, healthBar, manaBar, shieldBar, healthText, manaText, shieldText, powerBar]);
        card.healthBar = healthBar;
        card.manaBar = manaBar;
        card.shieldBar = shieldBar;
        card.healthText = healthText;
        card.manaText = manaText;
        card.shieldText = shieldText;
      
        return card;
      }

    function createTurnText(scene, width, height, scaleRatio) {
      return scene.add.text(width / 2, height * 0.1, '', {
        fontSize: `${48 * scaleRatio}px`,
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6 * scaleRatio
      }).setOrigin(0.5);
    }

    function createActionLogText(scene, width, height, scaleRatio) {
      return scene.add.text(width / 2, height * 0.9, '', {
        fontSize: `${24 * scaleRatio}px`,
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4 * scaleRatio,
        align: 'center'
      }).setOrigin(0.5);
    }

    function createActionButtons(scene, width, height, scaleRatio) {
      const currentPlayer = gameState[gameState.turnPlayer];
      console.log(currentPlayer);
      const playerClass = currentPlayer.class; 
    
      return playerClass.powers.map((power, index) => {
        const button = scene.add.text(
          width * ((index + 1) / (playerClass.powers.length + 1)),
          height * 0.95,
          power.name,
          {
            fontSize: `${20 * scaleRatio}px`,
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3 * scaleRatio,
            backgroundColor: '#4b0082',
            padding: { x: 8 * scaleRatio, y: 4 * scaleRatio }
          }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
        button.on('pointerdown', () => handleAction(index));
        return button;
      });
    }

    function resize(scene, gameSize) {
      const width = gameSize.width;
      const height = gameSize.height;
      const scaleRatio = Math.min(width / 1024, height / 768);

      scene.cameras.resize(width, height);

      if (player1Card && player2Card) {
        player1Card.setPosition(width * 0.5, height * 0.2);
        player2Card.setPosition(width * 0.5, height * 0.8);
      }

      if (turnText) {
        turnText.setPosition(width / 2, height * 0.1).setFontSize(`${48 * scaleRatio}px`);
      }

      if (actionLogText) {
        actionLogText.setPosition(width / 2, height * 0.9).setFontSize(`${24 * scaleRatio}px`);
      }

      if (actionButtons) {
        actionButtons.forEach((button, index) => {
          button.setPosition(width * (0.25 + index * 0.25), height * 0.95).setFontSize(`${24 * scaleRatio}px`);
        });
      }
    }

    function handleAction(powerIndex) {
      if (gameState.turnPlayer === 'player1') {
        const playerClass = gameState.player1.class || classes.BARBARIAN;
        executeAction(playerClass.powers[powerIndex], gameState.player1, gameState.player2, powerIndex);
      }
    }

    function executeAction(power, attacker, defender, powerIndex) {
      if (attacker.mana < power.manaCost || attacker.cooldowns[powerIndex] > 0) return;

      attacker.mana -= power.manaCost;
      attacker.cooldowns[powerIndex] = power.cooldown || 0;
      let actionResult = '';

      switch (power.type) {
        case 'attack':
          actionResult = handleAttack(power, attacker, defender);
          break;
        case 'defend':
          actionResult = handleDefend(power, attacker);
          break;
        case 'special':
          actionResult = handleSpecial(power, attacker, defender);
          break;
      }

      gameState.currentTurn++;
      gameState.turnPlayer = attacker === gameState.player1 ? 'player2' : 'player1';
      gameState.actionLog.unshift(actionResult);
      if (gameState.actionLog.length > 3) gameState.actionLog.pop();

      reduceCooldowns();

      if (defender.health <= 0) {
        onBattleEnd(battleId, attacker === gameState.player1 ? player1.address : player2.address, 100);
      } else {
        updateUI();
        saveGameState();

        if (gameState.turnPlayer === 'player2' && isComputerOpponent) {
          setTimeout(computerTurn, 1500);
        }
      }
    }

    function handleAttack(power, attacker, defender) {
      const damage = calculateDamage(power, attacker);
      const actualDamage = applyDamage(damage, defender, power.ignoreShield);
      let actionResult = `${attacker.name} uses ${power.name} for ${actualDamage} damage!`;
      
      if (power.manaGain) {
        attacker.mana = Math.min(100, attacker.mana + power.manaGain);
        actionResult += ` Gained ${power.manaGain} mana.`;
      }
      if (power.minHeal) {
        const healAmount = Phaser.Math.Between(power.minHeal, power.maxHeal);
        attacker.health = Math.min(100, attacker.health + healAmount);
        actionResult += ` Healed for ${healAmount} HP.`;
      }
      
      return actionResult;
    }

    function handleDefend(power, attacker) {
      const shield = Phaser.Math.Between(power.minShield, power.maxShield);
      attacker.shield += shield;
      let actionResult = `${attacker.name} uses ${power.name} and gains ${shield} shield!`;
      
      if (power.manaGain) {
        attacker.mana = Math.min(100, attacker.mana + power.manaGain);
        actionResult += ` Gained ${power.manaGain} mana.`;
      }
      if (power.nextAttackBonus) {
        attacker.nextAttackBonus = (attacker.nextAttackBonus || 0) + power.nextAttackBonus;
        actionResult += ` Next attack will deal +${power.nextAttackBonus} damage.`;
      }
      if (power.minHeal) {
        const healAmount = Phaser.Math.Between(power.minHeal, power.maxHeal);
        attacker.health = Math.min(100, attacker.health + healAmount);
        actionResult += ` Healed for ${healAmount} HP.`;
      }
      
      return actionResult;
    }

    function handleSpecial(power, attacker, defender) {
      const damage = calculateDamage(power, attacker);
      const actualDamage = applyDamage(damage, defender, power.ignoreShield, power.shieldPenetration);
      let actionResult = `${attacker.name} uses ${power.name} for ${actualDamage} damage!`;
      
      if (power.selfDamage) {
        attacker.health = Math.max(0, attacker.health - power.selfDamage);
        actionResult += ` ${attacker.name} takes ${power.selfDamage} self-damage.`;
      }
      if (power.minHeal) {
        const healAmount = Phaser.Math.Between(power.minHeal, power.maxHeal);
        attacker.health = Math.min(100, attacker.health + healAmount);
        actionResult += ` Healed for ${healAmount} HP.`;
      }
      
      return actionResult;
    }

    function calculateDamage(power, attacker) {
      return Phaser.Math.Between(power.minDamage, power.maxDamage) + (attacker.nextAttackBonus || 0);
    }

    function applyDamage(damage, defender, ignoreShield, shieldPenetration = 0) {
      const effectiveShield = ignoreShield ? 0 : defender.shield * (1 - shieldPenetration);
      const actualDamage = Math.max(0, damage - effectiveShield);
      defender.health = Math.max(0, defender.health - actualDamage);
      defender.shield = Math.max(0, defender.shield - (ignoreShield ? 0 : damage));
      return actualDamage;
    }

    function reduceCooldowns() {
      gameState.player1.cooldowns = gameState.player1.cooldowns.map(cd => Math.max(0, cd - 1));
      gameState.player2.cooldowns = gameState.player2.cooldowns.map(cd => Math.max(0, cd - 1));
    }

    function computerTurn() {
      const playerClass = gameState.player2.class || classes.BARBARIAN;
      const availableActions = playerClass.powers.filter((power, index) => 
        gameState.player2.mana >= power.manaCost && gameState.player2.cooldowns[index] === 0
      );
    
      if (availableActions.length === 0) {
        endTurn();
        return;
      }
    
      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      const powerIndex = playerClass.powers.indexOf(randomAction);
      executeAction(randomAction, gameState.player2, gameState.player1, powerIndex);
    }

    function endTurn() {
      gameState.turnPlayer = gameState.turnPlayer === 'player1' ? 'player2' : 'player1';
      gameState.currentTurn++;

      if (gameState.turnPlayer === 'player1') {
        gameState.roundNumber++;
      }

      replenishMana();
      updateUI();
      saveGameState();

      if (gameState.turnPlayer === 'player2' && isComputerOpponent) {
        setTimeout(computerTurn, 1500);
      }
    }

    function replenishMana() {
      gameState.player1.mana = Math.min(10, gameState.player1.mana + 1);
      gameState.player2.mana = Math.min(10, gameState.player2.mana + 1);
    }

    function updateUI() {
      updatePlayerCard(player1Card, gameState.player1);
      updatePlayerCard(player2Card, gameState.player2);
      updateTurnText();
      updateActionButtons();
      updateActionLog();
    }

    function updatePlayerCard(card, player) {
      const healthPercentage = player.health / 100;
      const manaPercentage = player.mana / 100;
      const shieldPercentage = player.shield / 100;
    
      card.healthBar.scaleX = healthPercentage;
      card.manaBar.scaleX = manaPercentage;
      card.shieldBar.scaleX = shieldPercentage;
    
      card.healthText.setText(`HP: ${player.health}`);
      card.manaText.setText(`MP: ${player.mana}`);
      card.shieldText.setText(`Shield: ${player.shield}`);
    }

    function updateTurnText() {
      turnText.setText(`${gameState[gameState.turnPlayer].name}'s Turn (Round ${gameState.roundNumber})`);
    }

    function updateActionButtons() {
      const currentPlayer = gameState[gameState.turnPlayer];
      const playerClass = currentPlayer.class || classes.BARBARIAN;
      actionButtons.forEach((button, index) => {
        const power = playerClass.powers[index];
        button.setText(`${power.name} (${power.manaCost} MP)`);
        button.setColor(currentPlayer.mana >= power.manaCost && currentPlayer.cooldowns[index] === 0 ? '#fff' : '#888');
      });
    }

    function updateActionLog() {
      actionLogText.setText(gameState.actionLog.join('\n'));
    }

    function saveGameState() {
      localStorage.setItem(`battleGame_${battleId}`, JSON.stringify(gameState));
    }

    function loadGameState() {
      const savedState = localStorage.getItem(`battleGame_${battleId}`);
      return savedState ? JSON.parse(savedState) : null;
    }

    function playAnimation(effectKey, targetCard) {
      const effect = animationLayer.scene.add.image(targetCard.x, targetCard.y, effectKey).setScale(0);
      animationLayer.add(effect);

      animationLayer.scene.tweens.add({
        targets: effect,
        scale: 1,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          effect.destroy();
        }
      });
    }

    function playAttackAnimation(sourceCard, targetCard) {
      const attackerSprite = animationLayer.scene.add.sprite(sourceCard.x, sourceCard.y, 'attack_effect')
        .setOrigin(0.5, 1)
        .setScale(2);
      
      const defenderSprite = animationLayer.scene.add.sprite(targetCard.x, targetCard.y, 'attack_effect')
        .setOrigin(0.5, 0)
        .setScale(2)
        .setFlipY(true);

      animationLayer.add(attackerSprite);
      animationLayer.add(defenderSprite);

      attackerSprite.play('attack_top');
      defenderSprite.play('attack_bottom');

      animationLayer.scene.tweens.add({
        targets: attackerSprite,
        x: (sourceCard.x + targetCard.x) / 2,
        duration: 500,
        ease: 'Power2'
      });

      animationLayer.scene.tweens.add({
        targets: defenderSprite,
        x: (sourceCard.x + targetCard.x) / 2,
        duration: 500,
        ease: 'Power2'
      });

      attackerSprite.on('animationcomplete', () => {
        attackerSprite.destroy();
      });

      defenderSprite.on('animationcomplete', () => {
        defenderSprite.destroy();
      });
    }

    return () => {
      game.destroy(true);
    };
  }, [battleId, player1, player2, isComputerOpponent, onBattleEnd]);

  return <div ref={gameRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default BattleGame;