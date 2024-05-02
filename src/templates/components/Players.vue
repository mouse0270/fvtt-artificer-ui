<template>
	<div class="taskbar-wrapper">
		<div class="taskbar-container">
			<div class="taskbar-item" style="position: relative;">
				<svg-icon type="mdi" :path="mdiAccountGroup"></svg-icon>
				<ul :class="`taskbar-menu ${showPlayers ? 'show' : 'hide'}`">
					<li v-for="player in players.filter(p => showOfflinePlayers || p.active)" :key="player.id" :data-user-id="player.id">
						<img :src="player?.character?.img ?? player.avatar" :alt="player.name" :class="`avatar ${player.avatar !== DEFAULT_TOKEN ? 'view' : ''}`" @click="() => viewAvatar(player)">
						<svg-icon type="mdi" :path="player.active ? mdiCircle : mdiCircleOutline" :style="`color: ${player.active ? player.color : '#333'}`" ></svg-icon>
						<div class="user-info">
							<div class="foundry-info">
								<div class="player-name">{{ player.name }}<span v-if="player.pronouns.length > 0"> ({{ player.pronouns }})</span></div>
							</div>
							<div v-if="player?.character" class="character-info">
								<div class="player-name" v-html="characterInfo?.[player.id]"></div>
							</div>
						</div>
						<div class="actions">
							<svg-icon v-if="isGM || player.id == currentPlayer.id" :data-tooltip="localize('PLAYERS.ConfigTitle')" type="mdi" :path="mdiCog" @click="() => configureUser(player)"></svg-icon>
							<!-- MOVED TO img to clean up space
							<svg-icon v-if="player.avatar !== DEFAULT_TOKEN" type="mdi" :path="mdiImage" @click="() => viewAvatar(player)"></svg-icon>-->
							<svg-icon v-if="isGM && player.active && player.id != currentPlayer.id && currentScene !== player.viewedScene" :data-tooltip="localize('PLAYERS.PullToScene')" type="mdi" :path="mdiSourcePull" @click="() => pullToScene(player)"></svg-icon>
							<svg-icon v-if="isGM && player.active && player.id != currentPlayer.id" :data-tooltip="localize('PLAYERS.Kick')" type="mdi" :path="mdiLogoutVariant" @click="() => kickPlayer(player)"></svg-icon>
							<svg-icon v-if="isGM && player.id != currentPlayer.id && player.role !== BANNED" :data-tooltip="localize('PLAYERS.Ban')" type="mdi" :path="mdiLock" @click="() => banPlayer(player)"></svg-icon>
							<svg-icon v-if="isGM && player.id != currentPlayer.id && player.role === BANNED" :data-tooltip="localize('PLAYERS.UnBan')" type="mdi" :path="mdiLockOpen" @click="() => unbanPlayer(player)"></svg-icon>
							<svg-icon v-if="(player?.contextMenuOptions?.length ?? 0) > 0" :data-tooltip="localize('MORE')" :data-user-id="player.id" type="mdi" :path="mdiDotsVertical" @click="() => contextMenu(player)"></svg-icon>
						</div>
					</li>
					<li>
						<button @click="showOfflinePlayers = !showOfflinePlayers">{{ localize(`${Module.id}.taskbar.components.players.${showOfflinePlayers ? 'hide' : 'show'}OfflinePlayers`) }}</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import Module from '@Module';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccountGroup, mdiCircle, mdiCircleOutline, mdiCog, mdiImage, mdiSourcePull, mdiLogoutVariant, mdiLock, mdiLockOpen, mdiDotsVertical } from '@mdi/js'
import { localize } from '../../assets/scripts/libs/VueHelpers.mjs';
import { logger as l } from '@logger';

// Expand UI Players Widget
// -- This is required to make sure context menu options work.
ui.players._showOffline = true;
ui.players.render(true);

const currentPlayer = ref(game.user);
const isGM = ref(game.user.isGM);
const players = ref(game.users.contents.sort((a, b) => b.active - a.active));
const showPlayers = ref(false);
const currentScene = ref(canvas.scene?.id ?? "");
const showOfflinePlayers = ref(false);

const DEFAULT_TOKEN = CONST.DEFAULT_TOKEN;
const BANNED = CONST.USER_ROLES.NONE;
const characterInfo = ref({});

const getCharacterInfo = async (character) => {
	return await game.modules.get(Module.id).api.players.getCharacterInfo(character);
}

const configureUser = (player) => {
	const user = game.users.get(player.id);
	l.log('Configuring User |', player, user);
	user?.sheet.render(true);
}

const viewAvatar = (player) => {
	const user = game.users.get(player.id);
	if (user.avatar === DEFAULT_TOKEN) return;
	new ImagePopout(user.avatar, {
		title: user.name,
		uuid: user.uuid
	}).render(true);
}

const pullToScene = async (player) => {
	game.socket.emit("pullToScene", canvas.scene.id, player.id);
	// Jank Await for the Socket to Update the Scene
	setTimeout(() => { updatePlayers(); }, 500);
}

