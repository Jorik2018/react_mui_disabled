import { useState, useEffect , useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import dayjs from 'dayjs';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar
} from '@mui/material';
import { Autorenew } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate
} from "react-router-dom";

const HeaderTableCell:any = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  '& > span': {
    display: 'table-cell',
    verticalAlign: 'middle',
    height: 70,
    width: 1000
  },
  '& .MuiFormControl-root': {
    padding: 0, marginTop: '5px !important'
  }

}));

const StyledTableRow:any = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  }
}));

const List = () => {

  const tableRef = useRef();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = useState([]);

  const isSelected = (code:any) => selected.indexOf(code) !== -1;

  const online = useSelector((state:any) => {
    return state.networkStatus.connected&&(state.connected==null||state.connected)
  });

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row:any) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event:any, code:any) => {
    const selectedIndex = selected.indexOf(code);
console.log(event);
    let newSelected:any = [];
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

  const onPageChange = (
    event:any, page:any
  ) => {
    console.log(event);
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event:any
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page:any) => {
    var f = await db.disabled.toArray();
    var data:any = { data: f ? f : [] };
    if (online) {
      const result = await http.get('/api/minsa/disabled-quiz/' + page + '/' + state.rowsPerPage
        + '?' + new URLSearchParams(o).toString()
      );
      data.size = result.size;
      data.data = data.data.concat(result.data);
      data.data.forEach(r=>{
        if(r.birthdate)
        r.age=-dayjs(r.birthdate).diff(new Date(),'year');;
      });
    }
    setResult(data);


  };

  useResize(({height, width}:any) => {
    const tableContainer:any = document.querySelector('.MuiTableContainer-root');
    const toolbarTable:any = document.querySelector('.Toolbar-table');
    const tablePagination:any = document.querySelector('.MuiTablePagination-root');
    if (tableContainer) {
      toolbarTable.style.width = width  + 'px';
      tableContainer.style.width = width + 'px';
      tableContainer.style.height = (height - toolbarTable.offsetHeight-tablePagination.offsetHeight) + 'px';
    }
  }, tableRef);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Registro Discapacidad' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const [o, { defaultProps }]:any = useFormState(useState, {});

  const createOnClick = () => {
    navigate('/register/create');
  };

  const editOnClick = () => {
    navigate('/register/' + selected[0] + '/edit');
  }

  const deleteOnClick = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e:any) => {
        if (e) {
          http.delete('/api/minsa/disabled-quiz/' + selected.join(',')).then((result:any) => {
            console.log(result)
            dispatch({ type: 'snack', msg: 'Registro' + (selected.length > 1 ? 's' : '') + ' eliminado!' });
            onClickRefresh();
          });
        }
      }
    });
  };
  
  function getAge(dateString:any) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const toID = (row:any) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }

  const emptyRows = result.data && result.data.length;

  return (
    <>
      <Toolbar className="Toolbar-table" >
        
          <Button disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick}>Editar</Button>
          <Button disabled={!selected.length} startIcon={<DeleteIcon />} onClick={deleteOnClick}>Eliminar</Button>
          <Button onClick={onClickRefresh} endIcon={<Autorenew />} />
        
      </Toolbar>
      <TableContainer sx={{ maxHeight: '100%' }} ref={tableRef}>
        <Fab color="primary" aria-label="add"
          onClick={createOnClick}
          style={{
            position: 'absolute',
            bottom: 72, right: 24
          }}>
          <AddIcon />
        </Fab>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <HeaderTableCell padding="checkbox">
                <Checkbox
                  style={{ color: 'white' }}
                  indeterminate={selected.length > 0 && selected.length < result.data.length}
                  checked={result && result.data.length > 0 && selected.length === result.data.length}
                  onChange={onChangeAllRow}
                  inputProps={{
                    'aria-label': 'select all desserts',
                  }}
                />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 80 }}><span>DNI</span>
                <TextField {...defaultProps('code')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 260 }}><span>Nombre Completo</span>
                <TextField {...defaultProps('fullName')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 80 }}><span>Edad</span>
                <TextField {...defaultProps('age')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 260 }}><span>Dirección</span>
                <TextField {...defaultProps('address')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 100 }}><span>Telefono</span>
                <TextField {...defaultProps('mainPhone')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 130 }}><span>Cuenta con certificado de discapacidad?</span>
                <TextField {...defaultProps('disability_certificate')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 260 }}><span>Provincia</span>
                <TextField {...defaultProps('province')} />
              </HeaderTableCell>
              <HeaderTableCell style={{ minWidth: 260 }}><span>Distrito</span>
                <TextField {...defaultProps('district')} />
              </HeaderTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(result && result.data && result.data.length ? result.data : [])
              .map((row:any, index:any) => {
                const isItemSelected = isSelected(toID(row));
                return (
                  <StyledTableRow
                    style={{ backgroundColor: (1) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
                    hover
                    onClick={(event:any) => onClickRow(event, toID(row))}
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
                      {row.surnames} {row.names}
                    </TableCell>
                    <TableCell style={{ width: 80 }} align="center">
                      {getAge(row.birthdate)}
                    </TableCell>
                    <TableCell style={{ width: 260 }}>
                      {row.address}
                    </TableCell>
                    <TableCell style={{ width: 100 }}>
                      {row.mainPhone}
                    </TableCell>
                    <TableCell style={{ width: 30 }} align="center">
                      {row.disability_certificate}
                    </TableCell>
                    <TableCell style={{ width: 260 }}>
                      {row.provinceName}
                    </TableCell>
                    <TableCell style={{ width: 260 }}>
                      {row.district}: {row.districtName}
                    </TableCell>
                  </StyledTableRow >
                );
              })}
            {(!emptyRows) && (
              <TableRow style={{ height: 53 }}>
                <TableCell colSpan={7} >
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={result.size}
        rowsPerPage={state.rowsPerPage}
        page={state.page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );

};

export default List;