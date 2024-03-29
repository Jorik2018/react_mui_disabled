import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createStore } from 'redux'
import { Provider, useSelector, useDispatch } from "react-redux";
import {
  Backdrop, CircularProgress
} from '@mui/material';
import { http } from 'gra-react-utils';
import { db } from './db';

http.baseURL = import.meta.env.VITE_APP_BASE_URL;
/*
if (true||!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  localStorage.setItem('session',JSON.stringify({"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tL2lzc3VlciIsInVwbiI6Impkb2VAcXVhcmt1cy5pbyIsImdyb3VwcyI6WyJVc2VyIiwiQWRtaW4iXSwidWlkIjoxLCJ1c2VyIjoiYWRtaW4iLCJiaXJ0aGRhdGUiOiIyMDAxLTA3LTEzIiwiaWF0IjoxNjc1MjcyMjEyLCJleHAiOjE2NzUyNzU4MTIsImp0aSI6IjNmZDg4ODIwLTFlZDYtNGRiZC05MGQ5LWE0NWFlZDJiYWUxNyJ9.Gu0Hz87Vlc4BFw6Y6j26YjphJjbFfgFQJjXnw7JuXYMb4HhRl4jNMXSyB-RHmqVxML3Ets2-yP6t1M7PWBE3kEuAC4RbToU4nfLfZvCdbM4thz82sP-RO28K3bWG9GVGV8-iA6GQ_jH4i3eZvePW9jKOB8g19QJLsBUCrWFGNSnYWEMz7Oxg58PJooobBdGJRSGZFLAognYcDvxvHPY1UgOC43m5HKwaSp8OmL4P_dXnpsFjg2aOXlofGVilVteN6KI2NPkoUfv13SHXHzrXfqazhW5cMt_kTSX1W3SETcQSF61e--2bA4ik2aHpB9gMzQvQ6YRqEykWZue_E5YtCw"}));
  localStorage.setItem('perms',JSON.stringify(["admin/uti/attention","UTI_ATTENTION_REGISTER",
  "ACCESS_UTI","admin/uti","ACCESS_METAS","admin/seguimientometa","ACCESS_USERS",
  "REGISTER_PMA","DISABLED_REGISTER"," ADMIN_DESARROLLO_SOCIAL",
  "admin/disabled","DESARROLLO_SOCIAL_ADMIN_DISABLED","ACCESS_DESARROLLO_SOCIAL",
  "DESARROLLO_SOCIAL_REGISTER_DISABLED","DESARROLLO_SOCIAL_ACCESS_DISABLED"]));
}
*/
let connected=null;
try{
  let session=JSON.parse(localStorage.getItem('session'));
  if(session)connected=session.connected;
}finally{}
function counterReducer(state:any = {title:'',networkStatus:{},drawer:false, url:null,load: false,
 snack: null, cb: null, dialog: null, result: null, 
 connected:connected }, action:any) {

  switch (action.type) {
    case 'alert':
    case 'error':
    case 'confirm':
      return {...state,...{ dialog: action.msg ? action : null }}
    case 'appUrlOpen':
      return {...state,...{ url: action.url }}
    case 'connected':
      let session=null;
      try{
        session=JSON.parse(localStorage.getItem('session'));
      }finally{
        session=session||{};
        session.connected=action.connected;
        localStorage.setItem('session',JSON.stringify(session))
      }
        return {...state,...{ connected: action.connected }}
    case 'networkStatus':
      console.log(action);
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

function VBackdrop() {

  const load = useSelector((state:any) => state.load);

  const dispatch = useDispatch();

  http.loadingMask = (show:any) => {
    dispatch({ type: 'load', show: show });
  };
  return <Backdrop style={{ zIndex: 100000 }}
    open={!!load}

  >
    <CircularProgress />
  </Backdrop>;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      <Provider store={store}>
      <App />
      <VBackdrop />
    </Provider>
  </React.StrictMode>,
)
