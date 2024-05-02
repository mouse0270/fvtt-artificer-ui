<template>
	<div class="taskbar-wrapper">
		<div class="taskbar-container">
			<div class="taskbar-item" @click="openMacros">
				<svg-icon type="mdi" :path="mdiCodeBlockBraces"></svg-icon>
			</div>
			<div class="taskbar-item hotbar-controls">
				<svg-icon class="showMacros" type="mdi" :path="showMacros ? mdiMenuLeft : mdiMenuRight" @click="() => showMacros = !showMacros"></svg-icon>
				<svg-icon class="toggleHotbarLock" type="mdi" :path="lockHotbar ? mdiLock : mdiLockOpenVariant" @click="toggleHotbarLock"></svg-icon>
			</div>
			<div v-if="showMacros" class="taskbar-item" v-for="macro in macros" :key="macro.slot" @click="() => processMacro(macro)">
				<img :src="macro.icon" :alt="macro.tooltip" class="icon">
			</div>
			<div v-if="showMacros" class="taskbar-item hotbar-controls">
				<svg-icon type="mdi" :path="mdiMenuUp" @click="() => cyclePage(1)"></svg-icon>
				<svg-icon type="mdi" :path="mdiMenuDown" @click="() => cyclePage(-1)"></svg-icon>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCodeBlockBraces, mdiLock, mdiLockOpenVariant, mdiMenuLeft, mdiMenuRight, mdiMenuUp, mdiMenuDown  } from '@mdi/js'


const showMacros = ref(true);
const lockHotbar = ref(ui.hotbar.locked);

const openMacros = () => {
	ui.macros.render(true);
};
const processMacro = (macro) => {
	return game.macros.get(macro.macro.id).execute();
};
const cyclePage = (direction) => {
	ui.hotbar.cyclePage(direction);
};
const toggleHotbarLock = () => {
	ui.hotbar._toggleHotbarLock();
}

const macros = ref(game.macros.apps[0].macros.filter(macro => macro.cssClass === 'active'));
const updateMacros = (hotbar, init, options) => {
	macros.value = hotbar.macros.filter(macro => macro.cssClass === 'active');
	lockHotbar.value = ui.hotbar.locked
}

onMounted(() => {
	Hooks.on('renderHotbar', updateMacros);

	// Hide the default hotbar
	document.querySelector('#ui-bottom #hotbar').style.display = 'none';
});

onUnmounted(() => {
	Hooks.off('renderHotbar', updateMacros);

	// Show the default hotbar
	document.querySelector('#ui-bottom #hotbar').style.display = 'flex';
});

</script>

<style scoped>
.taskbar-container {
	align-items: center;
	background: var(--background-color);
    border: 1px solid var(--border-color);
	border-radius: 0.75rem;
	box-shadow: 0 0 10px #000;
	color: var(--color-light-2);
	display: flex;
	flex-direction: row;
    gap: 0.25rem;
	justify-content: center;
	min-height: var(--icon-size);
	min-width: var(--icon-size);
	padding: 0.25rem 0.25rem;
	pointer-events: all;
}
.taskbar-container:first-child {
	margin-left: 0;
}
.taskbar-container:last-child {
	margin-right: 0;
}
.taskbar-item {
	border: 1px solid transparent;
	border-radius: calc(var(--icon-size) / 6);
	cursor: pointer;
	display: flex;
	padding: 0.25rem;
	position: relative;
	transition: all 0.5s ease;
}
.taskbar-item:not(.hotbar-controls):hover {
	background: var(--color-header-background);
	border-color: var(--border-color);
	box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
}

svg, .icon {
	aspect-ratio: 1;
	height: calc(var(--icon-size) - 1.5rem);
	width: 100%;
}

.hotbar-controls {
	display: flex;
	flex-direction: column;
	height: var(--icon-size);
	margin-bottom: -0.25rem;
	margin-top: -0.25rem;
}
.hotbar-controls svg {
	max-height: calc((var(--icon-size)) / 2);
}
.hotbar-controls svg.showMacros {
	max-height: calc((var(--icon-size) / 3) * 2);
}
.hotbar-controls svg.toggleHotbarLock {
	max-height: calc(var(--icon-size) / 3);
}

</style>