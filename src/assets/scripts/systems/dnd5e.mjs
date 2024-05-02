import Module from '@Module';

// If the System is D&D5e
Hooks.on(`${Module.id}.Init`, async (api) => {
	if (game.system.id === "dnd5e") {
		api.players.getCharacterInfo = async (character) => {
			const CharacterName = character.name;
			const CharacterClasses = Object.values(character?.classes ?? {}).map(c => `${c.name} ${c.system.levels}`).join(' / ')
			const CharacterAC = character.system.attributes.ac.value;
			const CharacterHP = character.system.attributes.hp.value;
			const CharacterMaxHP = character.system.attributes.hp.max;
			const CharacterTempHP = character.system.attributes.hp.temp;

			let HP = `${CharacterHP}/${CharacterMaxHP}`;
			if (CharacterTempHP) HP = `${HP} + ${CharacterTempHP}`;

			const line1 = [CharacterName, CharacterClasses].filter(Boolean).join(' | ');
			const line2 = [`HP: ${HP}`, `AC: ${CharacterAC}`].filter(Boolean).join(' | ');

			return `${line1}<br/>${line2}`;
		};
	}
});