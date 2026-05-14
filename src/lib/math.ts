/**
 * Hypergeometric Distribution formula:
 * P(X = k) = [ (K choose k) * (N-K choose n-k) ] / (N choose n)
 * 
 * N: Total population size (Deck size)
 * K: Number of successes in population (Total copies of card in deck)
 * n: Number of draws (Opening hand size or cards seen by turn X)
 * k: Number of successes in draws (Number of copies we want to see)
 */

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
}

export function calculateHypergeometric(N: number, K: number, n: number, k: number): number {
  const successCombos = combinations(K, k);
  const failureCombos = combinations(N - K, n - k);
  const totalCombos = combinations(N, n);
  
  if (totalCombos === 0) return 0;
  return (successCombos * failureCombos) / totalCombos;
}

/**
 * Calculates cumulative probability P(X >= k)
 */
export function calculateProbabilityAtLeast(N: number, K: number, n: number, k: number): number {
  let totalProb = 0;
  for (let i = k; i <= Math.min(n, K); i++) {
    totalProb += calculateHypergeometric(N, K, n, i);
  }
  return totalProb;
}

/**
 * Formats probability as a percentage string
 */
export function formatProbability(prob: number): string {
  return (prob * 100).toFixed(1) + "%";
}
