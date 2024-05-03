import Module from '@Module';
import { logger as l } from '@logger';
import { setting, register } from '@settings';

// Core Components
import ComponentPlayers from "../../templates/components/Players.vue";
import ComponentScenes from "../../templates/components/Scenes.vue";
import ComponentHotbar from "../../templates/components/Hotbar.vue";
import ComponentSheets from "../../templates/components/Sheets.vue";

/* Custom Get Setting Function to handle for Shared Settings */
const userSetting = async (key) => {
	if (await setting('Shared.Enabled')) return (await setting(`Shared.Theme`))?.[key] ?? setting(key);
	return await setting(key);
}

Hooks.on('setup', async () => {
	// Register Module Settings
	// -- Use World Settings
	register('Shared.Enabled', {
		scope: 'world',
		default: false,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			if (value) {
				Hooks.on('updateUser', updateSharedSettings);
			}else {
				Hooks.off('updateUser', updateSharedSettings);
			}
			updateSharedSettings(game.user);
		}
	});
	register('Shared.Theme', {
		scope: 'world',
		config: false,
		default: {},
		type: Object,
	});
	if (await setting('Shared.Enabled')) Hooks.on('updateUser', updateSharedSettings);

	// -- Theme Settings
	register('Theme.Glass', {
		scope: 'user',
		default: false,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-theme-glass', value);
		}
	});
	register('Theme.Glass.Opacity', {
		scope: 'user',
		default: 0.5,
		type: new foundry.data.fields.NumberField({
			min: 0, max: 1, step: 0.01
		}),
		onChange: value => {
			document.querySelector(`body`).style.setProperty('--ui-background-color-alpha', value);
		}	
	})
	register('Theme.Glass.Blur', {
		scope: 'user',
		default: 10,
		type: new foundry.data.fields.NumberField({
			min: 0, max: 100, step: 1
		}),
		onChange: value => {
			document.querySelector(`body`).style.setProperty('--ui-Glassmorphism', `${value}px`);
		}
	});

	// -- Override Theme Color
	register('Theme.Color', {
		scope: 'user',
		default: null,
		type: new foundry.data.fields.ColorField({
			blank: true
		}),
		onChange: SetThemeColor
	});

	// -- Sidebar Settings
	register('Sidebar.Enabled', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-enabled', value);
		}
	});
	register('Sidebar.Theme', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-theme', value);
		}
	});
	register('Sidebar.AutoHide', {
		scope: 'user',
		default: false,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-autohide', value);
		}
	});
	register('Sidebar.DefaultTab', {
		scope: 'user',
		default: 'chat',
		choices: {
			'chat': game.i18n.localize('DOCUMENT.ChatMessages'),
			'combat': game.i18n.localize('DOCUMENT.Combats'),
			'scenes': game.i18n.localize('DOCUMENT.Scenes'),
			'actors': game.i18n.localize('DOCUMENT.Actors'),
			'items': game.i18n.localize('DOCUMENT.Items'),
			'journal': game.i18n.localize('SIDEBAR.TabJournal'),
			'tables': game.i18n.localize('DOCUMENT.RollTables'),
			'cards': game.i18n.localize('DOCUMENT.CardsPlural'),
			'playlists': game.i18n.localize('DOCUMENT.Playlists'),
			'compendium': game.i18n.localize('SIDEBAR.TabCompendium'),
			'settings': game.i18n.localize('SIDEBAR.TabSettings'),
		},
	})
	// -- Sidebar Settings - Chat
	register('Sidebar.Chat.Enabled', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-chat-enabled', value);
		}
	});
	register('Sidebar.Chat.AutoHide', {
		scope: 'user',
		default: false,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-chat-autohide', value);
		}
	});
	register('Sidebar.Chat.AutoHide.NewChat', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-chat-autohide-newchat', value);
		}
	});
	register('Sidebar.Chat.AutoHide.Combat', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-chat-autohide-combat', value);
		}
	});

	// -- Controls Settings
	register('Controls.Enabled', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-enabled', value);
		}
	});


	// Register Settings
	// -- Dock Controls [Left, Right, Top, Bottom]
	register('Controls.Dock', {
		scope: 'user',
		default: 'right',
		choices: {
			'left': `${Module.id}.SETTINGS.Controls.Dock.Choices.Left`,
			'right': `${Module.id}.SETTINGS.Controls.Dock.Choices.Right`,
			'top': `${Module.id}.SETTINGS.Controls.Dock.Choices.Top`,
			'bottom': `${Module.id}.SETTINGS.Controls.Dock.Choices.Bottom`
		},
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-dock', value);
			UpdateTooltipDirection(value);
		}
	});
	register('Controls.HideLogo', {
		scope: 'user',
		default: false,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-hide-logo', value);
		}
	});
	register('Controls.Position', {
		scope: 'user',
		default: 'start',
		choices: {
			'start': `${Module.id}.SETTINGS.Controls.Position.Choices.Start`,
			'center': `${Module.id}.SETTINGS.Controls.Position.Choices.Center`,
			'end': `${Module.id}.SETTINGS.Controls.Position.Choices.End`
		},
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-position', value);
		}
	})
	register('Controls.Style', {
		scope: 'user',
		default: 'rounded',
		choices: {
			'default': `${Module.id}.SETTINGS.Controls.Style.Choices.Default`,
			'circle': `${Module.id}.SETTINGS.Controls.Style.Choices.Circle`,
			'square': `${Module.id}.SETTINGS.Controls.Style.Choices.Square`,
			'rounded': `${Module.id}.SETTINGS.Controls.Style.Choices.Rounded`,
			'pill': `${Module.id}.SETTINGS.Controls.Style.Choices.Pill`
		},
		onChange: value => {
			document.querySelector(`#app-${Module.id}`).setAttribute('data-controls-style', value);
		}
	});

	// Custom UI Widgets
	// -- Player Widget
	register('Widgets.Players.Enabled', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			//document.querySelector(`#app-${Module.id}`).setAttribute('data-widgets-player-enabled', value);
			l.log('Widgets.Player.Enabled |', value);
			UpdateWidgets();
		}
	});
	// -- Scene Widget
	register('Widgets.Scene.Enabled', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			//document.querySelector(`#app-${Module.id}`).setAttribute('data-widgets-scene-enabled', value);
			l.log('Widgets.Scene.Enabled |', value);
			UpdateWidgets();
		}
	});
	// -- Hotbar Widget
	register('Widgets.Hotbar.Enabled', {
		scope: 'user',
		default: true,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			//document.querySelector(`#app-${Module.id}`).setAttribute('data-widgets-hotbar-enabled', value);
			l.log('Widgets.Hotbar.Enabled |', value);
			UpdateWidgets();
		}
	});
	// -- Sheet Widget
	register('Widgets.Sheets.Enabled', {
		scope: 'user',
		default: false,
		type: new foundry.data.fields.BooleanField(),
		onChange: value => {
			//document.querySelector(`#app-${Module.id}`).setAttribute('data-widgets-sheet-enabled', value);
			l.log('Widgets.Sheet.Enabled |', value);
			UpdateWidgets();
		}
	});

	
	UpdateTooltipDirection(setting('Controls.Dock'));
	UpdateWidgets();
});

