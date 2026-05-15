import { calculateDays } from "@/lib/leave";

describe("leave calculation", () => {
  test("calculates inclusive days between dates", () => {
    const days = calculateDays("2026-05-01", "2026-05-03");
    expect(days).toBe(3);
  });
});
