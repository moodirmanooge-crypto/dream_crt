import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] = useState(null);

  const [userData, setUserData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        if (user) {

          setCurrentUser(user);

          const userRef = doc(
            db,
            "users",
            user.uid
          );

          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {

            setUserData(userSnap.data());

          } else {

            const newUser = {

              uid: user.uid,
              email: user.email,
              name: user.displayName || "Trader",
              strategy: "Not Set",
              bio: "",
              followers: 0,
              following: 0,
              totalTrades: 0,
              winRate: 0,
              createdAt: Date.now(),

            };

            await setDoc(
              userRef,
              newUser
            );

            setUserData(newUser);

          }

        } else {

          setCurrentUser(null);
          setUserData(null);

        }

        setLoading(false);

      }
    );

    return unsubscribe;

  }, []);

  const logout = async () => {

    await signOut(auth);

  };

  const value = {

    currentUser,
    userData,
    logout,

  };

  return (

    <AuthContext.Provider value={value}>

      {!loading && children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  return useContext(AuthContext);

}