// Update Shared Settings
const updateSharedSettings = async (user) => {
	// Hey, You're a GM, You don't need this
	if (!user.isGM) return;

	// Get All Module Client Settings
	const moduleSettings = game.settings.settings.values().toArray().filter(s => s.namespace == 'fvtt-artificer-ui' && s.scope == 'client');
	// Set All Module Client Settings
	const settings = {};
	await moduleSettings.forEach(async s => settings[s.key] = await setting(s.key));
	
	l.log('Shared Enabled |', settings);
	setting('Shared.Theme', settings);
}

// Set Theme Color
const SetThemeColor = async (value) => {
	if (value === null || value.length === 0 || (Color.fromString(value)?.css ?? "") == "") {
		//remove css variables from body
		document.querySelector(`body`).style.removeProperty('--ui-background-color-hue');
		document.querySelector(`body`).style.removeProperty('--ui-background-color-saturation');
		document.querySelector(`body`).style.removeProperty('--ui-background-color-lightness');
	}else {
		const color = Color.fromString(value);
		const hue = color.hsl[0] * 360;
		const saturation = color.hsl[1] * 100;
		const lightness = color.hsl[2] * 100;

		document.querySelector(`body`).style.setProperty('--ui-background-color-hue', hue);
		document.querySelector(`body`).style.setProperty('--ui-background-color-saturation', `${saturation}%`);
		document.querySelector(`body`).style.setProperty('--ui-background-color-lightness', `${lightness}%`);
	}
}

