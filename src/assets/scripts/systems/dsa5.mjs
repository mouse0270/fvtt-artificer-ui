import Module from '@Module';
import { logger as l } from "@logger";

// If the System is D&D5e
Hooks.on(`${Module.id}.Init`, async (api) => {
	if (game.system.id === "dsa5") {
		api.players.getCharacterInfo = async (character) => {
			l.log('dsa5 | getCharacterInfo |', character);
			const CharacterName = character.name;
			const LifePoints = `LP: ${character.system.status.wounds.value}/${character.system.status.wounds.max}`;
			const AstralEnergy = `AE: ${character.system.status.astralenergy.value}/${character.system.status.astralenergy.max}`;
			const KarmaEnergy = `KE: ${character.system.status.karmaenergy.value}/${character.system.status.karmaenergy.max}`;
			const Speed = `Speed: ${character.system.status.speed.max}`;

			let FatePoints = "FtP: ";
			for (let p = 0; p < character.system.status.fatePoints.max; p++) {
				if (p < character.system.status.fatePoints.value) FatePoints += "⭕";
				else FatePoints += "❌";
			}

			const line1 = `${CharacterName} | ${Speed}`;
			let line2 = `${LifePoints}`;
			if (AstralEnergy != "AE: 0/0") line2 += ` | ${AstralEnergy}`;
			if (KarmaEnergy != "KE: 0/0") line2 += ` | ${KarmaEnergy}`;
			if (FatePoints != "FtP: ") line2 += ` | ${FatePoints}`;

			return `${line1}<br/>${line2}`;
		};
	}
});