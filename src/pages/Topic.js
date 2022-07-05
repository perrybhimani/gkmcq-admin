import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
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
import { TOPIC, DELETE_TOPIC_MESSAGE, NO_TOPICS_FOUND } from '../utils/strings';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { fetchTopicList } from '../actions/adminActions/topicList';
import { deleteTopic } from '../actions/adminActions/deleteTopic';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'section', label: 'Section', alignRight: false },
  { id: 'level', label: 'Level', alignRight: false },
  { id: 'position', label: 'Position', alignRight: false },
  { id: 'rowNo', label: 'Row Number', alignRight: false },
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
    return filter(array, (_topic) => _topic.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

function Topic(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [topicListData, setTopicListData] = useState([]);
  const [topicId, setTopicId] = useState('');
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
    props.fetchTopicList((err) => onError(err));
  }, [props.deleteTopicData]);

  useEffect(() => {
    const data = props.topicListData ? props.topicListData : [];
    setTopicListData(data);
  }, [props.topicListData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - topicListData.length) : 0;

  const filteredTopic = applySortFilter(topicListData, getComparator(order, orderBy), filterName);

  const isTopicNotFound = filteredTopic.length === 0;

  const onDelete = (id) => {
    props.deleteTopic(id, setDeleteDialog, (err) => onError(err));
  };

  return (
    <Page title="Topic | GK-Mcq-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            GK-Category
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard/add/topic"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Add Topic
          </Button>
        </Stack>
        {props.topicListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            {topicListData.length > 0 ? (
              <Card>
                <UserListToolbar
                  filterName={filterName}
                  onFilterName={handleFilterByName}
                  searchPlaceholder="Search topic..."
                />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={topicListData.length}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody>
                        {filteredTopic
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { _id, name, image, level, position, rowNo, prompt, section } =
                              row;

                            return (
                              <TableRow hover key={_id} tabIndex={-1} role="checkbox">
                                <TableCell component="th" scope="row">
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar alt={name} src={image} />
                                    <Typography variant="subtitle2" noWrap>
                                      {name}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="left">{section}</TableCell>
                                <TableCell align="left">{level}</TableCell>
                                <TableCell align="left">{position}</TableCell>
                                <TableCell align="left">{rowNo}</TableCell>
                                <TableCell align="right">
                                  <UserMoreMenu
                                    onDelete={() => {
                                      setTopicId(_id);
                                      setDeleteDialog(true);
                                    }}
                                    edit
                                    onEdit={() =>
                                      navigate('/dashboard/edit/topic', {
                                        state: {
                                          name,
                                          image,
                                          level,
                                          section,
                                          rowNo,
                                          position,
                                          _id,
                                          prompt
                                        }
                                      })
                                    }
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
                      {isTopicNotFound && (
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
                  count={topicListData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" align="center">
                  {NO_TOPICS_FOUND}
                </Typography>
              </Box>
            )}
          </div>
        )}
      </Container>
      <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => onDelete(topicId)}
        dialogTitle={TOPIC}
        dialogMessage={DELETE_TOPIC_MESSAGE}
        loading={props.deleteTopicDataLoading}
      />
    </Page>
  );
}

const mapStateToProps = (state) => ({
  topicListData: state.topicListData.data,
  topicListLoading: state.topicListData.loading,

  deleteTopicData: state.deleteTopicData.data,
  deleteTopicDataLoading: state.deleteTopicData.loading
});
export default connect(mapStateToProps, {
  fetchTopicList,
  deleteTopic
})(Topic);