// Show Chat On Combat
const ShowChatOnCombat = async () => {
	const isShowChatOnCombat = await setting('Sidebar.Chat.AutoHide.Combat');
	const ActiveCombats = (game.combats.filter(c => c.started)?.length ?? 0) > 0;
	const elem = document.querySelector(`#app-${Module.id}`);

	l.log('ShowChatOnCombat |', elem, isShowChatOnCombat, ActiveCombats, (isShowChatOnCombat && ActiveCombats));
	if (elem) document.querySelector(`#app-${Module.id}`).setAttribute('data-sidebar-chat-autohide-combat', (isShowChatOnCombat && ActiveCombats));
}

// Setup Controls Tooltip
const UpdateTooltipDirection = async (value) => {
	// Update Controls Tooltip Position
	let direction = "RIGHT";
	switch (await value) {
		case 'top': direction = "DOWN"; break; /* WHY IS THIS NOT TOP */
		case 'bottom': direction = "UP"; break; /* WHY IS THIS NOT BOTTOM */
		case 'right': direction = "LEFT"; break;
	}
	
	document.querySelector('#controls').setAttribute('data-tooltip-direction', direction);

	l.log('UpdateTooltipDirection |', value, direction, document.querySelector('#controls').getAttribute('data-tooltip-direction'));

}

// Update Taskbar Widgets
const UpdateWidgets = async () => {
	const isPlayerWidgetEnabled = await setting('Widgets.Players.Enabled');
	const isSceneWidgetEnabled = await setting('Widgets.Scene.Enabled');
	const isHotbarWidgetEnabled = await setting('Widgets.Hotbar.Enabled');
	const isSheetWidgetEnabled = await setting('Widgets.Sheets.Enabled');

	const widgets = {};
	if (isPlayerWidgetEnabled) widgets.players = ComponentPlayers;
	if (isSceneWidgetEnabled) widgets.scenes = ComponentScenes;
	if (isHotbarWidgetEnabled) widgets.hotbar = ComponentHotbar;
	if (isSheetWidgetEnabled) widgets.sheets = ComponentSheets;

	game.modules.get(Module.id).api.components.value = widgets;
};

// Get Sidebar Choices 
const GetSidebarChoices = async () => {
	// Get List of Choices
	let choices = {};
	document.querySelectorAll(`#sidebar-tabs a.item`).forEach(item => choices[item.dataset.tab] = game.i18n.localize(item.dataset.tooltip));
	// If Chat is Popped Out, Remove Chat from Choices
	if (await setting('Sidebar.Chat.Enabled')) {
		choices = Object.entries(choices).filter(([key, value]) => key !== 'chat').reduce((obj, [key, value]) => {
			obj[key] = value;
			return obj;
		}, {});
	}
	
	return choices;
}

// Setup Settings
const setupSettings = async (app) => {
	// Set Properties
	l.log('Setting Properties |', app, await userSetting('Theme.Glass'));
	app.element.setAttribute('data-theme-glass', await userSetting('Theme.Glass'));
	app.element.setAttribute('data-theme-glass-opacity', await userSetting('Theme.Glass.Opacity'));
	app.element.setAttribute('data-theme-glass-blur', await userSetting('Theme.Glass.Blur'));
	SetThemeColor(await userSetting('Theme.Color'));

	app.element.setAttribute('data-sidebar-enabled', await userSetting('Sidebar.Enabled'));
	app.element.setAttribute('data-sidebar-theme', await userSetting('Sidebar.Theme'));
	app.element.setAttribute('data-sidebar-autohide', await userSetting('Sidebar.AutoHide'));

	app.element.setAttribute('data-sidebar-chat-enabled', await userSetting('Sidebar.Chat.Enabled'));
	app.element.setAttribute('data-sidebar-chat-autohide', await userSetting('Sidebar.Chat.AutoHide'));
	app.element.setAttribute('data-sidebar-chat-autohide-newchat', await userSetting('Sidebar.Chat.AutoHide.NewChat'));

	app.element.setAttribute('data-controls-enabled', await userSetting('Controls.Enabled'));
	app.element.setAttribute('data-controls-dock', await userSetting('Controls.Dock'));
	app.element.setAttribute('data-controls-hide-logo', await userSetting('Controls.HideLogo'));
	app.element.setAttribute('data-controls-position', await userSetting('Controls.Position'));
	app.element.setAttribute('data-controls-style', await userSetting('Controls.Style'));

	UpdateWidgets();

	// Update Settings Config if its open
	if (Object.values(ui.windows).find(w => w.id == 'client-settings')) {
		const elemSettings = Object.values(ui.windows).find(w => w.id == 'client-settings').element[0].querySelector(`form [data-tab="${Module.id}"]`);
		l.log('Settings Config |', elemSettings, await setting('Shared.Enabled'));
		if (!game.user.isGM) {
			const isSharedEnabled = await setting('Shared.Enabled');
			elemSettings.querySelectorAll(`.form-group input, .form-group select`).forEach(async group => group.disabled = isSharedEnabled);
			elemSettings.querySelector('.notification.warning').style.display = isSharedEnabled ? 'block' : 'none';
		}
	}
}

