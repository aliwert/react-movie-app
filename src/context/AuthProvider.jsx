import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../auth/firebase";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  GithubAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  toastErrorNotify,
  toastSuccessNotify,
  toastWarnNotify,
} from "../helpers/ToastNotify";

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(sessionStorage.getItem("currentUser")) || false
  );
  const navigate = useNavigate();

  useEffect(() => {
    userObserver();
  }, []);

  const createUser = async (email, password, displayName) => {
    try {
     
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
     
      await updateProfile(auth.currentUser, {
        displayName,
      });
      navigate("/login");
      toastSuccessNotify("Registered successfully");
      console.log(userCredential);
    } catch (error) {
      toastErrorNotify(error.message);
    }
  };

  
  const signIn = async (email, password) => {
    try {
     
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      navigate("/");
      toastSuccessNotify("Logged in successfully");
      console.log(userCredential);
    } catch (error) {
      toastErrorNotify(error.message);
    }
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        toastSuccessNotify("Logged out successfully");
        
      })
      .catch((error) => {
       
      });
  };

  const userObserver = () => {
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        
        const { email, displayName, photoURL } = user;
        setCurrentUser({ email, displayName, photoURL });
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({ email, displayName, photoURL })
        );
      } else {
        
        setCurrentUser(false);
        sessionStorage.removeItem("currentUser");
       
      }
    });
  };

  
  const googleProvider = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        navigate("/");
        toastSuccessNotify("Logged in successfully");
      })
      .catch((error) => {
        // Handle Errors here.
        toastErrorNotify(error.message);
      });
  };

  const githubProvider = () => {
    const provider = new GithubAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        navigate("/");
        toastSuccessNotify("Logged in successfully");
      })
      .catch((error) => {
        toastErrorNotify(error.message);
      });
  };

  const forgotPassword = (email) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toastWarnNotify("Please check your mail box!");
      })
      .catch((error) => {
        toastErrorNotify(error.message);
      });
  };

  const values = {
    currentUser,
    createUser,
    signIn,
    logOut,
    googleProvider,
    forgotPassword,
    githubProvider,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
