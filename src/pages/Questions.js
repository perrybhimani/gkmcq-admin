import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Hidden
} from '@mui/material';
// components
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import CommonDialog from '../components/CommonDialog';
import Dropdown from '../components/Dropdown';
import { getErrorMessage } from '../utils/appUtils';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import {
  QUESTION,
  DELETE_QUESTION_MESSAGE,
  NO_TOPICS_FOUND,
  SELECT_TOPIC,
  NO_QUESTIONS_FOUND
} from '../utils/strings';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';
import { fetchQuestionList } from '../actions/adminActions/questionList';
import { fetchTopicList } from '../actions/adminActions/topicList';
import { deleteQuestion } from '../actions/adminActions/deleteQuestion';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'questionTitle', label: 'Question', alignRight: false },
  { id: 'image', label: 'Image', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'composerName', label: 'Composer Name', alignRight: false },
  { id: '' },
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
      (_question) => _question.questionTitle.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

function ActionButton(props) {
  return (
    <Button
      variant="contained"
      style={{
        width: props.value === 'Comments' ? 100 : 50,
        paddingTop: 8,
        paddingBottom: 8,
        marginLeft: props.value === 'Hint' ? 10 : 0
      }}
      onClick={props.onClick}
    >
      {props.value}
    </Button>
  );
}

function Questions(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [topicListData, setTopicListData] = useState([]);
  const [questionListData, setQuestionListData] = useState([]);
  const [topicId, setTopicId] = useState('');
  const [questionId, setQuestionId] = useState('');
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
    props.fetchTopicList((err) => onError(err));
  }, []);

  useEffect(() => {
    if (topicId) props.fetchQuestionList(topicId, (err) => onError(err));
  }, [topicId, props.deleteQuestionData]);

  useEffect(() => {
    const data = props.topicListData ? props.topicListData : [];
    setTopicListData(data);
    if (data.length !== 0) setTopicId(state && state.topicId ? state.topicId : data[0]._id);
  }, [props.topicListData]);

  useEffect(() => {
    const questiondata = props.questionListData ? props.questionListData : [];
    setQuestionListData(questiondata);
  }, [props.questionListData]);

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - questionListData.length) : 0;

  const filteredQuestions = applySortFilter(
    questionListData,
    getComparator(order, orderBy),
    filterName
  );

  const isQuestionNotFound = filteredQuestions.length === 0;

  const onDelete = (ID) => {
    props.deleteQuestion(ID, setDeleteDialog, (err) => onError(err));
  };

  return (
    <Page title="Question | GK-Mcq-UI">
      <Container>
        <Stack direction="column" alignItems="center" mb={5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h4" gutterBottom>
              Question
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Hidden smDown>
                {props.topicListData.length !== 0 && !props.topicListLoading && (
                  <Button
                    variant="contained"
                    onClick={() =>
                      navigate('/dashboard/add/question', {
                        state: { topicId }
                      })
                    }
                    style={{ marginRight: 10, paddingTop: 8, paddingBottom: 8 }}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                  >
                    Add Question
                  </Button>
                )}
              </Hidden>
              {props.topicListData.length !== 0 && !props.topicListLoading && (
                <FormControl style={{ width: '170px' }}>
                  <Dropdown
                    itemsArray={topicListData}
                    selectedItem={topicId}
                    handleChange={(e) => {
                      setTopicId(e.target.value);
                      setFilterName('');
                    }}
                    padding={9}
                  />
                </FormControl>
              )}
            </Stack>
          </Stack>
          <Hidden smUp>
            {props.topicListData.length !== 0 && !props.topicListLoading && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mt={2}
                width="100%"
              >
                <Button
                  variant="contained"
                  style={{ width: '100%', paddingTop: 8, paddingBottom: 8 }}
                  onClick={() =>
                    navigate('/dashboard/add/question', {
                      state: { topicId }
                    })
                  }
                  startIcon={<Iconify icon="eva:plus-fill" />}
                >
                  Add Question
                </Button>
              </Stack>
            )}
          </Hidden>
        </Stack>

        {props.questionListLoading || props.topicListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            {questionListData.length > 0 ? (
              <Card>
                <UserListToolbar
                  filterName={filterName}
                  onFilterName={handleFilterByName}
                  searchPlaceholder="Search question..."
                />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={questionListData.length}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody>
                        {filteredQuestions
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { _id, questionTitle, title, image, type, composerName, hint } =
                              row;

                            return (
                              <TableRow hover key={_id} tabIndex={-1} role="checkbox">
                                <TableCell align="left">{questionTitle}</TableCell>
                                <TableCell component="th" scope="row">
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar alt={title} src={image} />
                                  </Stack>
                                </TableCell>
                                <TableCell align="left">{type}</TableCell>
                                <TableCell align="left">{title}</TableCell>
                                <TableCell align="left">{composerName}</TableCell>
                                <TableCell align="left">
                                  <div style={{ display: 'flex' }}>
                                    <ActionButton
                                      value="Comments"
                                      onClick={() =>
                                        navigate('/dashboard/comments', {
                                          state: { questionId: _id, topicId }
                                        })
                                      }
                                    />
                                    {hint && (
                                      <ActionButton
                                        value="Hint"
                                        onClick={() =>
                                          navigate('/dashboard/hint', {
                                            state: { questionId: _id, topicId }
                                          })
                                        }
                                      />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell align="right">
                                  <UserMoreMenu
                                    onDelete={() => {
                                      setQuestionId(_id);
                                      setDeleteDialog(true);
                                    }}
                                    edit
                                    onEdit={() =>
                                      navigate('/dashboard/edit/question', {
                                        state: { topicId, questionId: _id }
                                      })
                                    }
                                    hint={!hint}
                                    onHint={() =>
                                      navigate('/dashboard/hint', {
                                        state: { questionId: _id, topicId }
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
                      {isQuestionNotFound && (
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
                  count={questionListData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" align="center">
                  {props.topicListData.length === 0 ? (
                    NO_TOPICS_FOUND
                  ) : (
                    <span>{NO_QUESTIONS_FOUND}</span>
                  )}
                </Typography>
              </Box>
            )}
          </div>
        )}
      </Container>
      <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => onDelete(questionId)}
        dialogTitle={QUESTION}
        dialogMessage={DELETE_QUESTION_MESSAGE}
        loading={props.deleteQuestionDataLoading}
      />
    </Page>
  );
}

const mapStateToProps = (state) => ({
  questionListData: state.questionListData.data,
  questionListLoading: state.questionListData.loading,

  topicListData: state.topicListData.data,
  topicListLoading: state.topicListData.loading,

  deleteQuestionData: state.deleteQuestionData.data,
  deleteQuestionDataLoading: state.deleteQuestionData.loading
});
export default connect(mapStateToProps, {
  fetchQuestionList,
  fetchTopicList,
  deleteQuestion
})(Questions);
