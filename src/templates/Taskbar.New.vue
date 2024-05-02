<template>
	<div class="taskbar">
		<!-- Taskbar items -->
		<div v-for="item in taskbarItems" :key="item.id" class="taskbar-item">
			<img :src="item.icon" class="taskbar-icon" />
			<span class="taskbar-label">{{ item.label }}</span>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			taskbarItems: [
				{ id: 1, icon: 'examples/FloFromProgressive.webp', label: 'App 1' },
				{ id: 2, icon: 'examples/FloFromProgressive.webp', label: 'App 2' },
				{ id: 3, icon: 'examples/FloFromProgressive.webp', label: 'App 3' },
				// Add more taskbar items as needed
			]
		};
	}
};
</script>

<style scoped>
.taskbar {
    backdrop-filter: blur(15px);
    bottom: 0;
    height: 45px;
    padding: 5px;
	position: fixed;
    text-align: center;
    width: 100vw;

	display: none !important;
}

.taskbar {
	display: flex;
	align-items: center;
	height: 48px;
	padding: 0 16px;
}

.taskbar-item {
	display: flex;
	align-items: center;
	margin-right: 16px;
	color: #fff;
	font-size: 14px;
}

.taskbar-icon {
	width: 24px;
	height: 24px;
	margin-right: 8px;
}

.taskbar-label {
	white-space: nowrap;
}
</style>