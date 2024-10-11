// TODO: Need to refactor and sync with react-persist

const storeToken = (token) => {
  localStorage.setItem("token", token);
};

const removeToken = () => {
  localStorage.removeItem("token");
};

const getToken = () => {
  return localStorage.getItem("token");
};

export { storeToken, removeToken, getToken };
