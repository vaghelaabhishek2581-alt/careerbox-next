'use client';

import React from 'react';
import { useEmailVerification } from '@/hooks/use-email-verification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EmailVerificationProps {
  email: string;
  onVerified?: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const { sendVerificationCode, verifyCode, isLoading } = useEmailVerification();
  const [code, setCode] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    const result = await sendVerificationCode(email);
    if (result.success) {
      setCodeSent(true);
      toast({
        title: 'Verification code sent',
        description: 'Please check your email for the verification code.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    const result = await verifyCode(email, code);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Email verified successfully',
      });
      onVerified?.();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {!codeSent ? (
        <Button
          onClick={handleSendCode}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            'Send verification code'
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="flex-1"
            />
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading || !code}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={handleSendCode}
            disabled={isLoading}
            className="w-full text-sm"
          >
            Resend code
          </Button>
        </div>
      )}
    </div>
  );
}
