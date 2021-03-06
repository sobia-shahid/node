// user context
import React from 'react';
export const UserContext = React.createContext();

function getUsersFromLocalStorage() {
  return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { user: null, token: null };
}

export default function UserProvider({ children }) {
  const [ user, setUser ] = React.useState(getUsersFromLocalStorage);

  const userLogin = (user, token) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };
  const userLogout = () => {
    setUser({ user: null, token: null });
    localStorage.removeItem('user');
    console.log('user log out ');
  };
  const subscribed = (subscriptionId, customerId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    user.user.subscriptionId = subscriptionId;
    user.user.customerId = customerId;
    if (subscriptionId && customerId)
      user.user.isPremium = true; //will set premium user to true
    else user.user.isPremium = false;
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  };

  const [ alert, setAlert ] = React.useState({
    show: false,
    msg: '',
    type: ''
  });
  const showAlert = ({ msg, type, show }) => {
    setAlert({ show, msg, type });
  };
  const hideAlert = () => {
    setAlert({ ...alert, show: false });
  };

  return (
    <UserContext.Provider value={{ user, userLogin, userLogout, alert, showAlert, hideAlert, subscribed }}>
      {children}
    </UserContext.Provider>
  );
}
