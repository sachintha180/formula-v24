const generateBet = (n) => {
  return Math.min(n + 1, 2) + (n * (n - 1)) / 2;
};

export { generateBet };
