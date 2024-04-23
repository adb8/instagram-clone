import { useEffect, useState, createContext, useContext } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateEmail,
  updatePassword,
  verifyBeforeUpdateEmail,
  signInWithPopup,
  googleProvider,
} from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateEmailFunc = (email) => {
    return updateEmail(currentUser, email);
  };

  const updatePasswordFunc = (password) => {
    return updatePassword(currentUser, password);
  };

  const verifyEmail = (email) => {
    return verifyBeforeUpdateEmail(currentUser, email);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmailFunc,
    updatePasswordFunc,
    verifyEmail,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthProvider;
