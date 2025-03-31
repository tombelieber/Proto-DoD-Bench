/**
 * Computes statistics from an array of numbers.
 */
export function computeStats(times: number[]) {
    if (!times || times.length === 0) {
        return { sum: 0, mean: 0, median: 0, p99: 0, min: 0, max: 0 };
    }
    const sorted = [...times].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((acc, cur) => acc + cur, 0);
    const mean = sum / n;
    const median =
        n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    // Ensure index is within bounds for p99, min, max
    const p99Index = Math.max(0, Math.min(n - 1, Math.floor(n * 0.99)));
    const p99 = sorted[p99Index];
    return { sum, mean, median, p99, min: sorted[0], max: sorted[n - 1] };
}
