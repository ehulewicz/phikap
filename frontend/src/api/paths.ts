export const paths = {
  auth: {
    login: () => "/auth/login",
    logout: () => "/auth/logout",
    reset: () => "/auth/reset",
    update: () => "/auth",
  },
  brothers: {
    list: () => "/brothers",
    detail: (brotherId: number | string) => `/brothers/${brotherId}`,
    assignments: (brotherId: number | string) => `/brothers/${brotherId}/assignments`,
    update: () => "/brothers/brother",
  },
  events: {
    list: () => "/events",
    duties: (eventId: number | string) => `/events/${eventId}/duties`,
    dutyAssignments: (eventId: number | string, eventDutyId: number | string) =>
      `/events/${eventId}/duties/${eventDutyId}/assignments`,
  },
  eventDefinitions: {
    list: () => "/eventDefinitions",
    duties: (eventDefinitionId: number | string) =>
      `/eventDefinitions/${eventDefinitionId}/duties`,
  },
  dutyDefinitions: {
    list: () => "/dutyDefinitions",
  },
  duties: {
    list: () => "/duties",
  },
  me: () => "/me",
};
