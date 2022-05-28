import { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExperationDate, setTokenExperationDate] = useState();
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, experationDate) => {
    setToken(token);
    const tokenExperationDate =
      experationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExperationDate(tokenExperationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token,
        experation: tokenExperationDate.toISOString(),
      })
    );
    setUserId(uid);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExperationDate(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExperationDate) {
      const remainingTime = tokenExperationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExperationDate]);
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.experation) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.experation)
      );
    }
  }, [login]);

  return { token, login, logout, userId };
};
