'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface VerificationResult {
  success: boolean;
  message: string;
}

export function useEmailVerification() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = async (email: string): Promise<VerificationResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification code';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string): Promise<VerificationResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify email';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendVerificationCode,
    verifyCode,
    isLoading,
    error,
  };
}
