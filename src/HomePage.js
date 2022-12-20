import React, { useEffect } from 'react';
import {
  Mail as MailIcon,
  Menu as MenuIcon,
  InsertChart as ChartIcon,
  PivotTableChart as PivotTableChartIcon,
  Map as MapIcon,
  Add as AddIcon,
  Quiz as QuizIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Alert, AppBar, Box, CssBaseline, Drawer, Divider, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Snackbar, Toolbar,
  Typography
} from '@mui/material';
import { debounce, http } from 'gra-react-utils';
import lazyLoader from "./utils/LazyLoader";

import {
  Routes,
  Route, useLocation,
  useNavigate
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function VDrawer(props) {
  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "drawer" }) };
  const drawer = useSelector((state) => state.drawer);
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
  const snack = useSelector((state) => state.snack);

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

function VAppBar(props) {

  const networkStatus = useSelector((state) => state.networkStatus);

  return <AppBar style={{ 'background': networkStatus.connected ? '' : 'red' }} {...props}
    position="fixed"
  >{props.children}</AppBar>;

}

const HomePage = ({ logOut ,match }) => {

  const [o, setO] = React.useState({ title: 'Cuestionarios Discapacidad' });

  const [perms, setPerms] = React.useState([]);

  const dispatch = useDispatch();

  const title = useSelector((state) => state.title);

  const handleDrawerToggle = () => {
    dispatch({ type: 'drawer' });
  };

  const items = [
    {
      perms:'DISABLED_REGISTER',text: 'Cuestionarios Discapacidad', icon: <QuizIcon />, path: '/', items: [
        { text: 'Agregar', icon: <AddIcon />, path: '/create' }
      ]
    },
    {
      text: 'Configuración', icon: <SettingsIcon />, path: '/setting'
    },
    {
      text: 'Mi cuenta', icon: <AccountCircleIcon />, path: '/profile'
    },
    {
      perms:'ACCESS_USERS',text: 'Usuarios', icon: <GroupIcon />, path: '/user', items: [
        { text: 'Agregar', icon: <AddIcon />, path: '/user/create' }
      ]
    },
    {
      text: 'Graficos', icon: <ChartIcon />, path: '/charts'
    },
    {
      text: 'Mapa', icon: <MapIcon />, path: '/map'
    },
    {
      text: 'Pivot', icon: <PivotTableChartIcon />, path: '/pivot'
    },
    {
      text: 'Salir', icon: <LogoutIcon />, onClick: () => {
        logOut();
      }
    }
  ]

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {items.filter((e)=>{
            return e.perms?perms.includes(e.perms):true;
        }).map((item, index0) => (
          <React.Fragment key={'List_' + index0} >
            <ListItem>
              <ListItemButton onClick={item.onClick ? item.onClick : () => {
                handleDrawerToggle();
                navigate(process.env.PUBLIC_URL+item.path);
              }}>
                <ListItemIcon>
                  {item.icon || <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={item.text} />

              </ListItemButton>
            </ListItem>
            {item.items?.map((item, index) => (
              <ListItem key={'List_' + index0 + '_' + index} disablePadding style={{ paddingLeft: '40px' }}>
                <ListItemButton onClick={item.onClick ? item.onClick : () => {
                  handleDrawerToggle();
                  navigate(process.env.PUBLIC_URL+item.path);
                }}>
                  <ListItemIcon>
                    {item.icon || <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />

                </ListItemButton>
              </ListItem>
            ))}

          </React.Fragment>
        ))}
      </List>
    </div>
  );

  let location = useLocation();

  useEffect(() => {
    try {
      var s = localStorage.getItem("perms");
      if (s) {
        s = JSON.parse(s);
        setPerms(s);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    const debouncedHandleResize = debounce((width, height) => {
      const header = document.querySelector('.MuiToolbar-root');
      const body = formRef.current;
      if (body)
        body.style.height = (height - header.offsetHeight * 0) + 'px';
    });
    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize)
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [location]);

  const drawerWidth = 240;

  const formRef = React.createRef();

  let navigate = useNavigate();

  const ChartPanel = lazyLoader(() => import('./screens/Charts'));

  const MapPanel = lazyLoader(() => import('./screens/Map'));

  const DisabledQuizList = lazyLoader(() => import('./screens/disabledQuiz/List'));

  const DisabledQuizForm = lazyLoader(() => import('./screens/disabledQuiz/Form')
    .then(module => ({ default: module.Form }))
  );

  const UserList = lazyLoader(() => import('./screens/user/List'));

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
          {drawer}
        </VDrawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box ref={formRef}
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar className="_" />
        <Routes>
          <Route index element={perms.includes('DISABLED_REGISTER')?<DisabledQuizList />:<ChartPanel />} />
          <Route path={`/create`} element={<DisabledQuizForm />} />
          <Route path={`${match.url}/:pid/edit`} element={<DisabledQuizForm />} />
          <Route path={`${match.url}/user`} element={<UserList setO={setO} />} />
          <Route path={`${match.url}/user/create`} element={<UserForm />} />
          <Route path={`${match.url}/user/:uid/edit`} element={<UserForm />} />
          <Route path={`${match.url}/charts`} element={<ChartPanel />} />
          <Route path={`${match.url}/map`} element={<MapPanel />} />
          <Route path={`${match.url}/setting`} element={<SettingForm />} />
          <Route path={`/profile`} element={<ProfileForm />} />
          <Route path={`/pivot`} element={<PivotTable />} />
        </Routes>
      </Box>

      <VSnackbar />
    </Box>
  );

};

export default HomePage;