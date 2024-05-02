<template>
	<div class="taskbar-wrapper">
		<div class="taskbar-container">
			<div class="taskbar-item" style="position: relative;">
				<svg-icon type="mdi" :path="mdiMapLegend"></svg-icon>
				<ul :class="`taskbar-menu ${showScenes ? 'show' : 'hide'}`">
					<li v-for="scene in scenes" :key="scene.id" :data-scene-id="scene.id" :style="`background-image: url(${scene.thumb})`">
						<div class="taskbar-menu-item">
							<div class="title" :data-tooltip="localize('SCENES.View')" @click="ViewScene(scene)">
								<svg-icon v-if="scene.active" type="mdi" :path="mdiMapMarker"></svg-icon>
								{{ localize(scene.name) }}
							</div>
							<div class="actions" v-if="isGM">
								<svg-icon v-if="scene.id !== currentScene.id" :data-tooltip="localize('SCENES.Activate')" type="mdi" :path="mdiPlayCircle" @click="() => ActivateScene(scene)"></svg-icon>
								<svg-icon type="mdi" :data-tooltip="localize('SCENES.Configure')" :path="mdiCog" @click="() => ConfigureScene(scene)"></svg-icon>
								<svg-icon v-if="HasNotes(scene)" type="mdi" :data-tooltip="localize('SCENES.Notes')" :path="mdiNotebook" @click="() => SceneNotes(scene)"></svg-icon>
								<svg-icon type="mdi" :data-tooltip="localize('SCENES.Preload')" :path="mdiProgressDownload" @click="PreloadScene(scene)"></svg-icon>
								<svg-icon v-if="scene.id !== currentScene.id" :data-tooltip="localize('SCENES.ToggleNav')" type="mdi" :path="mdiEyeOff" @click="ToggleScene(scene)"></svg-icon>
								<svg-icon v-if="(scene?.contextMenuOptions?.length ?? 0) > 0" :data-tooltip="localize('MORE')" :data-scene-id="scene.id" type="mdi" :path="mdiDotsVertical" @click="() => contextMenu(scene)"></svg-icon>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import Module from '@Module';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiMapLegend, mdiMapMarker, mdiPlayCircle, mdiNotebook, mdiCog, mdiProgressDownload, mdiEyeOff, mdiDotsVertical } from '@mdi/js'
import { localize } from '../../assets/scripts/libs/VueHelpers.mjs';
import { logger as l } from '@logger';

const isGM = ref(game.user.isGM);
const showScenes = ref(false);
const currentScene = ref(canvas.scene);
const scenes = ref(game.scenes.filter(s => {
	return (s.navigation && s.visible) || s.active || s.isView;
}).sort((a, b) => a.navOrder - b.navOrder))

const updateScenes = () => {
	scenes.value = game.scenes.filter(scene => {
		const element = document.querySelector(`#navigation #scene-list li.scene[data-scene-id="${scene.id}"]`);
		scene.contextMenuOptions = element ? ContextOptions.value.filter(option => typeof option.condition === 'function' ? option.condition($(element)) : option.condition) : [];

		return scene;

		//return (s.navigation && s.visible) || s.active || s.isView;
	}).sort((a, b) => a.navOrder - b.navOrder);
	currentScene.value = game.scenes.find(s => s.active) ?? canvas.scene;
	l.log('Update Scenes |', scenes.value, currentScene.value);
}

const toggleMenu = (event) => {
	// If click is the Players Icon, toggle the Menu and return:
	if (event.target.closest('.taskbar-item') && event.target.closest('.taskbar-wrapper[data-id="scenes"]')) {
		if (event.target.closest('.taskbar-menu')) return
		showScenes.value = !showScenes.value;
		return;
	}else if (showScenes.value) {
		showScenes.value = false;
	}else{
		return;
	}
}

const ViewScene = (scene) => {
	l.log('View Scene |', scene);
	game.scenes.get(scene.id).view();
}

