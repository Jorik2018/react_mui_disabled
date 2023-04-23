import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { VRadioGroup } from '../../utils/useToken';
import { db } from '../../db';

import {
  Send as SendIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionSummary, AccordionDetails,Alert,
  Box, Button, Checkbox, Fab, FormControlLabel, FormGroup, MenuItem, Radio,
  Stack, InputAdornment, IconButton, TextField
} from '@mui/material';
import {
  useNavigate, useParams, useLocation
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Geolocation } from '@capacitor/geolocation';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);

  const [provinces, setProvinces] = useState([]);

  const [districts, setDistricts] = useState([]);

  const [old, setOld] = useState(null);

  const [reds, setReds] = useState([]);

  const [microreds, setMicroreds] = useState([]);


  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    'houseAccess': '',
    'instructionGrade': '',
    'maritalStatus': '',
    'typeInsurance': '',
    'belongsAssociation': '',
    'carerRequired': ''
  }, {});
  const [cert, formCert] = useFormState(useState, {}, {});

  const [open] = useState(true);

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Editar' : 'Registrar') + ' Registro' });
    [
      //["/admin/directory/api/town/0/0", "town"],
      ["red", setReds],
      ["microred", setMicroreds],
      //["/admin/desarrollo-social/api/establishment/0/0", "establishment"],
      ["region", setRegions],
      ["province", setProvinces],
      ["district", setDistricts],
      // ["/api/poll/sample/0/0", "sample"],
    ].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get('/api/minsa/disabled-quiz/' + pid).then((result) => {
          
            set(result);
        });
      }
    }else{
      try {
        var s = localStorage.getItem("setting");
        if (s) {
          s = JSON.parse(s);
          var o2 = {};
          o2.red = s.red;
          o2.microred = s.microred;
          o2.region = s.region;
          o2.province = s.province;
          o2.district = s.district;
          o2.establishment = s.establishment;
          //o.town = s.town;
          set({...o,...o2});
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [pid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickSearch = () => {
    //33254965
   
  };

  const onClickGeolocation = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    const coords = coordinates.coords;
    set(o => ({
      ...o, location: {
        type: 'Point',
        coordinates: [coords.longitude, coords.latitude],
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed
      }
    }));
  };

  const onClickAdd = async () => {
    navigate('/register/create', { replace: true });
  }

  function onChangeBirthdate(v){
    var age=o.age;
    if(v){
      age=-v.diff(new Date(),'year');
    }
    set(o => ({...o,birthdate: v,age:age}),()=>{
      console.log('after set');
    });
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {
      
      var o2 = JSON.parse(JSON.stringify(o));
      if (networkStatus.connected) {
        http.post('/api/minsa/disabled-quiz/', o2).then(async (result) => {
          dispatch({ type: "snack", msg: 'Registro grabado!' });
          if (!o2._id) {
            console.log(o2);
            if (result.id)
              navigate('/register/' + result.id + '/edit', { replace: true });
            else
              navigate(-1);
          }
        });

      } else {
        if (!o2.id) {
          o2.tmpId = 1 * new Date();
          o2.id = -o2.tmpId;
          //await db.disabled.add(o2);
          navigate('/' + o2.id + '/edit', { replace: true });
        } else {
          //await db.disabled.update(o2.id, o2);
        }
        dispatch({ type: "snack", msg: 'Registro grabado!' });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  /* useEffect(() => {
     const form = formRef.current;
     if (form != null) {
       return bindEvents(form);
     }
   }, [o, open]);*/

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
      <Button variant="contained" onClick={onClickCancel} color="primary">
        Cancelar
      </Button>
      <Button disabled={o.old&&!o.confirm} variant="contained" onClick={onClickSave} color="primary" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Accordion expanded={true}>
            <AccordionSummary variant="h6" component="div">
              DATOS DE IDENTIFICACION
            </AccordionSummary>
            <AccordionDetails >
              <TextField
                type="number"
                label="DNI"
                inputProps={{maxlength: 8, style: { textAlign: 'center' }}}
                {...defaultProps('code', {

                  InputProps:{
                    
                    
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          variant="contained"
                          aria-label="Obtener Coordenadas"
                          onClick={onClickSearch}
                          color="primary"
                        >
                          {<SearchIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  },

                  onBlur: () => { 
                    if(!pid&&o.code&&o.search!=o.code){
                      onClickSearch();
                    }
                  }
                })}

              />
              {cert.id&&<Alert severity="success">Esta persona tiene certificado de discapacidad con codigo <b>{cert.id}</b>.
              <FormGroup>
              </FormGroup>
              </Alert>}
              {o.old&&<Alert severity="warning">Esta persona ya se encuentra registrada, 
              desea confirmar cambiar el registro con los datos actuales?.
              <FormGroup>
                <FormControlLabel  control={<Checkbox name="confirm" checked={o.confirm ?? false} onChange={handleChange} />} label="Confirmar" />
              </FormGroup>
              </Alert>}
              <TextField
                label="Nombres"
                {...defaultProps('names')}
                inputProps={{ maxLength: '50' }}
              />
              <TextField
                label="Apellidos"
                {...defaultProps('surnames')}
                inputProps={{ maxLength: '50' }}
              />
                            <MobileDatePicker
          inputFormat="DD/MM/YYYY"
          label="Fecha Nacimiento"
          value={o.birthdate||''}
          onChange={onChangeBirthdate}
          renderInput={(params) =>
             <TextField  {...params} />}
        />
              
              <TextField
                multiline
                label="Dirección"
                {...defaultProps('address')}
                inputProps={{ maxLength: 250 }}
              />
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
              {o.region != null && <TextField
                select
                label="Provincia"
                {...defaultProps("province")}
              >
                {provinces.filter((e) => e.code.startsWith(o['region'])).map((item, i) => (
                  <MenuItem key={'province_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              }
              {o.province != null && <TextField
                select
                label="Distrito"
                {...defaultProps("district")}
              >
                {districts.filter((e) => e.code.startsWith(o['province'])).map((item, i) => (
                  <MenuItem key={'district_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>}
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
              {o.red != null && <TextField
                select
                label="Microred"
                {...defaultProps("microred")}
              >
                {microreds.filter((e) => e.code.startsWith(o['red'])).map((item, i) => (
                  <MenuItem key={'microred_' + i} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>}
              <TextField
                select
                label="Acceso a la vivienda"
                {...defaultProps("houseAccess")}
              >
                {['Facil', 'Accidentado', 'Otro'].map((item, i) => (
                  <MenuItem key={'houseAccess_' + i} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                {...defaultProps("occupation")}
                label="Ocupación"
              />
              <TextField
                select
                {...defaultProps("instructionGrade")}
                label="Grado de Instrucción"
              >
                {
                  [
                    'Inicial',
                    'Primaria',
                    'Secundaria',
                    'Técnico',
                    'Superior',
                    'PRITE',
                    'CEBE',
                    'CEBA',
                    'Educación Inclusiva',
                    'Analfabeto',
                    'Otro'
                  ].map((e, i) => <MenuItem key={'instructionGrade_' + i} value={e}>{e}</MenuItem>)
                }
              </TextField>
              <TextField
                select
                {...defaultProps("maritalStatus")}
                label="Estado Civil"
              >
                {
                  [
                    'Soltero/a',
                    'Casado/a',
                    'Divorciado/a',
                    'Conviviente',
                    'Viudo/a'
                  ].map((e, i) => <MenuItem key={'maritalStatus_' + i} value={e}>{e}</MenuItem>)
                }
              </TextField>
              <TextField
                select
                {...defaultProps("typeInsurance")}
                label="Tipo de Seguro"
              >
                {
                  [
                    'SIS',
                    'ESSALUD',
                    'Otro',
                    'No tiene'
                  ].map((e, i) => <MenuItem key={'typeInsurance_' + i} value={e}>{e}</MenuItem>)
                }
              </TextField>
              <TextField
                {...defaultProps("medicalReport")}
                label="Informe Medico"
                multiline
              />
              <VRadioGroup
                {...defaultProps("disability_certificate")}
                label="¿Tiene certificado de discapacidad?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              {
                o.disability_certificate === 'SI' && <TextField
                  {...defaultProps("nro_certificate")}
                  label="Numero certificado"
                />
              }
              
              <TextField
                select
                {...defaultProps("belongsAssociation")}
                label='Pertenece a alguna asociación'
              >
                {['SI', 'NO'].map((item, i) => (
                  <MenuItem key={'belongsAssociation_' + i} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>

              {
                o.belongsAssociation === 'SI' && <TextField
                  {...defaultProps("association")}
                  label="Especifique cuál asociación"
                  multiline
                />
              }
              <TextField
                {...defaultProps("mainPhone")}
                label="Teléfono fijo / Celular"
              />
              <TextField
                {...defaultProps("otherPhone")}
                label="Teléfono fijo / Celular"
              />
              <VRadioGroup
                {...defaultProps("carerRequired")}
                label="¿Requiere cuidador?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>

              {
                o.carerRequired === 'SI' && <>
                  <TextField
                    {...defaultProps("carer")}
                    label="Nombre de la persona cuidadora"
                  />
                  <TextField
                    {...defaultProps("carerPhone")}
                    label="Teléfono de la persona cuidadora"
                  /><TextField
                    {...defaultProps("carerMail")}
                    label="Correo Electrónico"
                  />
                </>
              }
              <TextField
                select
                {...defaultProps("type")}
                label="Tipo discapacidad"
              
              >
                {
                  [
                    'ALTA',
                    'MODERADA',
                    'LEVE'
                  ].map((e, i) => <MenuItem key={'severity_' + i} value={e}>{e}</MenuItem>)
                }
              </TextField>
              <TextField
                {...defaultProps("other_type")}
                label="Otro tipo"
                multiline
              />
               <TextField
                select
                {...defaultProps("severity")}
                label="Severidad"
              >
                {
                  [
                    'ALTA',
                    'MODERADA',
                    'LEVE'
                  ].map((e, i) => <MenuItem key={'severity_' + i} value={e}>{e}</MenuItem>)
                }
              </TextField>
              <TextField
                {...defaultProps("devices")}
                label="Dispositivos requeridos"
                multiline
              />
              
            </AccordionDetails>
          </Accordion>
        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#1976d2' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

        {(o._id || o.id) && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>}
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}