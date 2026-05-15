export const CANDOR_THREAD_ID = "ongoing";

export function isCandorThread(id: string) {
  return id === CANDOR_THREAD_ID;
}

export function candorThreadStorageKey(authId: string) {
  return `candor:thread:${authId}:messages`;
}
