import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// material
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
// components
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import _ from 'lodash';
import Iconify from '../components/Iconify';
import { getErrorMessage, promptTypeArray } from '../utils/appUtils';
import Page from '../components/Page';
import { createHint } from '../actions/adminActions/addHint';
import { updateHint } from '../actions/adminActions/updateHint';
import { deleteHint } from '../actions/adminActions/deleteHint';
import { uploadFile, clearUploadFile } from '../actions/adminActions/uploadFile';
import { fetchHintList } from '../actions/adminActions/hintList';
import { deleteFile } from '../actions/adminActions/deleteFile';
import AudioPlayer from '../components/AudioPlayer';
import DeleteIcon from '../assets/Images/delete.svg';
import CommonDialog from '../components/CommonDialog';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
  PROMPT,
  DELETE_PROMPT_COMPONENT_MESSAGE,
  HINT,
  DELETE_HINT_MESSAGE
} from '../utils/strings';

function ImageComponent(props) {
  return (
    <img
      style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'contain' }}
      alt={props.placeholder}
      src={props.value}
    />
  );
}

function SelectAudioButton(props) {
  return (
    <Button
      variant="contained"
      style={{
        width: '100%',
        boxShadow: 'none',
        background: 'transparent',
        color: '#00AB55',
        border: '1px solid rgba(145, 158, 171, 0.32)'
      }}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.value ? 'Remove Audio' : 'Select Audio'}
    </Button>
  );
}

function DeletePrompt(props) {
  return (
    <button
      onClick={props.onClick}
      style={{
        position: 'absolute',
        top: -5,
        right: -5,
        borderRadius: 35,
        width: 15,
        background: 'transparent',
        border: 'none',
        cursor: !props.disabled ? 'pointer' : 'auto',
        zIndex: 1
      }}
      disabled={props.disabled}
    >
      <img src={DeleteIcon} alt="delete" />
    </button>
  );
}

