import { useEffect, useState, Fragment } from 'react';
import {
    Mail as MailIcon,
    InsertChart as ChartIcon,
    PivotTableChart as PivotTableChartIcon,
    Map as MapIcon,
    Add as AddIcon,
    Quiz as QuizIcon,
    Logout as LogoutIcon,
    Group as GroupIcon,
    AccountCircle as AccountCircleIcon,
    NetworkCell, SignalCellularOff,
    Settings as SettingsIcon
} from '@mui/icons-material';
import {
    Divider, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Toolbar, Checkbox
} from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const VMenu:any = ({ logOut }: any) => {

    const dispatch = useDispatch();

    const handleDrawerToggle = () => {
        dispatch({ type: 'drawer' });
    };

    const connected = useSelector((state: any) => state.connected);

    const [checked,setChecked]=useState(connected);

    const handleToggle = () => {
        setChecked(!connected);
        dispatch({ type: 'connected',connected:!connected });
       
    };

    const [perms, setPerms] = useState([]);

    const items = [
        {
            perms: 'DISABLED_REGISTER', text: 'Evaluación Discapacidad', icon: <QuizIcon />, path: '/', items: [
                { text: 'Agregar', icon: <AddIcon />, path: '/create' }
            ]
        },
        {
            perms: 'DISABLED_REGISTER', text: 'Registro Discapacidad', icon: <QuizIcon />, path: '/register', items: [
                { text: 'Agregar', icon: <AddIcon />, path: '/register/create' }
            ]
        },
        {
            text: 'Configuración', icon: <SettingsIcon />, path: '/setting'
        },
        {
            text: 'Mi cuenta', icon: <AccountCircleIcon />, path: '/profile'
        },
        {
            perms: 'ACCESS_USERS', text: 'Usuarios', icon: <GroupIcon />, path: '/user', items: [
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
            text: 'Conectado', icon: connected ? <NetworkCell /> : <SignalCellularOff />,
             onClick: handleToggle, widget:<Checkbox checked={checked} />
        },
        {
            text: 'Salir', icon: <LogoutIcon />, onClick: () => {
                logOut();
            }
        }
    ]

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
    }, []);

    let navigate = useNavigate();

    return (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {items.filter((e: any) => {
                    return e.perms ? perms.includes(e.perms as never) : true;
                }).map((item: any, index0: any) => (
                    <Fragment key={'List_' + index0} >
                        <ListItem>
                            <ListItemButton onClick={item.onClick ? item.onClick : () => {
                                handleDrawerToggle();
                                navigate(import.meta.env.VITE_BASE+item.path);
                            }}>
                                <ListItemIcon>
                                    {item.icon || <MailIcon />}
                                </ListItemIcon>
                                {item.widget}
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                        {item.items?.map((item: any, index: any) => (
                            <ListItem key={'List_' + index0 + '_' + index} disablePadding style={{ paddingLeft: '40px' }}>
                                <ListItemButton onClick={item.onClick ? item.onClick : () => {
                                    handleDrawerToggle();
                                    navigate(import.meta.env.VITE_BASE+item.path);
                                }}>
                                    <ListItemIcon>
                                        {item.icon || <MailIcon />}
                                    </ListItemIcon>
                                    {item.widget}
                                    <ListItemText primary={item.text} />
                                </ListItemButton>

                            </ListItem>
                        ))}

                    </Fragment>
                ))}
            </List>
            <div>

    BUILD ON: {import.meta.env.VITE_APP_BUILT_ON}
</div>
        </div>
    );

};

export default VMenu;