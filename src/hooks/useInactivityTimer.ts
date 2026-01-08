import { useEffect, useCallback, useRef } from 'react';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora em milissegundos

export const useInactivityTimer = (onTimeout: () => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, INACTIVITY_TIMEOUT);
  }, [onTimeout]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Iniciar timer
    resetTimer();

    // Adicionar listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Limpar ao desmontar
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);
};