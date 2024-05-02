import Module from '@Module';
import { shallowRef } from 'vue';
import { VueAppTaskbar } from './classes/VueAppTaskbar.mjs';

import './hooks.mjs';

// Import all Systems
import './systems/dnd5e.mjs';
import './systems/dsa5.mjs';


Hooks.on('init', async () => {
	game.modules.get(Module.id).api = {
		components: shallowRef({}),
		players: {
			async getCharacterInfo(character) {
				return character?.name ?? ``;
			}
		}
	};

	// Let Modules hook into the API
	Hooks.callAll(`${Module.id}.Init`, game.modules.get(Module.id).api);
});

Hooks.once('ready', async () => {
	window.ViteTaskbar = await new VueAppTaskbar().render(true);
	Hooks.callAll(`${Module.id}.Ready`, ViteTaskbar);
});