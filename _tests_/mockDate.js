export const setMockDate = (dateStr) => {
  const mockTime = new Date(dateStr).getTime();
  jest.useFakeTimers();
  jest.setSystemTime(mockTime);
};

// Restore when done
export const restoreDate = () => {
  jest.useRealTimers();
};
