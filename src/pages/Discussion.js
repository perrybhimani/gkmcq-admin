import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
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
import moment from 'moment';
import CommonDialog from '../components/CommonDialog';
import { getErrorMessage } from '../utils/appUtils';
import { COMMENT, DELETE_COMMENT_MESSAGE, NO_COMMENTS_FOUND } from '../utils/strings';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { fetchDiscussionList } from '../actions/adminActions/discussionList';
import { deleteDiscussion } from '../actions/adminActions/deleteDiscussion';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'comment', label: 'Comment', alignRight: false },
  { id: 'userName', label: 'User Name', alignRight: false },
  { id: 'createdAt', label: 'CreatedAt', alignRight: false },
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
      (_discussion) => _discussion.comment.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

function Discussion(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('comment');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [discussionListData, setDiscussionListData] = useState([]);
  const [commentId, setCommentId] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { state } = useLocation();

  const onError = (err) => {
    const error = getErrorMessage(err);
    if (error) {
      enqueueSnackbar(error, {
        variant: 'error'
      });
    }
  };

  useEffect(() => {
    if (!state) navigate('/dashboard/question');
  }, []);

  useEffect(() => {
    if (state) props.fetchDiscussionList(state.questionId, (err) => onError(err));
  }, [props.deleteDiscussionData]);

  useEffect(() => {
    const data = props.discussionListData ? props.discussionListData.discussions : [];
    setDiscussionListData(data);
  }, [props.discussionListData]);

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

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - discussionListData.length) : 0;

  const filteredDiscussion = applySortFilter(
    discussionListData,
    getComparator(order, orderBy),
    filterName
  );

  const isDiscussionNotFound = filteredDiscussion.length === 0;

  const onDelete = (id) => {
    props.deleteDiscussion(id, setDeleteDialog, (err) => onError(err));
  };

  return (
    <Page title="Comment | GK-Mcq-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Comments
          </Typography>
          <Button
            variant="contained"
            onClick={() =>
              navigate('/dashboard/question', {
                state: { topicId: state && state.topicId ? state.topicId : null }
              })
            }
          >
            Back
          </Button>
        </Stack>
        {props.discussionListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            {discussionListData.length > 0 ? (
              <Card>
                <UserListToolbar
                  filterName={filterName}
                  onFilterName={handleFilterByName}
                  searchPlaceholder="Search Comment..."
                />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={discussionListData.length}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody>
                        {filteredDiscussion
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { _id, comment, userName, createdAt } = row;

                            return (
                              <TableRow hover key={_id} tabIndex={-1} role="checkbox">
                                <TableCell align="left">{comment}</TableCell>
                                <TableCell align="left">{userName}</TableCell>
                                <TableCell align="left">
                                  {moment(createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                                </TableCell>
                                <TableCell align="right">
                                  <UserMoreMenu
                                    onDelete={() => {
                                      setCommentId(_id);
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
                      {isDiscussionNotFound && (
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
                  count={discussionListData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" align="center">
                  {NO_COMMENTS_FOUND}
                </Typography>
              </Box>
            )}
          </div>
        )}
      </Container>
      <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => onDelete(commentId)}
        dialogTitle={COMMENT}
        dialogMessage={DELETE_COMMENT_MESSAGE}
        loading={props.deleteDiscussionLoading}
      />
    </Page>
  );
}

const mapStateToProps = (state) => ({
  deleteDiscussionData: state.deleteDiscussionData.data,
  deleteDiscussionLoading: state.deleteDiscussionData.loading,

  discussionListData: state.discussionListData.data,
  discussionListLoading: state.discussionListData.loading
});
export default connect(mapStateToProps, {
  deleteDiscussion,
  fetchDiscussionList
})(Discussion);
