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
  MenuItem
} from '@mui/material';
// components
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import Iconify from '../components/Iconify';
import Dropdown from '../components/Dropdown';
import {
  getErrorMessage,
  positionArray,
  numberArray,
  promptTypeArray,
  sectionArray
} from '../utils/appUtils';
import Textbox from '../components/Textbox';
import Page from '../components/Page';
import { createTopic } from '../actions/adminActions/addTopic';
import { updateTopic } from '../actions/adminActions/updateTopic';
import { uploadFile, clearUploadFile } from '../actions/adminActions/uploadFile';
import { deleteFile } from '../actions/adminActions/deleteFile';
import AudioPlayer from '../components/AudioPlayer';
import DeleteIcon from '../assets/Images/delete.svg';
import CommonDialog from '../components/CommonDialog';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { PROMPT, DELETE_PROMPT_COMPONENT_MESSAGE } from '../utils/strings';

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
        cursor: 'pointer',
        zIndex: 1
      }}
    >
      <img src={DeleteIcon} alt="delete" />
    </button>
  );
}

function AddEditTopic(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('1');
  const [rowNo, setRowNo] = useState('1');
  const [position, setPosition] = useState('center');
  const [displayImage, setDisplayImage] = useState(null);
  const [prompt, setPrompt] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [promptIndex, setPromptIndex] = useState(null);
  const [promptType, setPromptType] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [section, setSection] = useState('Kids');
  const inputFile = useRef(null);

  const { state, pathname } = useLocation();

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

  const onError = (err) => {
    const error = getErrorMessage(err);
    if (error) {
      enqueueSnackbar(error, {
        variant: 'error'
      });
    }
  };

  useEffect(() => {
    if (pathname === '/dashboard/edit/topic' && state) {
      const { name, image, level, rowNo, position, prompt, section } = state;
      setName(name);
      setDisplayImage(image);
      setLevel(level);
      setSection(section);
      setRowNo(rowNo);
      setPosition(position);
      const tempPrompt = prompt || [];
      const newPrompt = tempPrompt.map((pro) => (pro.type === 'text' ? getPrompt(pro) : pro));
      setPrompt(newPrompt);
    }
    if (pathname === '/dashboard/edit/topic' && !state) {
      navigate('/dashboard/topic');
    }
  }, []);

  const createTopic = () => {
    const newPrompt = prompt.map((pro) => {
      const prompt = {
        type: pro.type,
        value: pro.value
      };
      return prompt;
    });
    const data = {
      name,
      image: displayImage,
      level,
      section,
      rowNo,
      position,
      prompt: newPrompt
    };

    props.createTopic(data, navigate, (err) => onError(err));
  };

  const updateTopic = () => {
    const newPrompt = prompt.map((pro) => {
      const prompt = {
        type: pro.type,
        value: pro.value
      };
      return prompt;
    });
    const data = { prompt: newPrompt, level, section };

    if (state.name !== name) data.name = name;
    if (state.image !== displayImage) data.image = displayImage;
    if (state.rowNo !== rowNo || state.position !== position) {
      data.rowNo = rowNo;
      data.position = position;
    }

    props.updateTopic(state._id, data, navigate, (err) => onError(err));
  };

  useEffect(() => {
    const data = props.uploadFileData ? props.uploadFileData : '';
    if (data) {
      if (data.type === 'promptMedia') {
        const newPrompt = [...prompt];
        const tempPrompt = { ...newPrompt[data.fileIndex] };
        const { file } = data;
        tempPrompt.value = file;
        newPrompt[data.fileIndex] = tempPrompt;
        setPrompt(newPrompt);
      } else setDisplayImage(data.file);
    }
  }, [props.uploadFileData]);

  const onRemovePromptMedia = async (fileType, fileIndex) => {
    if (prompt[fileIndex].value) await deleteFile(prompt[fileIndex].value, fileType, fileIndex);
  };

  useEffect(() => {
    const data = props.addTopicData ? props.addTopicData : null;
    if (data) props.clearUploadFile();
  }, [props.addTopicData]);

  useEffect(() => {
    const data = props.updateTopicData ? props.updateTopicData : null;
    if (data) props.clearUploadFile();
  }, [props.updateTopicData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) await uploadFile(file, 'questionImage');
  };

  const onUploadClick = () => {
    inputFile.current.click();
  };

  const onRemoveClick = async () => {
    if (displayImage) await deleteFile(displayImage, 'displayImage');
  };

  const saveDisabled = () => {
    const promptEmpty = prompt.some((item) => item.value === '');
    if (
      pathname === '/dashboard/edit/topic' &&
      (!name || !displayImage || props.updateTopicLoading || props.uploadFileLoading || promptEmpty)
    ) {
      return true;
    }
    if (
      pathname === '/dashboard/add/topic' &&
      (!name || !displayImage || props.addTopicLoading || props.uploadFileLoading || promptEmpty)
    ) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    if (pathname === '/dashboard/edit/topic') {
      updateTopic();
    } else createTopic();
  };

  const uploadFile = (file, type, index) => {
    const data = {
      files: file
    };

    props.uploadFile(data, (err) => onError(err), type, index);
  };

  const onDeleteFileResponse = (res, fileType, fileIndex) => {
    if (res.data.status === 200) {
      if (fileType === 'displayImage') {
        setDisplayImage('');
        inputFile.current.value = '';
      } else if (fileType && fileType === 'promptMedia') {
        const newPrompt = [...prompt];
        const tempPrompt = { ...newPrompt[fileIndex] };
        tempPrompt.value = '';
        newPrompt[fileIndex] = tempPrompt;
        setPrompt(newPrompt);
        document.getElementById(`${fileType}${fileIndex}`).value = '';
      }
    }
  };

  const deleteFile = async (file, fileType, fileIndex) => {
    await props.deleteFile(
      { file },
      (err) => onError(err),
      (res) => onDeleteFileResponse(res, fileType, fileIndex)
    );
  };

  const handlePrompt = async (e, inputName, inputIndex) => {
    const newPrompt = [...prompt];
    const tempPrompt = { ...newPrompt[inputIndex] };
    if (inputName === 'promptText') {
      tempPrompt.editorState = e;
      tempPrompt.value = draftToHtml(convertToRaw(e.getCurrentContent()));
      newPrompt[inputIndex] = tempPrompt;
      setPrompt(newPrompt);
    } else {
      const file = e.target.files[0];
      if (file) await uploadFile(file, 'promptMedia', inputIndex);
    }
  };

  const handleAddPrompt = (promptType) => {
    if (promptType === 'Text') setPrompt([...prompt, { type: 'text', value: '' }]);
    else if (promptType === 'Image') setPrompt([...prompt, { type: 'image', value: '' }]);
    else setPrompt([...prompt, { type: 'audio', value: '' }]);
    setAnchorEl(null);
  };

  const handleDeletePromptComponent = () => {
    const newPrompt = [...prompt];
    const tempPrompt = { ...newPrompt[promptIndex] };
    if (promptType === 'media' && tempPrompt.value) deleteFile(tempPrompt.value);

    setPrompt(prompt.filter((pro, index) => index !== promptIndex));
    setAnchorEl(null);
    setDeleteDialog(false);
  };

  const onPromptMediaUploadClick = (id) => {
    document.getElementById(id).click();
  };

  const topicInput = (inputId, inputName, value, onchange, placeholder, type, inputArray) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0px' }}>
      <Grid container direction="column">
        <Grid item container alignItems="center">
          <Grid item xs={inputId === 'introPrompt' ? 12 : 4}>
            <Typography variant="body1">{inputName}</Typography>
          </Grid>
          {inputId === 'introPrompt' ? (
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
                    // height: '88%',
                    // overflow: 'auto',
                    padding: 10
                  }}
                >
                  {prompt.map((pro, proIndex) =>
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
                            setPromptIndex(proIndex);
                            setDeleteDialog(true);
                          }}
                        />
                        <Editor
                          editorState={pro.editorState}
                          onEditorStateChange={(e) => onchange(e, 'promptText', proIndex)}
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
                                setPromptIndex(proIndex);
                                setDeleteDialog(true);
                              }}
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
                                  ? onPromptMediaUploadClick(`promptMedia${proIndex}`)
                                  : onRemovePromptMedia('promptMedia', proIndex)
                              }
                            >
                              <input
                                style={{ display: 'none' }}
                                // ref={promptMedia}
                                id={`promptMedia${proIndex}`}
                                onChange={(event) => onchange(event, 'promptMedia', proIndex)}
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
                                  <ImageComponent placeholder="Prompt" value={pro.value} />
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
                                <div>Prompt Image</div>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div style={{ marginBottom: 10, position: 'relative' }}>
                            <DeletePrompt
                              onClick={() => {
                                setPromptType('media');
                                setPromptIndex(proIndex);
                                setDeleteDialog(true);
                              }}
                            />
                            <SelectAudioButton
                              onClick={() =>
                                !pro.value
                                  ? onPromptMediaUploadClick(`promptMedia${proIndex}`)
                                  : onRemovePromptMedia('promptMedia', proIndex)
                              }
                              value={pro.value}
                            />
                            <input
                              style={{ display: 'none' }}
                              // ref={promptMedia}
                              id={`promptMedia${proIndex}`}
                              onChange={(event) => onchange(event, 'promptMedia', proIndex)}
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
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    style={{
                      padding: 3,
                      paddingRight: 10,
                      paddingLeft: 10,
                      marginBottom: 10,
                      marginRight: 10
                    }}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                  >
                    Add
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
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
                      <MenuItem key={prompt} onClick={() => handleAddPrompt(prompt)}>
                        {prompt}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              </div>
            </Grid>
          ) : (
            <Grid item xs={8}>
              {type === 'image' ? (
                <Button
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    border: '1px solid rgba(145, 158, 171, 0.32)',
                    padding: 0
                  }}
                  onClick={() => (!displayImage ? onUploadClick() : onRemoveClick())}
                >
                  <input
                    style={{ display: 'none' }}
                    ref={inputFile}
                    onChange={(event) => handleFileUpload(event)}
                    type="file"
                    accept="image/*"
                  />
                  {displayImage ? (
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
                      <img
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        alt={placeholder}
                        src={value}
                      />
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
                    <div>{placeholder}</div>
                  )}
                </Button>
              ) : (
                <div>
                  {type === 'select' ? (
                    <Dropdown
                      itemsArray={inputArray}
                      selectedItem={value}
                      handleChange={onchange}
                    />
                  ) : (
                    <Textbox
                      id={inputId}
                      value={value}
                      onChange={onchange}
                      placeholder={placeholder}
                      type={type}
                      fullWidth
                    />
                  )}{' '}
                </div>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Page
      title={`${pathname === '/dashboard/edit/topic' ? 'Edit Topic' : 'Add Topic'} | GK-MCQ-UI`}
    >
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {pathname === '/dashboard/edit/topic' ? 'Edit Topic' : 'Add New Topic'}
          </Typography>
          <Button
            variant="contained"
            // startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => {
              props.clearUploadFile();
              navigate(-1);
            }}
          >
            Back
          </Button>
        </Stack>
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
            {topicInput(
              'section',
              'Section',
              section,
              (e) => setSection(e.target.value),
              'Section',
              'select',
              sectionArray
            )}
            {topicInput('name', 'Name', name, (e) => setName(e.target.value), 'Name')}
            {topicInput('image', 'Image', displayImage, null, 'Topic Image', 'image')}
            {topicInput(
              'level',
              'Level',
              level,
              (e) => setLevel(e.target.value),
              'Level',
              'select',
              numberArray
            )}
            {topicInput(
              'rowNo',
              'Row Number',
              rowNo,
              (e) => setRowNo(e.target.value),
              'Row Number',
              'select',
              numberArray
            )}
            {topicInput(
              'position',
              'Position',
              position,
              (e) => setPosition(e.target.value),
              'Position',
              'select',
              positionArray
            )}
            {/* {topicInput('introPrompt', 'Introduction Prompt', prompt, handlePrompt)} */}
            <LoadingButton
              variant="contained"
              style={{ width: 200, padding: 10, marginTop: 10 }}
              disabled={saveDisabled()}
              loading={
                pathname === '/dashboard/edit/topic'
                  ? props.updateTopicLoading
                  : props.addTopicLoading
              }
              onClick={() => handleSave()}
            >
              Save
            </LoadingButton>
          </Box>
        </Card>
      </Container>
      <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => handleDeletePromptComponent()}
        dialogTitle={PROMPT}
        dialogMessage={DELETE_PROMPT_COMPONENT_MESSAGE}
      />
    </Page>
  );
}

const mapStateToProps = (state) => ({
  addTopicData: state.addTopicData.data,
  addTopicLoading: state.addTopicData.loading,
  addTopicError: state.addTopicData.error,

  updateTopicData: state.updateTopicData.data,
  updateTopicLoading: state.updateTopicData.loading,
  updateTopicError: state.updateTopicData.error,

  uploadFileData: state.uploadFileData.data,
  uploadFileLoading: state.uploadFileData.loading,
  uploadFileError: state.uploadFileData.error,

  deleteFileData: state.deleteFileData.data,
  deleteFileLoading: state.uploadFileData.loading,
  deleteFileError: state.uploadFileData.error
});
export default connect(mapStateToProps, {
  createTopic,
  updateTopic,
  uploadFile,
  clearUploadFile,
  deleteFile
})(AddEditTopic);
