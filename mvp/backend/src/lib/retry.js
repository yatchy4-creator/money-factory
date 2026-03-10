export async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 4,
    baseMs = 500,
    factor = 2,
    jitterMs = 100,
    shouldRetry = () => true,
    onRetry = () => {}
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        break;
      }
      const jitter = Math.floor(Math.random() * jitterMs);
      const waitMs = baseMs * Math.pow(factor, attempt - 1) + jitter;
      onRetry({ attempt, waitMs, error: error.message });
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  throw lastError;
}
