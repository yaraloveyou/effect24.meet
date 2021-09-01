import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import User from './store/user.store';

export const Context = createContext(null)

ReactDOM.render(
  <Context.Provider value={{
    user: new User()
  }}>
    <App />
  </Context.Provider>,
  document.getElementById('root')
);
