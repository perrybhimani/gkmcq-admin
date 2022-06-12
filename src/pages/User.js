import { filter } from 'lodash';
// import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  // Avatar,
  // Button,
  // Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress,
  Box
} from '@mui/material';
// components
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import CommonDialog from '../components/CommonDialog';
import { getErrorMessage } from '../utils/appUtils';
import { USER, DELETE_USER_MESSAGE, NO_USERS_FOUND } from '../utils/strings';
import Page from '../components/Page';
// import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
// import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { fetchUserList } from '../actions/adminActions/userList';
import { deleteUser } from '../actions/adminActions/deleteUser';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_user) =>
        _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        (_user.email && _user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

function User(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  // const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [userListData, setUserListData] = useState([]);
  const [userId, setUserId] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  const onError = (err) => {
    const error = getErrorMessage(err);
    if (error) {
      enqueueSnackbar(error, {
        variant: 'error'
      });
    }
  };

  useEffect(() => {
    props.fetchUserList((err) => onError(err));
  }, [props.deleteUserData]);

  useEffect(() => {
    const data = props.userListData ? props.userListData : [];
    setUserListData(data);
  }, [props.userListData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelecteds = userListData.map((n) => n.name);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };

  // const handleClick = (event, name) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [];
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, name);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(
  //       selected.slice(0, selectedIndex),
  //       selected.slice(selectedIndex + 1)
  //     );
  //   }
  //   setSelected(newSelected);
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userListData.length) : 0;

  const filteredUsers = applySortFilter(userListData, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const onDelete = (id) => {
    props.deleteUser(id, setDeleteDialog, (err) => onError(err));
  };

  return (
    <Page title="User | GK-Mcq-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Users using the Application
          </Typography>
          {/* <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New User
          </Button> */}
        </Stack>
        {props.userListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            {userListData.length > 0 ? (
              <Card>
                <UserListToolbar
                  // numSelected={selected.length}
                  filterName={filterName}
                  onFilterName={handleFilterByName}
                  searchPlaceholder="Search user..."
                />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={userListData.length}
                        // numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
                      />
                      <TableBody>
                        {filteredUsers
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { _id, name, email } = row;
                            // const isItemSelected = selected.indexOf(name) !== -1;

                            return (
                              <TableRow
                                hover
                                key={_id}
                                tabIndex={-1}
                                role="checkbox"
                                // selected={isItemSelected}
                                // aria-checked={isItemSelected}
                              >
                                {/* <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={isItemSelected}
                                    onChange={(event) => handleClick(event, name)}
                                  />
                                </TableCell> */}
                                <TableCell component="th" scope="row">
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    {/* <Avatar alt={name} src={avatarUrl} /> */}
                                    <Typography variant="subtitle2" noWrap>
                                      {name}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="left">{email}</TableCell>
                                <TableCell align="right">
                                  <UserMoreMenu
                                    onDelete={() => {
                                      setUserId(_id);
                                      setDeleteDialog(true);
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isUserNotFound && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={filterName} />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Scrollbar>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={userListData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" align="center">
                  {NO_USERS_FOUND}
                </Typography>
              </Box>
            )}
          </div>
        )}
      </Container>
      <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => onDelete(userId)}
        dialogTitle={USER}
        dialogMessage={DELETE_USER_MESSAGE}
        loading={props.deleteUserDataLoading}
      />
    </Page>
  );
}

const mapStateToProps = (state) => ({
  userListData: state.userListData.data,
  userListLoading: state.userListData.loading,

  deleteUserData: state.deleteUserData.data,
  deleteUserDataLoading: state.deleteUserData.loading
});
export default connect(mapStateToProps, {
  fetchUserList,
  deleteUser
})(User);
