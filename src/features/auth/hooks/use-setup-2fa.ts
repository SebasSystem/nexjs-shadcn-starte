'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

import { confirmTwoFactorSetup, getTwoFactorSetupData } from '../services/auth.service';

type BackendBody = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Fatal errors cannot be retried — user must go back to login
function extractFatalError(err: unknown): string | null {
  const body = err as BackendBody;
  const errors = body?.errors;

  if (errors?.tenant) return errors.tenant[0];
  if (errors?.token) return errors.token[0];
  if (errors?.two_factor) return errors.two_factor[0];

  // Generic non-success with no retriable error key
  if (body?.success === false && !errors?.code) {
    return body.message ?? 'Ocurrió un error inesperado.';
  }
  return null;
}

function extractRetriableError(err: unknown): string {
  const body = err as BackendBody;
  const errors = body?.errors;

  if (errors?.code) return errors.code[0];
  return body?.message ?? 'Código incorrecto. Verificá tu app y volvé a intentar.';
}

export function useSetup2FA(setupToken: string, onComplete: (newToken: string) => Promise<void>) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<string | null>(null);
  const [isProceding, setIsProceding] = useState(false);

  useEffect(() => {
    if (!setupToken) return;
    setIsLoadingQR(true);
    getTwoFactorSetupData(setupToken)
      .then(async (data) => {
        const payload = data?.data ?? data;
        const secretKey = (payload.secret ?? '') as string;
        const otpauthUrl = payload.otpauth_url as string;
        setSecret(secretKey);
        const dataUrl = await QRCode.toDataURL(otpauthUrl, { width: 192, margin: 1 });
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        const fatal = extractFatalError(err);
        setFatalError(fatal ?? 'No se pudo cargar el código QR. Intentá de nuevo.');
      })
      .finally(() => setIsLoadingQR(false));
  }, [setupToken]);

  const confirm = async () => {
    if (code.length !== 6) {
      setConfirmError('El código debe tener 6 dígitos.');
      return;
    }
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const data = await confirmTwoFactorSetup(setupToken, code);
      const payload = data?.data ?? data;
      const token = payload.token as string;
      const codes = (payload.recovery_codes ?? []) as string[];
      setConfirmedToken(token);
      setRecoveryCodes(codes);
      setShowRecoveryCodes(true);
    } catch (err) {
      const fatal = extractFatalError(err);
      if (fatal) {
        setFatalError(fatal);
      } else {
        setConfirmError(extractRetriableError(err));
        setCode('');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const proceed = async () => {
    if (!confirmedToken) return;
    setIsProceding(true);
    await onComplete(confirmedToken);
  };

  return {
    qrDataUrl,
    secret,
    isLoadingQR,
    fatalError,
    code,
    setCode,
    confirm,
    isConfirming,
    confirmError,
    showSecret,
    setShowSecret,
    showRecoveryCodes,
    recoveryCodes,
    proceed,
    isProceding,
  };
}
