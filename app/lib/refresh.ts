export const PROJECTION_WAIT_MS = 100;

export function projectionRefresh(draftChanged: boolean): {
  showUpdating: boolean;
  waitMs: number;
} {
  if (!draftChanged) {
    return { showUpdating: false, waitMs: 0 };
  }
  return { showUpdating: true, waitMs: PROJECTION_WAIT_MS };
}
