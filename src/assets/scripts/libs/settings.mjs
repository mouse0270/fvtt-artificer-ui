import Module from '@Module';

/**
 * Returns an object containing default settings for a given key.
 *
 * @param {string} key - The key for the setting.
 * @returns {Object} An object containing default settings for the specified key.
 *   - name {string} - The name of the setting.
 *   - hint {string} - The hint for the setting.
 *   - scope {string} - The scope of the setting, accepts 'world', 'client', or 'user'.
 *   - config {boolean} - Whether the setting appears in the configuration view.
 *   - requiresReload {boolean} - Whether the setting requires a reload to take effect.
 *   - type {any} - The type of the setting.
 *   - default {any} - The default value of the setting.
 *   - onChange {function} - A callback function which is triggered whenever the setting is changed.
 */
const settingDefaults = (key) => ({
	get name() { return `${Module.id}.SETTINGS.${key}.Name`; },
	get hint() { return `${Module.id}.SETTINGS.${key}.Hint`; },
	scope: 'client', 			// This specifies a world-level setting
	config: true,				// This specifies that the setting appears in the configuration view
	requiresReload: false,		// This will prompt the GM to have all clients reload the application for the setting to take effect.
	//type: null,				// TODO: Look into this to see if we should be using it to define settings
	default: null,				// The default value of the setting
	onChange: value => {}		// A callback function which is triggered whenever the setting is changed
});

/**
 * Handles settings operations such as registering, setting, or getting values based on arguments passed.
 * 
 * @function
 * @param {...*} args - A variable list of arguments which can change the behavior of the function:
 *   - To register a new setting: pass 'register', setting key, and setting data.
 *   - To set a setting value: pass the setting key, the value to set, and optionally any options.
 *   - To get a setting value: pass the setting key.
 * @returns {Promise<*>} Depending on the operation:
 *   - When registering, returns the result of the registration.
 *   - When setting, returns the result of the setting operation.
 *   - When getting, returns the current value of the setting.
 *
 * @example
 * // Register a new setting
 * setting('register', 'newSetting', { default: 10, scope: 'client' });
 *
 * @example
 * // Set a value
 * setting('newSetting', 20);
 *
 * @example
 * // Get a value
 * setting('newSetting');
 */
export const setting = async (...args) => {
	let method = args[0].toLowerCase() === 'register' ? 'register' : args.length >= 2 ? 'set' : 'get';
	// If we're registering a setting
	if (method === 'register') {
		const [key, data, options] = args.slice(1);
		const defaults = settingDefaults(key);
		const setting = foundry.utils.mergeObject(defaults, (typeof data !== 'object' ? { default: data} : data), { inplace: false });

		// Handle if the setting is a user-specific setting
		if (setting.scope === 'user') {
			setting.scope = 'client';
			setting.default = foundry.utils.flattenObject(game.user.flags)?.[`${Module.id}.${key}`] ?? setting.default;
			const onChange = setting.onChange ?? (() => {});
			setting.onChange = async value =>  {
				game.user.setFlag(Module.id, key, value);
				if (setting.onChange) onChange(value);
			}
		}

		return game.settings.register(Module.id, key, setting, options || {});
	}else if (method === 'set') {
		const [key, value, options] = args;
		return game.settings.set(Module.id, key, value, options || {});
	}else{
		const [key] = args;
		return game.settings.get(Module.id, key);
	}
}

/**
 * Registers a setting with the specified key and data.
 *
 * @param {string} key - The setting key to retrieve
 * @param {any} data - The data to assign to the setting key
 * @param {object} [options] - Additional options passed to the server when updating world-scope settings
 * @returns {*} - The assigned setting value
 */
export const register = async (key, data, options={}) => setting('register', key, data, options);