const kickPlayer = async (player) => {
	const user = game.users.get(player.id);
	l.log('Kicking Player |', user);
	const role = user.role;
	await user.update({role: CONST.USER_ROLES.NONE});
    await user.update({role}, {diff: false});
	ui.notifications.info(`${user.name} has been <strong>kicked</strong> from the World.`);
}

const banPlayer = async (player) => {
	const user = game.users.get(player.id);
	l.log('Banning Player |', user);
	if ( user.role === CONST.USER_ROLES.NONE ) return;
    await user.update({role: CONST.USER_ROLES.NONE});
    ui.notifications.info(`${user.name} has been <strong>banned</strong> from the World.`);
}

const unbanPlayer = async (player) => {
	const user = game.users.get(player.id);
	l.log('Unbanning Player |', user);
	if ( user.role !== CONST.USER_ROLES.NONE ) return;
    await user.update({role: CONST.USER_ROLES.PLAYER});
    ui.notifications.info(`${user.name} has been <strong>unbanned</strong> from the World.`);
}

const contextMenu = async (player) => {
	const element = document.querySelector(`.taskbar .taskbar-menu.show li[data-user-id="${player.id}"]`);
	const li = document.querySelector(`#players #player-list li.player[data-user-id="${player.id}"]`);
	const menuItems = player.contextMenuOptions;

	menuItems.forEach(item => {
		const callback = item.callback;
		item.callback = async function() {
			await callback($(li));
		}
	});

	const context = new ContextMenu($(element), '', menuItems, { hookName: "EntryContext" });
	context.render($(element));
}

const updatePlayers = () => {
	players.value = game.users.contents.map(player => {
		const element = document.querySelector(`#players #player-list li.player[data-user-id="${player.id}"]`);
		player.contextMenuOptions = element ? UserContextOptions.value.filter(option => option.condition($(element))) : [];
		return player
	}).sort((a, b) => b.active - a.active);

	players.value.forEach(async player => {
		if (player.character) {
			characterInfo.value[player.id] = await getCharacterInfo(player.character);
		}
	});
};

const updateActor = (actor, data, options, actorId) => {
	const player = players.value.find(p => p.character?.id === actor.id);
	if (player) updatePlayers();
}

const updateScene = (canvas) => {
	currentScene.value = canvas.scene.id;
	l.log('Current Scene |', currentScene.value);
}

const UserContextOptions = computed(() => {
	const exclude = [
		game.i18n.localize("PLAYERS.ConfigTitle"), "PLAYERS.ConfigTitle",
		game.i18n.localize("PLAYERS.ViewAvatar"), "PLAYERS.ViewAvatar",
		game.i18n.localize("PLAYERS.PullToScene"), "PLAYERS.PullToScene",
		game.i18n.localize("PLAYERS.Kick"), "PLAYERS.Kick",
		game.i18n.localize("PLAYERS.Ban"), "PLAYERS.Ban",
		game.i18n.localize("PLAYERS.UnBan"), "PLAYERS.UnBan",
		//game.i18n.localize("WEBRTC.TooltipShowUser")
	]
	return ui.players._getUserContextOptions().filter(option => !exclude.includes(option.name));
});

const toggleMenu = (event) => {
	// If click is the Players Icon, toggle the Menu and return:
	if (event.target.closest('.taskbar-item') && event.target.closest('.taskbar-wrapper[data-id="players"]')) {
		if (event.target.closest('.taskbar-menu')) return
		showPlayers.value = !showPlayers.value;
		return;
	}else if (showPlayers.value) {
		showPlayers.value = false;
	}else{
		return;
	}
}

onMounted(() => {
	l.log('Players |', players);
	Hooks.on('userConnected', updatePlayers); // Update players when a user connects/disconnects
	Hooks.on('updateUser', updatePlayers); // Update Players when a User is Updated
	Hooks.on('updateActor', updateActor); // Update Players when an Actor is Updated - Used for Character Info
	Hooks.on('canvasReady', updateScene); // Update Scene ID to show Pull to Scene Button

	// When a user switches scenes, it does not trigger updateUser, so we need to update the players on scene change
	//?? Probably a bug in FoundryVTT
	Hooks.on('renderSceneNavigation', updatePlayers); // 

	updatePlayers();

	// Listen for Document clicks to close the Menu
	document.addEventListener('click', toggleMenu);

	// Hide the Default Players Widget
	//document.querySelector('#ui-left').insertAdjacentHTML('beforeend', `<style id="${Module.id}-players-hide">#players { display: none; }</style>)`);
});

onUnmounted(() => {
	// Stop Listening for Updates
	Hooks.off('userConnected', updatePlayers);
	Hooks.off('updateUser', updatePlayers);
	Hooks.off('updateActor', updateActor);
	Hooks.off('canvasReady', updateScene);
	Hooks.off('renderSceneNavigation', updatePlayers);

	// Stop Listening for Document clicks
	document.removeEventListener('click', toggleMenu);
	
	// Collapse UI Players Widget
	ui.players._showOffline = false;
	ui.players.render(true);

	// Show the Default Players Widget
	//document.querySelector(`#ui-left ${Module.id}-players-hide`).remove();
});

</script>