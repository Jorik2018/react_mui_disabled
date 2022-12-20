import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField,
  TableHead, TableBody,TablePagination, TableRow, TableContainer, Toolbar
} from '@mui/material';
import { Autorenew } from '@mui/icons-material';
import { debounce, http } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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

  const [state, setState] = useState({page: 0, rowsPerPage:10});

  const [result, setResult] = useState({size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => row.uid);
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

  const onPageChange = (
    event,
  ) => {
    console.log(event);
  };

  const onRowsPerPageChange = (
    event,
  ) => {
    var s={...state,...{rowsPerPage:parseInt(event.target.value, 10)}};
    console.log(s);
    setState(s);
    fetchData(0);
    //setState({...state,...{page:0}});
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    const data = {
      query: `query{
          users(offset:${page*state.rowsPerPage} limit:${state.rowsPerPage} roleName:"") {
            data{
              uid
              name
              directoryId
              people{
                fullName
              }
              status
              mail
            }
            size
          }
        }`,
    };
    http.gql('/api/admin/graphql', data).then((result)=>{
      console.log(result);
      if(result&&result.users){
        setResult(result.users);
        /*var s={...state,...{page:page}};
        console.log(s);
        setState(s);*/
      }
    });

  };

  useEffect(() => {
    const debouncedHandleResize = debounce((width, height) => {
      const header = document.querySelector('.MuiToolbar-root');
      const tableContainer = document.querySelector('.MuiTableContainer-root');
      const tablePagination = document.querySelector('.MuiTablePagination-root');
      const nav = document.querySelector('nav');
      const toolbarTable = document.querySelector('.Toolbar-table');
      if (tableContainer) {
        tableContainer.style.width = (width - nav.offsetWidth) + 'px';
        tableContainer.style.height = (height - header.offsetHeight
          - toolbarTable.offsetHeight-tablePagination.offsetHeight) + 'px';
      }
    }, 500);
    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize);
    dispatch({type:'title',title:'Usuarios'});
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }

    
  }, [dispatch]);

  useEffect(() => { fetchData(0) }, [fetchData]);

  const onClickCreate = () => {
    navigate('/user/create');
  };

  const onClickEdit = () => {
    navigate('/user/' + selected[0] + '/edit');
  }



  const onClickDelete = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e) => {
        if (e) {
          http.delete('/api/minsa/disabled-quiz/' + selected.join(',')).then((result) => {
            dispatch({ type: 'snack', msg: 'Registro' + (selected.length > 1 ? 's' : '') + ' eliminado!' });
            onClickRefresh();
          });
        }
      }
    });
  };

  function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  const emptyRows = state.page > 0 ? Math.max(0, (1 + state.page) * state.rowsPerPage - result.rows.length) : 0;

  return (
    <>
      <Toolbar className="Toolbar-table" direction="row" >
        <div style={{
          float: 'none',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <Button disabled={!selected.length} startIcon={<EditIcon />} onClick={onClickEdit}>Editar</Button>
          <Button disabled={!selected.length} startIcon={<DeleteIcon />} onClick={onClickDelete}>Eliminar</Button>
          <Button onClick={onClickRefresh} endIcon={<Autorenew />} />
        </div>
      </Toolbar>
      <TableContainer sx={{ maxHeight: '100%' }}>
        <Fab color="primary" aria-label="add"
          onClick={onClickCreate}
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
              <StyledTableCell style={{ minWidth: 20 }}>#
                <TextField style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 90 }}>Nombre
                <TextField style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 260 }}>Nombre Completo
                <TextField style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
              <StyledTableCell style={{ minWidth: 260 }}>Correo 
                <TextField style={{ padding: 0, marginTop: '5px !important' }} />
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(result && result.data ? (state.rowsPerPage > 0
              ? result.data.slice(state.page * state.rowsPerPage, state.page * state.rowsPerPage + state.rowsPerPage)
              : result.data) : []
            ).map((row, index) => {
              const isItemSelected = isSelected(row.uid);
              return (
                <StyledTableRow
                  hover
                  onClick={(event) => onClickRow(event, row.uid)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={index + ' ' + row.uid}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                    />
                  </TableCell>
                  <TableCell style={{ width: 20 }} align="center">
                    {pad(1+index+state.page*state.rowsPerPage,4)}
                  </TableCell>
                  <TableCell style={{ width: 90 }} align="center">
                    {row.name}
                  </TableCell>
                  <TableCell style={{ width: 260 }} >
                    {row.people?.fullName}
                  </TableCell>
                  <TableCell style={{ width: 260 }}>
                    {row.mail}
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