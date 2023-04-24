import { useEffect, useState, createRef } from 'react';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  Alert, AppBar, Box, CssBaseline, Drawer, IconButton, Snackbar, Toolbar,
  Typography
} from '@mui/material';
import { lazyLoader, useResize } from 'gra-react-utils';
import VMenu from './Menu';
import {
  Routes,
  Route
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function VDrawer(props: any) {
  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "drawer" }) };
  const drawer = useSelector((state: any) => state.drawer);
  return <Drawer variant="temporary"
    open={drawer}
    onClose={onClose}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{
      display: { xs: 'block', sm: 'none' },
      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
    }}>
    {props.children}
  </Drawer>
}

function VSnackbar() {
  const snack = useSelector((state: any) => state.snack);

  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "snack" }) };

  return <Snackbar open={!!snack}
    sx={{ bottom: 70 }}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    autoHideDuration={2000} onClose={onClose}>
    {<Alert severity="success" variant="filled" onClose={onClose} sx={{ width: '100%' }}>
      {snack ? snack.msg : ''}
    </Alert>
    }
  </Snackbar>;
}

function VAppBar(props: any) {

  const connected = useSelector((state: any) => {
    return state.networkStatus.connected&&(state.connected==null||state.connected)
  });

  return <AppBar style={{ 'background': connected ? '' : 'red' }} {...props}
    position="fixed"
  >{props.children}</AppBar>;

}

const HomePage:any = ({ logOut }: any) => {

  const setO = useState({ title: 'Cuestionarios Discapacidad' })[1];

  const [perms, setPerms] = useState([]);

  const b=[null];

  const dispatch = useDispatch();

  const title = useSelector((state: any) => state.title);

  const handleDrawerToggle = () => {
    dispatch({ type: 'drawer' });
  };

  useEffect(() => {
    try {
      let s: any = localStorage.getItem("perms");
      if (s) {
        s = JSON.parse(s);
        setPerms(s);
        
      }
    } catch (e: any) {
      console.log(e);
    }
    console.log('homemounted');
    b[0]=(formRef.current);
  }, []);

  const formRef = createRef();

  useResize(({width,height}:any)=>{
    const header: any = document.querySelector('.MuiToolbar-root');
    const nav:any = document.querySelector('nav');
    const body: any = b[0]//formRef.current;
    if (body){
      body.style.height = (height - header.offsetHeight * 0) + 'px';
      Array.prototype.forEach.call(body.children, (x) =>{
        var event:any = new CustomEvent("parentResize", { bubbles: true });
        event.height = (height - header.offsetHeight);
        event.width =  (width - nav.offsetWidth);
        //console.log('event.height='+event.height)
        x.dispatchEvent(event);
      });
    }
  });

  const drawerWidth = 240;

  const ChartPanel: any = lazyLoader(() => import('./screens/Charts'));

  const MapPanel = lazyLoader(() => import('./screens/Map'));

  const DisabledQuizList = lazyLoader(() => import('./screens/disabledQuiz/List'));

  const DisabledQuizForm = lazyLoader(() => import('./screens/disabledQuiz/Form')
    .then(module => ({ default: module.Form }))
  );

  const DisabledList: any = lazyLoader(() => import('./screens/disabled/List'));

  const DisabledForm = lazyLoader(() => import('./screens/disabled/Form')
    .then(module => ({ default: module.Form }))
  );

  const UserList: any = lazyLoader(() => import('./screens/user/List'));

  const PivotTable = lazyLoader(() => import('./screens/disabledQuiz/PivotTable'));

  const UserForm = lazyLoader(() => import('./screens/user/Form')
    .then(module => ({ default: module.Form }))
  );

  const ProfileForm = lazyLoader(() => import('./screens/Profile')
    .then(module => ({ default: module.Form }))
  );

  const SettingForm = lazyLoader(() => import('./screens/Setting')
    .then(module => ({ default: module.Form }))
  );



  return (
    <Box
      sx={{ display: 'flex' }}>
      <CssBaseline />
      <VAppBar
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </VAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <VDrawer

          onClose={handleDrawerToggle}
          width={drawerWidth}
        >
          <VMenu logOut={logOut}/>
        </VDrawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <VMenu/>
        </Drawer>
      </Box>

      <Box ref={formRef}
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar className="_" />
        <Routes >
          <Route index element={perms.includes('DISABLED_REGISTER') ? <DisabledQuizList /> : <ChartPanel />} />
          <Route path={`/create`} element={<DisabledQuizForm />} />
          <Route path={`/:pid/edit`} element={<DisabledQuizForm />} />

          <Route path={`/register`} element={<DisabledList setO={setO} />} />
          <Route path={`/register/create`} element={<DisabledForm />} />
          <Route path={`/register/:pid/edit`} element={<DisabledForm />} />

          <Route path={`/user`} element={<UserList setO={setO} />} />
          <Route path={`/user/create`} element={<UserForm />} />
          <Route path={`/user/:uid/edit`} element={<UserForm />} />
          <Route path={`/charts`} element={<ChartPanel />} />
          <Route path={`/map`} element={<MapPanel />} />
          <Route path={`/setting`} element={<SettingForm />} />
          <Route path={`/profile`} element={<ProfileForm />} />
          <Route path={`/pivot`} element={<PivotTable />} />
        </Routes>
      </Box>

      <VSnackbar />
    </Box>
  );

};

export default HomePage;