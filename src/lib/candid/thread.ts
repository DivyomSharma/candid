export const CANDOR_THREAD_ID = "ongoing";

export function isCandidThread(id: string) {
  return id === CANDOR_THREAD_ID;
}

export function candidThreadStorageKey(authId: string) {
  return `candid:thread:${authId}:messages`;
}

export function candidThreadReadStorageKey(authId: string) {
  return `candid:thread:${authId}:read`;
}

export function candidThreadPresenceStorageKey(authId: string) {
  return `candid:thread:${authId}:presence`;
}
