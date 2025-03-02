import { useContext } from 'react';
import { YfsUserContext } from '~/context/yfsUserContext';

export function useYfsUser() {
  const context = useContext(YfsUserContext);
  if (!context) {
    throw new Error('useYfsUser must be used within a YfsUserProvider');
  }

  return context;
}
