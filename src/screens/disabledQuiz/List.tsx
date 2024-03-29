import { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField,TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar
} from '@mui/material';
import { Autorenew } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';
import {
  useNavigate
} from "react-router-dom";

const StyledTableCell:any = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow:any = styled(TableRow)(({ theme }) => ({
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

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const tableRef = useRef()

  const online = useSelector((state:any) => {
    return state.networkStatus.connected&&(state.connected==null||state.connected)
  });

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClickRow = (event:any, code:any) => {
    console.log(event);
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

  const emptyRows = result.data && result.data.length;

  const onPageChange = (
    event:any, page:any
  ) => {
    console.log(event);
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
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
    dispatch({ type: 'title', title: 'Evaluación Discapacidad' });
    fetchData(state.page)
  }, [state.page,state.rowsPerPage]);

  const [o, { defaultProps }] = useFormState(useState, {});

  const createOnClick = () => {
    navigate('/create');
  };

  const editOnClick = () => {
    navigate('/' + selected[0] + '/edit');
  }

  const deleteOnClick = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e:any) => {
        if (e) {
          http.delete('/api/minsa/disabled-quiz/' + selected.join(',')).then(() => {
            dispatch({ type: 'snack', msg: 'Registro' + (selected.length > 1 ? 's' : '') + ' eliminado!' });
            onClickRefresh();
          });
        }
      }
    });
  };

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Toolbar className="Toolbar-table" >
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
              <StyledTableCell padding="checkbox">
                <Checkbox
                  style={{ color: 'white' }}
                  indeterminate={selected.length > 0 && selected.length < result.data.length}
                  checked={result && result.data.length > 0 && selected.length === result.data.length}
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
            {(result && result.data && result.data.length ? result.data : [])
              .map((row, index) => {
                const isItemSelected = isSelected(toID(row));
                return (
                  <StyledTableRow
                    style={{ backgroundColor: (row._id && row._id.$oid) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
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
                      {row.surnames} {row.names}
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
            {(!emptyRows)&&(
              <TableRow style={{ height: 53 }}>
                <TableCell colSpan={5} >
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