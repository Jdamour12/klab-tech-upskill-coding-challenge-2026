import { useCallback, useRef, useState } from 'react';

export default function useToast(durationMs = 2500) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), durationMs);
  }, [durationMs]);

  return [toast, showToast];
}
