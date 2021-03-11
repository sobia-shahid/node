// user context
import React from 'react';
export const UserContext = React.createContext();

function getUsersFromLoacalStorage() {
  return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { user: null, token: null };
}

export default function UserProvider({ children }) {
  const [ user, setUser ] = React.useState(getUsersFromLoacalStorage);

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
  const subscribed = (isSubscribed) => {
    const user = JSON.parse(localStorage.getItem('user'));
    user.user.isSubscribed = isSubscribed;
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
