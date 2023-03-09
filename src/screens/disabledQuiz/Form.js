import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { VRadioGroup } from '../../utils/useToken';
import { db,retrieve } from '../../db';
import {
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Add as AddIcon,
  Room as RoomIcon,
  Search as SearchIcon,
  ContactlessOutlined
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionSummary, AccordionDetails,Alert,
  Box, Button, Card, CardContent, Checkbox, Fab,
  FormControl, FormControlLabel, FormGroup, FormLabel, MenuItem, Radio,
  Stack, InputAdornment, IconButton, TextField
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  useNavigate, useParams, useLocation
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Geolocation } from '@capacitor/geolocation';

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
    dispatch({ type: 'title', title: (pid ? 'Editar' : 'Registrar') + ' Cuestionario' });
    [
      //["/admin/directory/api/town/0/0", "town"],
      ["red", setReds],
      ["microred", setMicroreds],
      //["establishment",setEstablishments]
      ["region", setRegions],
      ["province", setProvinces],
      ["district", setDistricts],
    ].forEach(async (e) => {
      retrieve(e[0],e[1]);
    });
  }, []);

  useEffect(() => {
    if (pid) {
    
        db.disabled.get(isNaN(pid) ? 0 : (1 * pid)).then((e) => {
          if (e) {
            if (e._id && !e._id.$oid) delete e._id;
            set(e);
            onChangeBirthdate(e.birthdate);
          } else if (networkStatus.connected) {
           
            http.get('/api/minsa/disabled-quiz/' + pid).then((result) => {
              if(result.province)
              result.province=result.province.toString().padStart(4, '0');
                if(result.district){
                  result.district=result.district.toString().padStart(6, '0');
                result.region=result.district.toString().substring(0, 2);
                }
                set(result);
                onChangeBirthdate(result.birthdate);
            });
          }
        });
      
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
    http.get('/api/minsa/disabled-quiz/code/' + o.code).then((result) => {
      if(result){
        var no={};
        formCert.set(result);
        no['names']=result.names;
        no['surnames']=result.surnames;
        no['address']=result.address;
        no['search']=o.code;
        no['old']=result._id;
        delete result._id;
        if(result.id){
          no['age']=result.edad;
          no['disability_certificate']='SI';
        }
        set({...o,...no});
      }
    });
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

  const onClickGo = async () => {
    navigate('/' + o.old.$oid + '/edit', { replace: true });
  }

  const onClickAdd = async () => {
    navigate('/create', { replace: true });
  }

  const save=async (o)=>{
    var o2 = JSON.parse(JSON.stringify(o));
      if (networkStatus.connected) {
        http.post('/api/minsa/disabled-quiz', o2).then(async (result) => {
          dispatch({ type: "snack", msg: 'Registro grabado!' });
          if (o.id) {
              await db.disabled.get(1 * o.id).then(async (e) => {
                console.log('get '+e);
                if(e){
                  await db.disabled.delete(1 * o.id);console.log('fc');
                }
              })
          }
          if (!o2._id) {
            console.log(o2);
            if (result._id)
              navigate('/' + result._id.$oid + '/edit', { replace: true });
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
  }

  const onClickSave = async () => {
    const form = formRef.current;

    if (0 || form != null ) {

      
      if(validate(form)){
        
        save(o);
      }else{
        dispatch({
          type: "confirm", msg: 'El formulario esta incompleto. Esta seguro de guardar el registro?', cb: (e) => {
            if (e) {
              set({...o,incomplete:true})
              save(o);
            }
          }
        });    
      }
      
    }/* else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }*/
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

  const dayjs = require('dayjs');

  function onChangeBirthdate(v){

    var age=o.age;
    if(v){
      if(!v.diff)v=dayjs(v);
      age=-v.diff(new Date(),'year');
    }
    set(o => ({...o,birthdate: v,age:age}),()=>{
      console.log('after set');
    });
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Card >
            <CardContent>
              Para la detección de las personas con discapacidad y su instructivo.
            </CardContent>
          </Card>
          <Accordion expanded={true}>
            <AccordionSummary variant="h6" component="div">
              DATOS DE IDENTIFICACION
            </AccordionSummary>
            <AccordionDetails >
              <TextField
                type="number"
                label="DNI"
                inputProps={{maxLength: 8, style: { textAlign: 'center' }}}
                {...defaultProps('code', {
                  InputProps:{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          variant="contained"
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
              <div>
              <Button variant="contained" onClick={onClickGo} color="primary">
        Ver Datos
      </Button>
      </div>
              </Alert>}
              <TextField
                label="Apellidos"
                {...defaultProps('surnames')}
                inputProps={{ maxLength: '50' }}
              />
              <TextField
                label="Nombres"
                {...defaultProps('names')}
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
                {...defaultProps("age")}
                label="Edad"
                type="number"
              />
              <TextField
                multiline
                label="Dirección"
                {...defaultProps('address')}
                inputProps={{ maxLength: 250 }}
              />
              <FormControl>
                <TextField 
                  label="Geolocación"
                  inputProps={{style: { textAlign: 'center' }}}
                  value={o.location ? (JSON.stringify(o.location.coordinates)) : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          variant="contained"
                          aria-label="Obtener Coordenadas"
                          onClick={onClickGeolocation}
                          color="primary"
                        >
                          {<RoomIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button startIcon={<RoomIcon />} variant="contained" onClick={onClickGeolocation} color="primary">
                  Obtener Coordenadas
                </Button>
              </FormControl>
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
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              CONDUCTA, COMPRENSIÓN Y COMUNICACIÓN
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("a1")}
                label="¿Comprende órdenes simples? por ejemplo: dame la pelota, toma el cuaderno, abre la puerta."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("a2")}
                label="¿Escucha?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("a3")}
                label="¿Mira?."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("a4")}
                label="¿Habla?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("a5")}
                label="¿Comienza y mantiene una conversación?."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("a6")}
                label="¿Analiza y encuentra soluciones a los problemas de la vida cotidiana? por ejemplo ¿qué hace, tiene frío o hambre?."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              MOVILIDAD
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("b1")}
                label="¿Puede caminar?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("b2")}
                label="¿Puede mover brazos y manos?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("b3")}
                label="¿Tiene ausencia de alguna extremidad del cuerpo?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              {o.b3 === 'SI' &&
                <FormControl>
                  <FormGroup>
                    <FormLabel>¿Cuál es la extremidad que le falta?</FormLabel>
                    <FormControlLabel control={<Checkbox name="b4_1" checked={o.b4_1 ?? false} onChange={handleChange} />} label="Brazo" />
                    <FormControlLabel control={<Checkbox name="b4_2" checked={o.b4_2 ?? false} onChange={handleChange} />} label="Mano" />
                    <FormControlLabel control={<Checkbox name="b4_3" checked={o.b4_3 ?? false} onChange={handleChange} />} label="Pierna" />
                    <FormControlLabel control={<Checkbox name="b4_4" checked={o.b4_4 ?? false} onChange={handleChange} />} label="Pie" />
                    <FormControlLabel control={<Checkbox name="b4_5" checked={o.b4_5 ?? false} onChange={handleChange} />} label="Otro" />
                  </FormGroup>
                  {
                    o.b4_5 === true && <TextField
                      {...defaultProps("b4_5_o")}
                      label="Otro"
                    />
                  }
                </FormControl>
              }
              <VRadioGroup
                {...defaultProps("b5")}
                label="¿Depende de una persona para movilizarse?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("b6")}
                label="¿Usa algún dispositivo para movilizarse?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              {
                o.b6 === 'SI' && <FormControl>
                  <FormGroup>
                    <FormLabel>¿Qué dispositivo usa para movilizarse?</FormLabel>
                    <FormControlLabel control={<Checkbox name="b7_1" checked={o.b7_1 ?? false} onChange={handleChange} />} label="Bastón" />
                    <FormControlLabel control={<Checkbox name="b7_2" checked={o.b7_2 ?? false} onChange={handleChange} />} label="Andador" />
                    <FormControlLabel control={<Checkbox name="b7_3" checked={o.b7_3 ?? false} onChange={handleChange} />} label="Silla de ruedas" />
                    <FormControlLabel control={<Checkbox name="b7_4" checked={o.b7_4 ?? false} onChange={handleChange} />} label="Otro" />
                  </FormGroup>
                  {
                    o.b7_4 === true && <TextField
                      {...defaultProps("b7_4_o")}
                      label="Otro"

                    />
                  }
                </FormControl>
              }
              <VRadioGroup
                {...defaultProps("b8")}
                label="¿Puede estar de pie por largos períodos de tiempo, como por ejemplo 30 minutos?."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("b9")}
                label="¿Puede desplazarse fuera de su hogar?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              CUIDADO PERSONAL
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("c1")}
                label="¿Puede comer sus alimentos solo?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("c2")}
                label="¿Puede vestirse solo?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("c3")}
                label="¿Puede lavarse todo el cuerpo, bañarse?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              RELACIONARSE CON OTRAS PERSONAS
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("d1")}
                label="¿Se relaciona con personas que conoce?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("d2")}
                label="¿Se relaciona con personas que no conoce?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("d3")}
                label="¿Realiza actividad sexual?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >ACTIVIDADES FRECUENTES
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("e1")}
                label="¿Se ocupa de las actividades domésticas? Por ejemplo cocinar, limpiar la casa, lavar la ropa."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("e2")}
                label="¿Presenta dificultades para trabajar?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("e3")}
                label="¿Presenta dificultades para estudiar?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >PARTICIPACIÓN EN LA SOCIEDAD
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("f1")}
                label="¿Participa en actividades de su comunidad? Por ejemplo: festividades, actividades religiosas."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("f2")}
                label="¿Se le presentan barreras u obstáculos para participar? por ejemplo, inadecuada infraestructura para desplazarse o actividades de rechazo."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              INFORMACIÓN SOBRE MENORES DE 5 AÑOS
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("g1")}
                label="¿Cuenta con el Carné de Crecimiento y Desarrollo? (Se le pide a la persona cuidadora que enseñe el carné)"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("g2")}
                label="¿El personal de salud anotó alguna observación sobre el desarrollo de su niño/a?."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              {
                o.g2 === 'SI' && <TextField
                  {...defaultProps("g3")}
                  label="¿Qué observación le hizo?"
                  multiline
                />
              }
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              INFORMACIÓN SOBRE UNA EVENTUALIDAD O EMERGENCIA
            </AccordionSummary>
            <AccordionDetails>
              <VRadioGroup
                {...defaultProps("h1")}
                label="¿Qué tipo de transporte usa?"
              >
                <FormControlLabel value="Público" control={<Radio />} label="Público" />
                <FormControlLabel value="Privado" control={<Radio />} label="Privado" />
              </VRadioGroup>
              <VRadioGroup
                {...defaultProps("h2")}
                label="Ante algún evento desagradable (por ejemplo, terremoto, incendio, accdidente en el hogar) ¿Sabe usted como actuar?."
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              {
                o.h2 === 'SI' && <TextField
                  {...defaultProps("h2_1")}
                  label="¿Cómo?"
                  maxLength={450}
                  multiline
                />
              }
              <VRadioGroup
                {...defaultProps("h3")}
                label="¿Conoce un plan de emergencia?"
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </VRadioGroup>
              {
                o.h3 === 'SI' && <TextField
                  label="¿Cuál?"
                  name="h3_1"
                  multiline
                  value={o.h3_1}
                  onChange={handleChange}
                />
              }
            </AccordionDetails>
          </Accordion>
          {o.muni?<Accordion expanded={true}>
            <AccordionSummary variant="h6" component="div">
              REGISTRO MUNICIPACIDAD
            </AccordionSummary>
            <AccordionDetails >
               <TextField
                {...defaultProps("type",{ required:false})}
                label="Tipo discapacidad"
                multiline
                
                 
                
                inputProps={ { readOnly: true,required:false }}
              />
              <TextField
                {...defaultProps("other_type",{ required:false})}
                label="Otro tipo"
                multiline
                inputProps={ { readOnly: true, }}
              />
              <TextField
                {...defaultProps("devices",{ required:false})}
                label="Dispositivos requeridos"
                multiline
                inputProps={ { readOnly: true, }}
              />
            </AccordionDetails>
          </Accordion>:null}
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