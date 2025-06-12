export const registeredWorklets = new Map();

export function createWorkletFromSource(name, workletSource) {
  const blob = new Blob([workletSource], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}