<template>
</template>

<script setup>
import Module from '@Module';
import { setting } from '@settings';
import { logger as l } from '@logger';
import { onMounted, onUnmounted } from 'vue';

// Create Player Color Variables --player-color, --player-id-color, --player-id-color-rgb
const createPlayerColors = (user) => {
	l.log('Creating Player Colors |', user);
	// Create --player-color
	if (user.id === game.user.id) document.documentElement.style.setProperty('--player-color', user.color);

	// Create --player-id-color
	document.documentElement.style.setProperty(`--player-${user.id}-color`, user.color);

	// Create --player-id-color-rgb
	const rgb = user.color.rgb;
	if (user.id === game.user.id) document.documentElement.style.setProperty(`--player-color-rgb`, `${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255}`);
	document.documentElement.style.setProperty(`--player-${user.id}-color-rgb`, `${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255}`);
};

// When User Updates, Player Colors
const updatePlayerColors = (user, update, details, userId) => {
	createPlayerColors(user);

	// If User has Character, Update --chat-form-message to be Message from Character Name
	/*if (user.character !== null && user.id === game.user.id) {
		document.querySelector('#chat #chat-form').style.setProperty('--chat-form-message', `"${game.i18n.format(`${Module.id}.CHAT.Message.Character`, { name: user.character.name })}"`);
	}else {
		document.querySelector('#chat #chat-form').style.setProperty('--chat-form-message', `"${game.i18n.localize(`${Module.id}.CHAT.Message.Placeholder`)}"`);
	}*/
};

const autoAdjustTextarea = (event) => {
	if (!setting('Sidebar.Chat.Enabled')) {
		textarea.style.height = 'auto';
		return;
	}
	
	const textarea = event.target;
	setTimeout(() => {
		textarea.setAttribute('style', 'height: auto; padding: 0; margin: 0;');
		textarea.setAttribute('style', `height: ${textarea.scrollHeight}px;`);
	}, 0);
	//textarea.style.height = `${textarea.scrollHeight}px`;
	l.log('Auto Adjust Textarea |', event, textarea.scrollHeight, textarea.style.height, textarea.clientHeight, textarea.scrollHeight, textarea.offsetHeight);

	// Add Placeholder Tag if Empty
	if (textarea.getAttribute('placeholder') === null) textarea.setAttribute('placeholder', ' ');
};

const renderChatMessage = (message, elem, options) => {
	elem[0].classList.add('new-chat');
	setTimeout(() => elem[0].classList.remove('new-chat'), 5000);
};

onMounted(() => {
	Hooks.on('updateUser', updatePlayerColors);
	Hooks.on('renderChatMessage', renderChatMessage);
	game.users.forEach(createPlayerColors);
	updatePlayerColors(game.user);

	// Auto Adjust Textarea
	l.log('Chat |', document.querySelector('#chat'))
	document.querySelector('#chat #chat-form textarea').addEventListener('input', autoAdjustTextarea);
	autoAdjustTextarea({ target: document.querySelector('#chat #chat-form textarea') });

	// Set Properties
	l.log('Setting Properties |', document.querySelector(`#app-${Module.id}`), setting('Controls.Dock'), setting('Controls.Style'));
	//document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-dock', setting('Controls.Dock'));
	//document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-style', setting('Controls.Style'));
});

onUnmounted(() => {
	Hooks.off('updateUser', updatePlayerColors);
	Hooks.off('renderChatMessage', renderChatMessage);


	// Auto Adjust Textarea
	document.querySelector('#chat #chat-form textarea').removeEventListener('input', autoAdjustTextarea);
});
</script>

<style>
/* -- Base  */
@import '../assets/styles/base.css';
/* -- Theme */
@import '../assets/styles/module.glassmorphism.css';
/* -- Sidebar */
@import '../assets/styles/module.sidebar.css';
/* -- Sidebar -- Chat */
@import '../assets/styles/module.sidebar.chat.css';
/* -- Controls */
@import '../assets/styles/module.controls.css';

/* -- Core Foundry Overrides */
@import '../assets/styles/foundry.applicationv2.css';

/* -- Components */
@import '../assets/styles/components.core.css';

/* -- Systems */
/* -- Systems -- DnD5e */
@import '../assets/styles/system.dnd5e.css';
/* -- Systems -- DEGENESIS: Rebirth */
@import '../assets/styles/system.degenesis.css';
/* -- Systems -- DSA5 */
@import '../assets/styles/system.dsa5.css';
</style>