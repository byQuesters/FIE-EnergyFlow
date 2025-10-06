import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function useEnableBodyScroll() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Asegurar que el body permita scroll
      document.body.style.overflow = 'auto';
    }
  }, []);
}