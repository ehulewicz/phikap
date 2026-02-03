const trim = (value: string) => value.replace(/\/+$/, "");

export const apiBase =
	((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8787").replace(
		/\/$/,
		""
	);

export const paths = {
	brothers: {
		list: () => `${trim(apiBase)}/brothers`,
		points: (brotherId: number) => `${trim(apiBase)}/brothers/${brotherId}/points`,
	},
	events: {
		list: () => `${trim(apiBase)}/events`,
		create: () => `${trim(apiBase)}/events`,
		update: (eventId: number) => `${trim(apiBase)}/events/${eventId}`,
		duties: (eventId: number) => `${trim(apiBase)}/events/${eventId}/duties`,
		dutyAssignments: (eventId: number, eventDutyId: number) =>
			`${trim(apiBase)}/events/${eventId}/duties/${eventDutyId}/assignments`,
	},
	duties: {
		list: () => `${trim(apiBase)}/duties`,
		create: () => `${trim(apiBase)}/duties`,
		update: (dutyId: number) => `${trim(apiBase)}/duties/${dutyId}`,
		remove: (dutyId: number) => `${trim(apiBase)}/duties/${dutyId}`,
	},
	assignments: {
		list: () => `${trim(apiBase)}/assignments`,
		create: () => `${trim(apiBase)}/assignments`,
		update: (assignmentId: number) => `${trim(apiBase)}/assignments/${assignmentId}`,
		remove: (assignmentId: number) => `${trim(apiBase)}/assignments/${assignmentId}`,
	},
	eventDefinitions: {
		list: () => `${trim(apiBase)}/eventDefinitions`,
		create: () => `${trim(apiBase)}/eventDefinitions`,
		update: (eventDefinitionId: number) =>
			`${trim(apiBase)}/eventDefinitions/${eventDefinitionId}`,
		duties: (eventDefinitionId: number) =>
			`${trim(apiBase)}/eventDefinitions/${eventDefinitionId}/duties`,
		dutyCreate: (eventDefinitionId: number) =>
			`${trim(apiBase)}/eventDefinitions/${eventDefinitionId}/duties`,
		dutyUpdate: (eventDefinitionId: number, dutyId: number) =>
			`${trim(apiBase)}/eventDefinitions/${eventDefinitionId}/duties/${dutyId}`,
		dutyRemove: (eventDefinitionId: number, dutyId: number) =>
			`${trim(apiBase)}/eventDefinitions/${eventDefinitionId}/duties/${dutyId}`,
	},
	dutyDefinitions: {
		list: () => `${trim(apiBase)}/dutyDefinitions`,
		create: () => `${trim(apiBase)}/dutyDefinitions`,
		update: (dutyDefinitionId: number) =>
			`${trim(apiBase)}/dutyDefinitions/${dutyDefinitionId}`,
	},
	dutyTypes: {
		list: () => `${trim(apiBase)}/dutyTypes`,
		create: () => `${trim(apiBase)}/dutyTypes`,
		update: (dutyTypeId: number) => `${trim(apiBase)}/dutyTypes/${dutyTypeId}`,
	},
	auth: {
		login: () => `${trim(apiBase)}/auth/login`,
		me: () => `${trim(apiBase)}/auth/me`,
		logout: () => `${trim(apiBase)}/auth/logout`,
		reset: () => `${trim(apiBase)}/auth/reset`,
		update: () => `${trim(apiBase)}/auth`,
	},
};
