const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("card_battle_module", (m) => {

  const cardGame = m.contract("CardBattleGame", ["0xAC0a367c756AD0F01b5A14B4403aD59b49f8A12d"]);

  return { cardGame };
});
