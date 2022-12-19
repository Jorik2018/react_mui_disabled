import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { useSelector, useDispatch } from "react-redux";
import {
  Backdrop, CircularProgress
} from '@mui/material';
import { http } from 'gra-react-utils';

import { db } from './db';



http.baseURL = process.env.REACT_APP_BASE_URL;

function counterReducer(state = {title:'',networkStatus:{},drawer:false, url:null,load: false, snack: null, cb: null, dialog: null, result: null }, action) {

  switch (action.type) {
    case 'alert':
    case 'error':
    case 'confirm':
      return {...state,...{ dialog: action.msg ? action : null }}
    case 'appUrlOpen':
      return {...state,...{ url: action.url }}
    case 'networkStatus':
        return {...state,...{ networkStatus: action.status }}
    case 'snack':
      return {...state,...{ snack: action.msg ? action : null }}
    case 'load':
      return {...state,...{ load: !!action.show }}
    case 'drawer':
        return {...state,...{ drawer:'drawer' in action?!!action.drawer:!state.drawer }}
    case 'title':
        return {...state,...{ title: action.title }}
    default:
      if(action.fn){
        action.fn(db);
      }
      return state
  }
}



let store = createStore(counterReducer)



const root = ReactDOM.createRoot(document.getElementById('root'));

function VBackdrop() {

  const load = useSelector((state) => state.load);

  const dispatch = useDispatch();

  http.loadingMask = (show) => {
    dispatch({ type: 'load', show: show });
  };
  return <Backdrop style={{ zIndex: 100000 }}
    open={!!load}

  >
    <CircularProgress />
  </Backdrop>;
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <VBackdrop />

    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*npm install @capacitor/cli @capacitor/core
npx cap init
npm i @capacitor/android
npx cap add ios
npm start
npx cap open ios*/