Hooks.once(`${Module.id}.Ready`, setupSettings);

Hooks.on('renderSceneControls', () => UpdateTooltipDirection(setting('Controls.Dock')));

Hooks.on('renderPackageConfiguration', async (app, elem, data) => {
	elem = elem?.[0] ?? elem;
	const elemSettings = elem.querySelector(`form [data-tab="${Module.id}"]`);

	// Insert Subheadings
	l.log('renderPackageConfiguration |', elem, elemSettings);
	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Theme.Glass"]`).insertAdjacentHTML('beforebegin', `<h3>${game.i18n.localize(`${Module.id}.SETTINGS.HEADERS.Theme`)}</h3>`);
	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Sidebar.Enabled"]`).insertAdjacentHTML('beforebegin', `<h3>${game.i18n.localize(`${Module.id}.SETTINGS.HEADERS.Sidebar`)}</h3>`);
	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Sidebar.Chat.Enabled"]`).insertAdjacentHTML('beforebegin', `<h4 style="border-bottom: 1px solid var(--color-underline-header);">${game.i18n.localize(`${Module.id}.SETTINGS.HEADERS.SidebarChat`)}</h4>`);

	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Controls.Enabled"]`).insertAdjacentHTML('beforebegin', `<h3>${game.i18n.localize(`${Module.id}.SETTINGS.HEADERS.Controls`)}</h3>`);
	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Widgets.Players.Enabled"]`).insertAdjacentHTML('beforebegin', `<h3>${game.i18n.localize(`${Module.id}.SETTINGS.HEADERS.Widgets`)}</h3>`);

	// Get List of Choices
	let choices = await GetSidebarChoices();
	// Update List of Choices
	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Sidebar.DefaultTab"] select`).innerHTML = Object.entries(choices).map(([key, value]) => `<option value="${key}">${value}</option>`).join('');
	// Set Default Value to Setting Value or First Choice
	const defaultTab = choices.hasOwnProperty(await setting('Sidebar.DefaultTab')) ? await setting('Sidebar.DefaultTab') : Object.keys(choices)[0];
	elemSettings.querySelector(`.form-group[data-setting-id="${Module.id}.Sidebar.DefaultTab"] select`).value = defaultTab;

	// Hide if Shared is Enabled
	elemSettings.querySelector('h2').insertAdjacentHTML('afterend', `<p class="notification warning" style="display: none;">${game.i18n.localize(`${Module.id}.SETTINGS.Shared.Enabled.Warning`)}</p>`);
	if (!game.user.isGM) {
		const isSharedEnabled = await setting('Shared.Enabled');
		elemSettings.querySelectorAll(`.form-group input, .form-group select`).forEach(group => group.disabled = isSharedEnabled);
		elemSettings.querySelector('.notification.warning').style.display = isSharedEnabled ? 'block' : 'none';
	}
});

Hooks.once('renderSidebar', async (app, elem, options) => {
	const choices = await GetSidebarChoices();
	const defaultTab = choices.hasOwnProperty(await setting('Sidebar.DefaultTab')) ? await setting('Sidebar.DefaultTab') : Object.keys(choices)[0];
	l.log('Sidebar |', choices, await userSetting('Sidebar.DefaultTab'), defaultTab);
	document.querySelector(`#sidebar-tabs a[data-tab="${defaultTab}"]`)?.click();	
});

Hooks.on('updateSetting', async (data, diff, options, userId) => {
	if (game.user.id == userId) return;
	setupSettings({ element: document.querySelector(`#app-${Module.id}`) });
});

/* Special Hooks to Handle for Showing Chat on Combat */
Hooks.on('combatStart', ShowChatOnCombat);
Hooks.on('deleteCombat', ShowChatOnCombat);
Hooks.on('ready', ShowChatOnCombat);
Hooks.on(`${Module.id}.Ready`, ShowChatOnCombat);