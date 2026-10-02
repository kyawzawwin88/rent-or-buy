import { PROJECTION_WAIT_MS, projectionRefresh } from "./refresh";

describe("projection refresh", () => {
  it("waits 100ms and shows Updating after a draft change", () => {
    expect(PROJECTION_WAIT_MS).toBe(100);
    expect(projectionRefresh(true)).toEqual({
      showUpdating: true,
      waitMs: 100,
    });
  });

  it("does not show Updating when the draft is already applied", () => {
    expect(projectionRefresh(false)).toEqual({
      showUpdating: false,
      waitMs: 0,
    });
  });
});