const ActivateScene = (scene) => {
	l.log('Activate Scene |', scene);
	game.scenes.get(scene.id).activate();
	//currentScene.value = game.scenes.get(scene.id);
}

const ConfigureScene = (scene) => {
	l.log('Configure Scene |', scene);
	game.scenes.get(scene.id).sheet.render(true);
}

const HasNotes = (scene) => {
	return !!game.scenes.get(scene.id)?.journal;
}

const SceneNotes = (scene) => {
	l.log('Scene Notes |', scene);
	const journal = game.scenes.get(scene.id).journal;

	if (!journal) return;
	journal.sheet.render(true, game.scenes.get(scene.id).journalEntryPage ? { pageId: game.scenes.get(scene.id).journalEntryPage } : {});
}

const PreloadScene = (scene) => {
	l.log('Preload Scene |', scene);
	game.scenes.preload(scene.id, true);
}

const ToggleScene = (scene) => {
	l.log('Toggle Scene |', scene);
	game.scenes.get(scene.id).update({ navigation: !scene.navigation });
}

const contextMenu = async (scene) => {
	const element = document.querySelector(`.taskbar .taskbar-menu.show li[data-scene-id="${scene.id}"]`);
	const li = document.querySelector(`#navigation #scene-list li.scene[data-scene-id="${scene.id}"]`);
	const menuItems = scene.contextMenuOptions;

	menuItems.forEach(item => {
		const callback = item.callback;
		item.callback = async function() {
			await callback($(li));
		}
	});

	const context = new ContextMenu($(element), '', menuItems, { hookName: "EntryContext" });
	context.render($(element));
}

const ContextOptions = computed(() => {
	const exclude = [
		game.i18n.localize("SCENES.Activate"), "SCENES.Activate",
		game.i18n.localize("SCENES.Configure"), "SCENES.Configure",
		game.i18n.localize("SCENES.Notes"), "SCENES.Notes",
		game.i18n.localize("SCENES.Preload"), "SCENES.Preload",
		game.i18n.localize("SCENES.ToggleNav"), "SCENES.ToggleNav",
		//game.i18n.localize("WEBRTC.TooltipShowUser")
	];

	const options = ui.nav._getContextMenuOptions().filter(option => !exclude.includes(option.name));
	l.log('Context Options |', options);
	return options;
});

onMounted(() => {
	l.log('Scenes Taskbar Mounted');

	Hooks.on('updateScene', updateScenes);

	updateScenes();

	// Listen for Document clicks to close the Menu
	document.addEventListener('click', toggleMenu);

	// Scene Navigation gets rebuilt very often, so we need to inject a style to hide it
	//document.querySelector('#ui-top').insertAdjacentHTML('beforeend', `<style id="${Module.id}-navigation-hide">#navigation { display: none; }</style>)`);
});

onUnmounted(() => {
	// Stop Listening for Document clicks
	document.removeEventListener('click', toggleMenu);

	// Show the Default Players Widget
	//document.querySelector(`#ui-top ${Module.id}-navigation-hide`).remove();
});

</script>

<style scoped>
.taskbar-menu li {
	background-position: center center;
    background-size: cover;	
	border-radius: 0.75rem;
	min-height: 60px;
	position: relative;
}
.taskbar-menu li:before {
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 0.75rem;
	content: '';
	display: block;
	inset: 0;
	position: absolute;
}
.taskbar-menu li .taskbar-menu-item {
	align-items: center;
	display: flex;
	inset: 0;
	padding: 0.5rem;
	position: absolute;
	text-shadow: 1px 1px 3px var(--color-shadow-dark);
}
.taskbar-menu li .taskbar-menu-item .title {
	align-items: center;
	cursor: pointer;
	display: flex;
	flex: 1 1 auto;
	font-size: 1.25rem;
	height: 100%;
}
</style>