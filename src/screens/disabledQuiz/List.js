import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField,
  TableHead, TableBody, TableRow, TableContainer, Toolbar
} from '@mui/material';
import { Autorenew } from '@mui/icons-material';
import { http ,useResize,useFormState} from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch,useSelector } from "react-redux";
import {
  useNavigate
} from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [page, setPage] = useState(0);

  const [state, setState] = useState({ page: 0 });

  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const friends = useLiveQuery(
    () => db.disabled.toArray()
  );

  const networkStatus = useSelector((state) => state.networkStatus);

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);
    
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - result.rows.length) : 0;

  const handleChangeRowsPerPage = (
    event,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    fetchData(0);
    setPage(0);
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    var f=await db.disabled.toArray();
    var data={data:f?f:[]};
    if(networkStatus.connected){
      
      const result = await http.get('/api/minsa/disabled-quiz/' + page + '/' + rowsPerPage
      +'?' + new URLSearchParams(o).toString()
      );
      data.size=result.size;
      data.data=data.data.concat(result.data);
    }
    setResult(data);
    setState({ page: page });
  };

  const {height,width} = useResize(React);

  useEffect(() => {
      const header = document.querySelector('.MuiToolbar-root');
      const tableContainer = document.querySelector('.MuiTableContainer-root');
      const nav = document.querySelector('nav');
      const toolbarTable = document.querySelector('.Toolbar-table');
      if (tableContainer) {
        tableContainer.style.width = (width - nav.offsetWidth) + 'px';
        tableContainer.style.height = (height - header.offsetHeight
          - toolbarTable.offsetHeight) + 'px';
      }
  }, [height,width]);

  useEffect(() => {
    dispatch({type:'title',title:'Cuestionarios Discapacidad'});
    fetchData(0) 
  }, []);

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {}, {});

  const createOnClick = () => {
    navigate('/create');
  };

  const editOnClick = () => {
    navigate('/' + selected[0] + '/edit');
  }

  const deleteOnClick = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e) => {
        if (e) {
          http.delete('/api/minsa/disabled-quiz/' + selected.join(',')).then((result) => {
            dispatch({type:'snack',msg:'Registro'+(selected.length>1?'s':'')+' eliminado!'});
            onClickRefresh();
          });
        }
      }
    });
  };

  const toID=(row)=>{
    return row._id&&row._id.$oid?row._id.$oid:row.id;
  }
  return (
    <>
      <Toolbar className="Toolbar-table" direction="row" >
        <div style={{
          float: 'none',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <Button disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick}>Editar</Button>
          <Button disabled={!selected.length} startIcon={<DeleteIcon />} onClick={deleteOnClick}>Eliminar</Button>
          <Button onClick={onClickRefresh} endIcon={<Autorenew />} />
        </div>
      </Toolbar>
      <TableContainer sx={{ maxHeight: '100%' }}>
        <Fab color="primary" aria-label="add"
          onClick={createOnClick}
          style={{
            position: 'absolute',
            bottom: 24, right: 24
          }}>
          <AddIcon />
        </Fab>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox">
                <Checkbox
                  style={{ color: 'white' }}
                  indeterminate={selected.length > 0 && selected.length < result.data.length}
                  checked={result&&result.data.length > 0 && selected.length === result.data.length}
                  onChange={onChangeAllRow}
                  inputProps={{
                    'aria-label': 'select all desserts',
                  }}
                />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 80 }}>DNI
                <TextField {...defaultProps('code')}
                style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 260 }}>Nombre Completo
                <TextField {...defaultProps('fullName')}
                style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 80 }}>Edad
                <TextField {...defaultProps('age')} style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 260 }}>Direccion
                <TextField {...defaultProps('address')} style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(result&&result.data?(rowsPerPage> 0
              ? result.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : result.data):[]
            ).map((row, index) => {
              const isItemSelected = isSelected(toID(row));
              return (
                <StyledTableRow
                  style={{backgroundColor:(row._id&&row._id.$oid)?'':(index%2==0?'#f1f19c':'#ffffbb')}}
                  hover
                  onClick={(event) => onClickRow(event, toID(row))}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={index + ' ' + toID(row)}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                    />
                  </TableCell>
                  <TableCell style={{ width: 80 }} align="center">
                    {row.code}
                  </TableCell>
                  <TableCell style={{ width: 260 }} >
                    {row.fullName}
                  </TableCell>
                  <TableCell style={{ width: 80 }} align="center">
                    {row.age}
                  </TableCell>
                  <TableCell style={{ width: 260 }}>
                    {row.address}
                  </TableCell>
                </StyledTableRow >
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={3} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

};

export default List;