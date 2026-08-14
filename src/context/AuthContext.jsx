import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange } from '../firebase/firebase';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Dipakai di komponen mana pun: const { user, loading } = useAuth(); */
export function useAuth() {
  return useContext(AuthContext);
}