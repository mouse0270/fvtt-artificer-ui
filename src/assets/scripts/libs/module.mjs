import ModuleData from "../../../../module.json" with { type: "json" };

const defaults = {
	flags: {
		logger: {
			enabled: false,
			background: "#d4d4d4",
			foreground: "#000"
		}
	}
}

export default foundry.utils.mergeObject(defaults, ModuleData);
