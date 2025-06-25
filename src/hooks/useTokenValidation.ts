import { useState, useEffect } from 'react';

interface TokenStatus {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  rateLimit: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  } | null;
  tokenInfo: {
    scopes: string[];
    note: string | null;
    expires_at: string | null;
  } | null;
}

export const useTokenValidation = () => {
  const [status, setStatus] = useState<TokenStatus>({
    isValid: false,
    isLoading: true,
    error: null,
    rateLimit: null,
    tokenInfo: null,
  });

  const validateToken = async () => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    
    if (!token) {
      setStatus({
        isValid: false,
        isLoading: false,
        error: 'No GitHub token configured',
        rateLimit: null,
        tokenInfo: null,
      });
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check rate limit first (lightweight call)
      const rateLimitResponse = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!rateLimitResponse.ok) {
        throw new Error(`Token validation failed: ${rateLimitResponse.status} ${rateLimitResponse.statusText}`);
      }

      const rateLimitData = await rateLimitResponse.json();
      
      // Get token info (more detailed)
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        throw new Error(`User info fetch failed: ${userResponse.status} ${userResponse.statusText}`);
      }

      // Extract token scopes 
      const scopes = userResponse.headers.get('X-OAuth-Scopes')?.split(', ') || [];
      
      setStatus({
        isValid: true,
        isLoading: false,
        error: null,
        rateLimit: rateLimitData.rate,
        tokenInfo: {
          scopes,
          note: null,
          expires_at: null, // Not sure if it's provided by the API
        },
      });

    } catch (error) {
      console.error('Token validation error:', error);
      setStatus({
        isValid: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
        rateLimit: null,
        tokenInfo: null,
      });
    }
  };

  useEffect(() => {
    validateToken();
    
    // Perform a revalidation every 5 minutes
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const clearToken = () => {

    console.warn('Clear token functionality would remove token from environment/storage');
    setStatus({
      isValid: false,
      isLoading: false,
      error: 'Token cleared - please refresh with a new token',
      rateLimit: null,
      tokenInfo: null,
    });
  };

  return {
    ...status,
    validateToken,
    clearToken,
    hasToken: !!import.meta.env.VITE_GITHUB_TOKEN,
  };
}; 