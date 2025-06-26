// Rate limiter to prevent hitting GitHub API limits

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

class RateLimiter {
  private queue: (() => Promise<unknown>)[] = [];
  private processing = false;
  private rateLimitInfo: RateLimitInfo | null = null;
  private minDelay = 100;
  private lastRequestTime = 0;

  updateRateLimit(headers: Headers): void {
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0');
    const resetTime = parseInt(headers.get('x-ratelimit-reset') || '0') * 1000;
    const limit = parseInt(headers.get('x-ratelimit-limit') || '5000');

    this.rateLimitInfo = { remaining, resetTime, limit };
  }

  async enqueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {

      if (this.rateLimitInfo && this.rateLimitInfo.remaining <= 5) {
        const waitTime = Math.max(0, this.rateLimitInfo.resetTime - Date.now());
        if (waitTime > 0) {
          console.warn(`Rate limit almost exceeded. Waiting ${waitTime}ms until reset.`);
          await this.sleep(waitTime);
        }
      }


      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await this.sleep(this.minDelay - timeSinceLastRequest);
      }

      const apiCall = this.queue.shift();
      if (apiCall) {
        this.lastRequestTime = Date.now();
        await apiCall();
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  getRemainingRequests(): number {
    return this.rateLimitInfo?.remaining || 0;
  }

  canMakeRequest(): boolean {
    if (!this.rateLimitInfo) return true;
    return this.rateLimitInfo.remaining > 5;
  }
}


export const rateLimiter = new RateLimiter(); 