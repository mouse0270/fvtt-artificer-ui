import Module from '@Module';
import { VueApplicationMixin } from '../libs/VueApplicationMixin.mjs';
import App from '../../../templates/App.vue';
import Taskbar from '../../../templates/Taskbar.vue';

const { ApplicationV2 } = foundry.applications.api;
export class VueAppTaskbar extends VueApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
		id: `app-${Module.id}`,
		window: {
			title: `${Module.id}.title`,
			icon: "fa-solid fa-triangle-exclamation",
			frame: false,
			positioned: false
		},
		actions: { }
	}, { inplace: false });

	static PARTS = {
		app: {
			id: "app",
			component: App
		},
		taskbar: {
			id: "taskbar",
			component: Taskbar
		}
	}
}