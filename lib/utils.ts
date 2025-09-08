import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  // Use crypto.randomBytes to generate cryptographically secure random numbers
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    // Use modulo to map the random byte to a digit
    otp += digits[randomBytes[i] % digits.length];
  }
  
  return otp;
}