function Hint(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [hintData, setHintData] = useState(null);
  const [anchorEl, setAnchorEl] = useState([]);
  const [promptIndex, setPromptIndex] = useState(null);
  const [promptType, setPromptType] = useState(null);
  const [promptName, setPromptName] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteHint, setDeleteHint] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { state, pathname } = useLocation();

  const onError = (err) => {
    const error = getErrorMessage(err);
    if (error) {
      enqueueSnackbar(error, {
        variant: 'error'
      });
    }
  };

  const onDeleteFileResponse = (res, fileType, fileIndex) => {
    if (res.data.status === 200 && fileType) {
      let newHintData = { ...hintData };
      const tempHintData = { ...newHintData };
      tempHintData[fileType][fileIndex].value = '';
      newHintData = tempHintData;
      setHintData(newHintData);
      document.getElementById(`${fileType}${fileIndex}`).value = '';
    }
  };

  const deleteFile = async (file, fileType, fileIndex) => {
    await props.deleteFile(
      { file },
      (err) => onError(err),
      (res) => onDeleteFileResponse(res, fileType, fileIndex)
    );
  };

  const getPrompt = (pro) => {
    const blocksFromHTML = htmlToDraft(pro.value);
    const state = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );
    const prompt = {
      type: pro.type,
      value: pro.value,
      editorState: EditorState.createWithContent(state)
    };
    return prompt;
  };

  useEffect(() => {
    if (!state) navigate('/dashboard/question');
    else props.fetchHintList(state.questionId, (err) => onError(err));
  }, []);

  useEffect(() => {
    const data = props.hintListData ? props.hintListData : {};
    if (data) {
      let newHintData = { ...data };
      const tempHintData = { ...newHintData };
      if (tempHintData.hintInfo)
        tempHintData.hintInfo = tempHintData.hintInfo.map((pro) =>
          pro.type === 'text' ? getPrompt(pro) : pro
        );
      newHintData = tempHintData;
      setHintData(newHintData);
    }
  }, [props.hintListData]);

  const createHint = () => {
    const newHintData = { ...hintData };
    newHintData.questionId = state.questionId;
    if (newHintData.hintInfo) {
      newHintData.hintInfo = newHintData.hintInfo.map((pro) => {
        const prompt = {
          type: pro.type,
          value: pro.value
        };
        return prompt;
      });
    }

    props.createHint(newHintData, state.topicId, navigate, (err) => onError(err));
  };

  const updateHint = () => {
    const newHintData = { ...hintData };
    newHintData.questionId = state.questionId;
    if (newHintData.hintInfo) {
      newHintData.hintInfo = newHintData.hintInfo.map((pro) => {
        const prompt = {
          type: pro.type,
          value: pro.value
        };
        return prompt;
      });
    }

    props.updateHint(newHintData._id, newHintData, state.topicId, navigate, (err) => onError(err));
  };

  useEffect(() => {
    const data = props.uploadFileData ? props.uploadFileData : {};
    if (data) {
      let newHintData = { ...hintData };
      const tempHintData = { ...newHintData };
      const { file, type, fileIndex } = data;
      if (tempHintData[type] && tempHintData[type][fileIndex])
        tempHintData[type][fileIndex].value = file;
      newHintData = tempHintData;
      setHintData(newHintData);
    }
  }, [props.uploadFileData]);

  useEffect(() => {
    const data = props.addHintData ? props.addHintData : null;
    if (data) props.clearUploadFile();
  }, [props.addHintData]);

  useEffect(() => {
    const data = props.updateHintData ? props.updateHintData : null;
    if (data) props.clearUploadFile();
  }, [props.updateHintData]);

  const saveDisabled = () => {
    const hintInfoEmpty =
      hintData && hintData.hintInfo && hintData.hintInfo.some((item) => item.value === '');
    if (
      (hintData && !hintData._id && !editMode && _.isEmpty(hintData)) ||
      (hintData && hintData.hintInfo && hintData.hintInfo.length === 0) ||
      props.addHintLoading ||
      props.uploadFileLoading ||
      hintInfoEmpty
    ) {
      return true;
    }
    if (
      (hintData && hintData._id && !editMode) ||
      (hintData && hintData.hintInfo && hintData.hintInfo.length === 0) ||
      _.isEmpty(hintData) ||
      props.uploadFileLoading ||
      hintInfoEmpty
    ) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    if (hintData && hintData._id && editMode) updateHint();
    else createHint();
  };

  const uploadFile = (file, type, index) => {
    const data = {
      files: file
    };

    props.uploadFile(data, (err) => onError(err), type, index);
  };

  const handlePrompt = async (e, promptName, inputName, inputIndex) => {
    let newHintData = { ...hintData };
    const tempHintData = { ...newHintData };
    if (inputName === 'promptText') {
      tempHintData[promptName][inputIndex].editorState = e;
      tempHintData[promptName][inputIndex].value = draftToHtml(convertToRaw(e.getCurrentContent()));
    } else {
      const file = e.target.files[0];
      if (file) await uploadFile(file, promptName, inputIndex);
    }
    newHintData = tempHintData;
    setHintData(newHintData);
  };

  const handleAddPrompt = (promptType, promptName, inputIndex) => {
    let newHintData = { ...hintData };
    const tempHintData = { ...newHintData };
    if (promptType === 'Text') {
      tempHintData[promptName] = tempHintData[promptName]
        ? [...tempHintData[promptName], { type: 'text', value: '' }]
        : [{ type: 'text', value: '' }];
    } else if (promptType === 'Image') {
      tempHintData[promptName] = tempHintData[promptName]
        ? [...tempHintData[promptName], { type: 'image', value: '' }]
        : [{ type: 'image', value: '' }];
    } else {
      tempHintData[promptName] = tempHintData[promptName]
        ? [...tempHintData[promptName], { type: 'audio', value: '' }]
        : [{ type: 'audio', value: '' }];
    }
    newHintData = tempHintData;
    setHintData(newHintData);
    handleClose(inputIndex);
  };

  const handleDeletePromptComponent = () => {
    let newHintData = { ...hintData };
    const tempHintData = { ...newHintData };
    if (promptType === 'media' && tempHintData[promptName][promptIndex].value)
      deleteFile(tempHintData[promptName][promptIndex].value);

    tempHintData[promptName] = tempHintData[promptName].filter(
      (pro, index) => index !== promptIndex
    );
    newHintData = tempHintData;
    setHintData(newHintData);
    setDeleteDialog(false);
  };

  const onPromptMediaUploadClick = (id) => {
    document.getElementById(id).click();
  };

  const onRemovePromptMedia = async (fileType, promptIndex) => {
    if (hintData[fileType][promptIndex].value)
      await deleteFile(hintData[fileType][promptIndex].value, fileType, promptIndex);
  };

  const handleClose = (index) => {
    const newAnchorEl = [...anchorEl];
    let tempAnchorEl = { ...newAnchorEl[index] };
    tempAnchorEl = null;
    newAnchorEl[index] = tempAnchorEl;
    setAnchorEl(newAnchorEl);
  };

  const handleClick = (event, index) => {
    const newAnchorEl = [...anchorEl];
    let tempAnchorEl = { ...newAnchorEl[index] };
    tempAnchorEl = event.currentTarget;
    newAnchorEl[index] = tempAnchorEl;
    setAnchorEl(newAnchorEl);
  };

  const topicInput = (idName, inputName, dataArray, onchange, inputIndex) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0px' }}>
      <Grid container direction="column">
        <Grid item container alignItems="center">
          <Grid item xs={12}>
            <Typography variant="body1">{inputName}</Typography>
          </Grid>
          <Grid item xs={12}>
            <div
              style={{
                width: '100%',
                minHeight: 400,
                border: '1px solid rgba(145, 158, 171, 0.32)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  width: '100%',
                  padding: 10
                }}
              >
                {dataArray.map((pro, proIndex) =>
                  pro.type === 'text' ? (
                    <div
                      key={`${pro.type}${proIndex}`}
                      style={{
                        marginBottom: 10,
                        position: 'relative'
                      }}
                    >
                      <DeletePrompt
                        onClick={() => {
                          setPromptType('text');
                          setPromptName(idName);
                          setPromptIndex(proIndex);
                          setDeleteDialog(true);
                        }}
                        disabled={props.hintListData._id && !editMode}
                      />
                      <Editor
                        editorState={pro.editorState}
                        onEditorStateChange={(e) => {
                          if (props.hintListData._id && !editMode) return false;
                          onchange(e, idName, 'promptText', proIndex);
                        }}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                        toolbar={{
                          options: [
                            'inline',
                            'blockType',
                            'fontSize',
                            'fontFamily',
                            'list',
                            'textAlign',
                            'colorPicker',
                            'link',
                            'history'
                          ],
                          list: { inDropdown: true },
                          textAlign: { inDropdown: true },
                          link: { inDropdown: true }
                        }}
                      />
                    </div>
                  ) : (
                    <div key={`${pro.type}${proIndex}`}>
                      {pro.type === 'image' ? (
                        <div
                          style={{
                            marginBottom: 15,
                            position: 'relative',
                            width: 'fit-content'
                          }}
                        >
                          <DeletePrompt
                            onClick={() => {
                              setPromptType('media');
                              setPromptName(idName);
                              setPromptIndex(proIndex);
                              setDeleteDialog(true);
                            }}
                            disabled={props.hintListData._id && !editMode}
                          />
                          <Button
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 8,
                              border: '1px solid rgba(145, 158, 171, 0.32)',
                              padding: 0
                            }}
                            onClick={() =>
                              !pro.value
                                ? onPromptMediaUploadClick(`${idName}${proIndex}`)
                                : onRemovePromptMedia(idName, proIndex)
                            }
                            disabled={props.hintListData._id && !editMode}
                          >
                            <input
                              style={{ display: 'none' }}
                              id={`${idName}${proIndex}`}
                              onChange={(event) => onchange(event, idName, 'promptMedia', proIndex)}
                              type="file"
                              accept="image/*"
                            />
                            {pro.value ? (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <ImageComponent placeholder="Image" value={pro.value} />
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: 'black',
                                    opacity: 0.3,
                                    borderRadius: 8
                                  }}
                                />
                                <Iconify
                                  style={{ color: '#FF4842', position: 'absolute' }}
                                  icon="eva:trash-2-fill"
                                  width={24}
                                  height={24}
                                />
                              </div>
                            ) : (
                              <div>Image</div>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 10, position: 'relative' }}>
                          <DeletePrompt
                            onClick={() => {
                              setPromptType('media');
                              setPromptName(idName);
                              setPromptIndex(proIndex);
                              setDeleteDialog(true);
                            }}
                            disabled={props.hintListData._id && !editMode}
                          />
                          <SelectAudioButton
                            onClick={() =>
                              !pro.value
                                ? onPromptMediaUploadClick(`${idName}${proIndex}`)
                                : onRemovePromptMedia(idName, proIndex)
                            }
                            disabled={props.hintListData._id && !editMode}
                            value={pro.value}
                          />
                          <input
                            style={{ display: 'none' }}
                            id={`${idName}${proIndex}`}
                            onChange={(event) => onchange(event, idName, 'promptMedia', proIndex)}
                            type="file"
                            accept="audio/*"
                          />
                          {pro.value && <AudioPlayer audioUrl={pro.value} />}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  justifyContent: 'end',
                  width: '100%'
                }}
              >
                <Button
                  variant="contained"
                  onClick={(e) => handleClick(e, inputIndex)}
                  style={{
                    padding: 3,
                    paddingRight: 10,
                    paddingLeft: 10,
                    marginBottom: 10,
                    marginRight: 10
                  }}
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  disabled={props.hintListData._id && !editMode}
                >
                  Add
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl[inputIndex]}
                  open={Boolean(anchorEl[inputIndex])}
                  onClose={() => handleClose(inputIndex)}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  PaperProps={{
                    style: {
                      margin: -5,
                      minWidth: 100
                    }
                  }}
                >
                  {promptTypeArray.map((prompt) => (
                    <MenuItem
                      key={prompt}
                      onClick={() => handleAddPrompt(prompt, idName, inputIndex)}
                    >
                      {prompt}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Page title="Hint | GK-Mcq-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Hint
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              props.clearUploadFile();
              navigate('/dashboard/question', {
                state: { topicId: state && state.topicId ? state.topicId : null }
              });
            }}
          >
            Back
          </Button>
        </Stack>
        {props.hintListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card style={{ display: 'flex', justifyContent: 'center', padding: '15px 10px' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: 500
              }}
            >
              {hintData && hintData._id && (
                <Box sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: 150,
                      marginBottom: '20px'
                    }}
                  >
                    {!editMode && (
                      <Button variant="contained" onClick={() => setEditMode(!editMode)}>
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="error"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => setDeleteHint(true)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              )}
              {topicInput(
                'hintInfo',
                'Hint Information',
                (hintData && hintData.hintInfo && hintData.hintInfo) || [],
                handlePrompt,
                '1'
              )}
              <LoadingButton
                variant="contained"
                style={{ width: 200, padding: 10, marginTop: 10 }}
                disabled={saveDisabled()}
                loading={editMode ? props.updateHintLoading : props.addHintLoading}
                onClick={() => handleSave()}
              >
                Save
              </LoadingButton>
            </Box>
          </Card>
        )}
      </Container>
      <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => handleDeletePromptComponent()}
        dialogTitle={PROMPT}
        dialogMessage={DELETE_PROMPT_COMPONENT_MESSAGE}
      />
      <CommonDialog
        open={deleteHint}
        close={() => setDeleteHint(false)}
        onSuccess={() =>
          props.deleteHint(
            hintData._id,
            () => {
              navigate('/dashboard/question', {
                state: { topicId: state.topicId }
              });
            },
            (err) => onError(err)
          )
        }
        dialogTitle={HINT}
        dialogMessage={DELETE_HINT_MESSAGE}
        loading={props.deleteHintLoading}
      />
    </Page>
  );
}

const mapStateToProps = (state) => ({
  addHintData: state.addHintData.data,
  addHintLoading: state.addHintData.loading,

  updateHintData: state.updateHintData.data,
  updateHintLoading: state.updateHintData.loading,

  uploadFileData: state.uploadFileData.data,
  uploadFileLoading: state.uploadFileData.loading,

  deleteFileData: state.deleteFileData.data,
  deleteFileLoading: state.uploadFileData.loading,

  hintListData: state.hintListData.data,
  hintListLoading: state.hintListData.loading,

  deleteHintData: state.deleteHintData.data,
  deleteHintLoading: state.deleteHintData.loading
});
export default connect(mapStateToProps, {
  createHint,
  updateHint,
  uploadFile,
  clearUploadFile,
  deleteFile,

  fetchHintList,
  deleteHint
})(Hint);
