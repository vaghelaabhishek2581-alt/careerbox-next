'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { API } from '@/lib/api/services';

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

      const response = await API.auth.resendVerification();

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        throw new Error(response.error || 'Failed to send verification code');
      }
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

      const response = await API.auth.verifyEmail(code);

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        throw new Error(response.error || 'Failed to verify email');
      }
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
