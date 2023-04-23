import { useEffect } from 'react';
import HomePage from './HomePage';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { http, useToken, OAuth } from 'gra-react-utils';
import { App as App2 } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { db } from './db';
import { useLiveQuery } from "dexie-react-hooks";
import './App.css';

function VDialog() {

  const dialog = useSelector((state:any) => state.dialog);

  const options = dialog?.options ?? (dialog?.type === 'confirm' ? ['Cancelar', 'Si'] : ['Cerrar']);

  const dispatch = useDispatch();


  
  function onClose(e:any) {
    const el = e.target;
    let index;
    if (el.tagName === 'BUTTON')
      index = Array.prototype.indexOf.call(el.parentNode.children, el);
    if (dialog.cb) dialog.cb(index);
    dispatch({ type: "alert" })
  }

  return dialog ? <Dialog
    open={!!dialog}
    onClose={onClose}>
    <DialogTitle>
      {dialog.title ?? (dialog.type === 'confirm' ? 'Confirmar' : dialog.type === 'error' ? 'Error' : 'Mensaje')}
    </DialogTitle>
    <DialogContent>
      <DialogContentText style={{ lineBreak: 'anywhere' }} dangerouslySetInnerHTML={{ __html: dialog.msg }} ></DialogContentText>
    </DialogContent>
    <DialogActions style={{
      float: 'none',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      {options.map((e:any, i:any) => (<Button key={i} onClick={onClose} autoFocus={i === options.length - 1}>{e}</Button>))}
    </DialogActions>
  </Dialog> : null

}

function App() {

  const { token, setToken, logOut } = useToken();

  const dispatch = useDispatch();

  const url = useSelector((state:any) => state.url);

  http.onError = (request:any) => {
    dispatch({ type: 'error', msg: ('<b>' + request.url + '</b><br/>' + request.error + '->' + request.message) });
  };

  useEffect(() => {
    App2.addListener('appUrlOpen', (event) => {
      dispatch({ type: 'appUrlOpen', url: event.url });
    });
  }, [dispatch]);

  if (!token) {
    return <><OAuth setToken={setToken} url={url} redirect={(url:any)=>{
      dispatch({ type: 'appUrlOpen', url: url });
    }}/><VDialog /></>
  }

  const disableds:any = useLiveQuery(
    () => db.disabled.toArray()
  );

  const syncronize=()=>{
    if(disableds){
        setTimeout(async () => {
          var data=disableds;
          for(var i=0;i<data.length;i++){
              //console.log(data[i]);
              //var result=await http.get('https://randomuser.me/api/');
             // console.log(result);
          }
        }, 1000);
      }
  }

  Network.getStatus().then((status:any)=>{
    dispatch({type:'networkStatus',status:status});
    if(status.connected){
      syncronize();
    }
  });


  Network.addListener('networkStatusChange',(status:any) => {
    console.log(status);
    dispatch({type:'networkStatus',status:status});
    if(status.connected){
      syncronize();
    }
  });


  const theme = createTheme({
    palette: {
      
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Router basename={import.meta.env.VITE_PUBLIC_URL}>
          <HomePage logOut={logOut} />
        </Router>
        <VDialog />
      </div>
    </ThemeProvider>
  );
}

export default App;