export function FormResendCode({ onResend }: { onResend: () => void }) {
  return (
    <div className="text-sm mt-4 text-center">
      ¿No recibiste el código?{' '}
      <button type="button" onClick={onResend} className="text-primary hover:underline">
        Reenviar
      </button>
    </div>
  );
}
