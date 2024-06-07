export const getBuildTimeMessage = (startTimestamp: number): string => {
  const diffInMs = Date.now() - startTimestamp;
  const seconds = Math.floor(diffInMs / 1000);
  if (seconds > 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} мин. ${seconds % 60} сек.${minutes > 10 ? ' 😱' : ''}`;
  }
  return `${seconds % 60}сек.`;
};
