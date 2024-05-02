<template>
	<div class="taskbar">
		<template v-for="(component, key) in components.value" :key="key">
			<component v-if="typeof component === 'object'" :is="component" :data-id="key" />
			<div v-else v-html="component" />
		</template>
	</div>
</template>

<script setup>
import Module from '@Module';
import { shallowRef, onMounted } from 'vue';

const components = shallowRef({});

onMounted(() => {
	// Get Components
	components.value = game.modules.get(Module.id).api.components;
});
</script>

<style>
:root {
	--taskbar-width: var(--sidebar-width);
}
:root:has(#sidebar.app.collapsed) {
	--taskbar-width: 32px;
}
body #pause {
	z-index: var(--z-index-app);
}
</style>

<style scoped>
@import url('../assets/styles/alchemy-ui.taskbar.css');
.taskbar {
	--icon-size: 54px;
}
</style>

<style>
@import url('../assets/styles/module.css');

.taskbar {
	--background-color: var(--color-cool-5-90);
	--background-color: rgba(33, 33, 33, 0.7);
	--border-color: var(--color-cool-4);
	--color-header-background: rgba(0, 0, 0, 0.5);

	--icon-size: 54px;

	align-items: center;
	display: flex;
	flex-direction: row;
    /*gap: 0.5rem; /* Cant use because of Hovering Condition */
	height: calc(var(--icon-size) + 1.5rem);
	justify-content: center;
	left: 0;
	pointer-events: none;
	position: fixed;
	top: calc(100vh - 1.5rem);
	transition: all 0.5s ease;
	transition-delay: 1.5s;
	width: calc(100% - var(--taskbar-width));
	z-index: calc(var(--z-index-window) - 1);
}
.taskbar:has(.taskbar-wrapper:hover) {
	transition-delay: 0s;
	top: calc(100vh - var(--icon-size) - 1rem);
}

.taskbar-wrapper {
	align-items: center;
	display: flex;
	flex-direction: row;
	justify-content: center;
	padding: 0.5rem 0.25rem;
	pointer-events: all;
}
</style>

<style>
.taskbar-container {
	align-items: center;
	background: var(--background-color);
	backdrop-filter: blur(4px);
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
	max-height: calc(var(--icon-size) / 2);
}
</style>

<style>
.taskbar-menu {
	align-items: center;
	background: var(--background-color);
	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(4px);
    border: 1px solid var(--border-color);
	border-radius: 0.75rem;
	bottom: 0;
	box-shadow: 0 0 10px #000;
	color: var(--color-light-2);
	display: flex;
	flex-direction: column;
    gap: 0.5rem;
	justify-content: center;
	left: calc(0px - 0.5rem);
	list-style: none;
	min-height: var(--icon-size);
	min-width: 400px;
	opacity: 0;
	padding: 0.25rem 0.25rem;
	pointer-events: none;
	position: absolute;
	transition: all 0.5s ease;
	z-index: -1;
}
.taskbar-menu.show {
	opacity: 1;
	pointer-events: all;
	bottom: calc(100% + 0.5rem);
}

.taskbar-menu li {
	align-items: center;
	cursor: default;
	display: flex;
	flex-direction: row;
	gap: 0.5rem;
	width: 100%;
}
.taskbar-menu li img.avatar {
	aspect-ratio: 1;
	flex: 0 1 auto;
	max-height: 32px;
}
.taskbar-menu li img.avatar.view {
	cursor: pointer;
}
.taskbar-menu li svg {
	cursor: pointer;
	flex: 0 1 auto;
	height: calc(32px / 1.5);
	width: auto;
}
.taskbar-menu li .user-info {
	align-items: center;
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 0.25rem;
}
.taskbar-menu li .user-info .foundry-info,
.taskbar-menu li .user-info .character-info  {
	align-items: center;
	display: flex;
	flex-direction: row;
	gap: 0.25rem;
	width: 100%;
}
.taskbar-menu li .user-info .character-info {
	font-size: var(--font-size-12);
}
.taskbar-menu li .user-info .player-name {
	flex: 1 1 auto;
}
.taskbar-menu li .actions {
	align-items: center;
    display: flex;
	flex: 0 1 auto;
	gap: 0.5rem;
}
</style>