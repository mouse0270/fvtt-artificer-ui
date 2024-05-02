<template>	
	<div class="taskbar-wrapper">
		<div class="taskbar-container" v-if="items.length > 0">
			<div class="taskbar-item" v-for="item in items" :key="item.id" @click="activate(item)">
				<img :src="item.icon" :alt="item.label" class="icon">
				<span v-if="item.active" class="active-indicator"></span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { logger as l } from '@logger';

const items = ref([]);

const activate = (item) => {
	items.value.forEach(i => {
		i.active = i.id === item.id;
	});

	l.log('Activating Sheet |', item.sheet);

	// Handle for Application V1
	let sheet = null;
	if (typeof item?.sheet?.bringToTop === 'function') {
		sheet = Object.values(ui.windows).find(w => w.appId === item.sheet.appId);
		//sheet.bringToTop();
	}
	// Handle for Application V2
	else if (typeof item?.sheet?.bringToFront === 'function') {
		sheet = foundry.applications.instances.get(item.id);
		//sheet.bringToFront();
	}

	if (sheet) {
		(sheet?.bringToFront ?? sheet?.bringToTop)();
	}
};

async function onSheetRender(sheet, init, options) {
	// If the Sheet is ApplicationV2 and does not have a frame, ignore it
	if (!(sheet?.hasFrame ?? true)) return;

	// If the sheet does not have .window-header a.close, ignore it
	if (!(sheet?.hasFrame ?? false) && !sheet?.element?.[0]?.querySelector('.window-header a.close')) return;

	l.log(`sheetRender |`, `${sheet.constructor.name} |`, sheet);
	// Determine the Sheet Icon and Label

	const obj = sheet?.document ?? sheet?.object;
	let icon = obj?.avatar ?? obj?.img;
	if (sheet.constructor.name === 'ImagePopout') icon = sheet.object;

	l.log(`sheetRender |`, `${sheet.constructor.name} |`, icon);

	items.value.push({
		id: sheet.id,
		icon: icon,
		label: sheet.title,
		sheet: sheet,
		active: false,
	});
}

async function onSheetClose(sheet) {
	l.log(`sheetClose |`, `${sheet.constructor.name} |`, sheet);
	items.value = items.value.filter(item => item.id !== sheet.id);
}

// Define the Supported Sheets to Attach the Taskbar to
const supportedSheets = ['Application', 'ApplicationV2', 'ActorSheet'];

onMounted(() => {
	l.log('Attaching Hooks.on Listener for Supported Sheets:', supportedSheets);
	// Attach Hooks.on Listener for Supported Sheets
	supportedSheets.forEach(sheet => {
		Hooks.on(`render${sheet}`, onSheetRender);
		Hooks.on(`close${sheet}`, onSheetClose);
	});
});

onUnmounted(() => {
	l.log('Removing Hooks.on Listener for Supported Sheets:', supportedSheets);
	// Detach Hooks.on Listener for Supported Sheets
	supportedSheets.forEach(sheet => {
		Hooks.off(`render${sheet}`, onSheetRender);
		Hooks.off(`close${sheet}`, onSheetClose);
	});
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
	height: calc(64px - 1.5rem);
	width: 100%;
}

.hotbar-controls {
	display: flex;
	flex-direction: column;
	height: 64px;
	margin-bottom: -0.25rem;
	margin-top: -0.25rem;
}
.hotbar-controls svg {
	max-height: calc((64px) / 2);
}

</style>