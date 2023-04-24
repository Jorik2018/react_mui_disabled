import React, { useState, useEffect, createRef } from 'react';
import { useFormState, http, useResize } from 'gra-react-utils';
import {
  Send as SendIcon,
  Add as AddIcon,
   SetMealOutlined
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionDetails, 
  Box, Button, Checkbox, Fab, MenuItem, 
  RadioGroup, Stack, TextField
} from '@mui/material';
import {
  useNavigate, useParams, useLocation
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { db,retrieve } from '../db';

export const Form = () => {

  const dispatch = useDispatch();

  const location = useLocation();

  const { uid } = useParams();

  const formRef = createRef();

  const viewRef = createRef();

  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);

  const [provinces, setProvinces] = useState([]);

  const [districts, setDistricts] = useState([]);

  const [reds, setReds] = useState([]);

  const [microreds, setMicroreds] = useState([]);

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    'status': '1',
  }, {});

  const [open] = useState(true);

  useEffect(() =>  {
    dispatch({ type: 'title', title: 'Configuración' });
    [
      ["red",setReds],
      ["microred",setMicroreds],
      ["region",setRegions],
      ["province",setProvinces],
      [ "district",setDistricts]
    ].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
    

    try {
      var s = localStorage.getItem("setting");
      if (s) {
        s = JSON.parse(s);
        var o = {};
        o.red = s.red;
        o.microred = s.microred;
        o.region = s.region;
        o.province = s.province;
        o.district = s.district;
        o.establishment = s.establishment;
        o.town = s.town;
        set(o);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useResize(({ width, height }) => {
    if (formRef.current) {
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - toolBar.offsetHeight) + 'px';
      toolBar.style.width = width + 'px';
    }
  },viewRef);

  const onClickRetrieve = () => {
    [
      ["red", setReds],
      ["microred", setMicroreds],
      ["region", setRegions],
      ["province", setProvinces],
      ["district", setDistricts],
    ].forEach(async (e) => {
      retrieve(e[0],e[1],true);
    });
    //navigate(-1);
  }

  const onClickAdd = () => {
    navigate('/user/create', { replace: true });
  }

  const onClickSave = () => {
    localStorage.setItem("setting", JSON.stringify(o));
    dispatch({ type: "snack", msg: 'Registro grabado!' });
  };

  useEffect(() => {
    const form = formRef.current;
    if (form != null) {
      return bindEvents(form);
    }
  }, [o, open]);

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function getActions() {
    return <>
      <Button onClick={onClickRetrieve} color="primary" variant="contained">
        Recuperar
      </Button>
      <Button  onClick={onClickSave} color="primary" endIcon={<SendIcon />} variant="contained">
        Grabar
      </Button>
    </>
  }

  function getContent() {
    return <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Accordion expanded={true}>
            <AccordionDetails >
            <TextField
                select
                label="Región"
                {...defaultProps("region")}
              >
                {regions.map((item, i) => (
                  <MenuItem key={'region_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Provincia"
                {...defaultProps("province")}
              >
                {provinces.filter((e)=>e.code.startsWith(o['region'])).map((item, i) => (
                  <MenuItem key={'province_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Distrito"
                {...defaultProps("district")}
              >
                {districts.filter((e)=>e.code.startsWith(o['province'])).map((item, i) => (
                  <MenuItem key={'district_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Red"
                {...defaultProps("red")}
              >
                {reds.map((item, i) => (
                  <MenuItem key={'red_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Microred"
                {...defaultProps("microred")}
              >
                {microreds.filter((e)=>e.code.startsWith(o['red'])).map((item, i) => (
                  <MenuItem key={'microred_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </AccordionDetails>
          </Accordion>


        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#1976d2' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

        {o._id && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>}
      </form>
  }
  return <>{
    1 == 1 ? <Box ref={viewRef} style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}