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
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
// components
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import _ from 'lodash';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Iconify from '../components/Iconify';
import AudioPlayer from '../components/AudioPlayer';
import Dropdown from '../components/Dropdown';
import CommonCheckbox from '../components/CommonCheckbox';
import DeleteIcon from '../assets/Images/delete.svg';
import {
  getErrorMessage,
  questionTypes,
  arraysAreIdentical,
  promptTypeArray
} from '../utils/appUtils';
import Textbox from '../components/Textbox';
import Page from '../components/Page';
import { createQuestion } from '../actions/adminActions/addQuestion';
import { fetchTopicList } from '../actions/adminActions/topicList';
import { fetchQuestion } from '../actions/adminActions/getQuestionById';
import { updateQuestion } from '../actions/adminActions/updateQuestion';
import { uploadFile, clearUploadFile } from '../actions/adminActions/uploadFile';
import CommonDialog from '../components/CommonDialog';
import { deleteFile } from '../actions/adminActions/deleteFile';
import { PROMPT, DELETE_PROMPT_COMPONENT_MESSAGE } from '../utils/strings';
import TextArea from '../components/TextArea';

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

function AddEditQuestion(props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [topicListData, setTopicListData] = useState([]);
  const [topicId, setTopicId] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [type, setType] = useState('MCQ');
  const [displayImage, setDisplayImage] = useState(null);
  const [title, setTitle] = useState('');
  // const [composerName, setComposerName] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState([{ option: '', correctAnswer: true }]);
  const inputFile = useRef(null);
  const inputAudio = useRef(null);
  const optionInput = useRef([]);
  const [anchorEl, setAnchorEl] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  // const [promptIndex, setPromptIndex] = useState({});
  // const [promptType, setPromptType] = useState(null);

  const { state, pathname } = useLocation();

  const onError = (err) => {
    const error = getErrorMessage(err);
    if (error) {
      enqueueSnackbar(error, {
        variant: 'error'
      });
    }
  };

  const onDeleteFileResponse = (res, fileType, index, promptIndex) => {
    if (res.data.status === 200) {
      if (fileType === 'displayImage') {
        setDisplayImage('');
        inputFile.current.value = '';
      } else if (fileType === 'audioUrl') {
        setAudioUrl('');
        inputAudio.current.value = '';
      } else if (fileType && fileType === 'promptMedia') {
        const newOptions = [...options];
        const tempOptions = { ...newOptions[index] };
        // tempOptions.prompt[promptIndex].value = '';
        newOptions[index] = tempOptions;
        setOptions(newOptions);
        // document.getElementById(`${fileType}${index}${promptIndex}`).value = '';
      } else if (fileType && fileType === 'option') {
        const newOptions = [...options];
        const tempOptions = { ...newOptions[index] };
        tempOptions.option = '';
        newOptions[index] = tempOptions;
        setOptions(newOptions);
        optionInput.current[index].value = '';
      }
    }
  };

  const deleteFile = async (file, fileType, index, promptIndex) => {
    await props.deleteFile(
      { file },
      (err) => onError(err),
      (res) => onDeleteFileResponse(res, fileType, index, promptIndex)
    );
  };

  useEffect(() => {
    props.fetchTopicList((err) => onError(err));
    if (pathname === '/dashboard/edit/question' && state) {
      const { questionId } = state;
      props.fetchQuestion(questionId, (err) => onError(err));
    }
    if (pathname === '/dashboard/edit/question' && !state) {
      navigate('/dashboard/question');
    }
  }, []);

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
    if (state && pathname === '/dashboard/edit/question') {
      const data = props.getQuestionData ? props.getQuestionData : null;
      if (data) {
        setQuestionTitle(data.questionTitle);
        setDisplayImage(data.image ? data.image : null);
        setAudioUrl(data.audio ? data.audio : null);
        setType(data.type);
        if (data.type === 'Fill in the blanks' || data.type === 'Tapping Rhythm')
          setAnswer(data.answer[0]);
        const newOptions = data.options.map((option) => {
          const tempOption = {
            ...option
            // prompt: option.prompt.map((pro) => (pro.type === 'text' ? getPrompt(pro) : pro))
          };
          return tempOption;
        });
        setOptions(newOptions);
        setTitle(data.title);
        // setComposerName(data.composerName ? data.composerName : '');
      }
    }
  }, [props.getQuestionData]);

  useEffect(() => {
    const data = props.topicListData ? props.topicListData : [];
    setTopicListData(data);
    if (data.length !== 0) setTopicId(state && state.topicId ? state.topicId : data[0]._id);
  }, [props.topicListData]);

  useEffect(() => {
    if (pathname === '/dashboard/add/question') {
      const data = props.addQuestionData ? props.addQuestionData : null;
      if (data) {
        props.clearUploadFile();
      }
    }
  }, [props.addQuestionData]);

  useEffect(() => {
    if (state && pathname === '/dashboard/edit/question') {
      const data = props.updateQuestionData ? props.updateQuestionData : null;
      console.log('data', data);
      if (data) {
        props.clearUploadFile();
      }
    }
  }, [props.updateQuestionData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) await uploadFile(file, 'questionImage');
  };

  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (file) await uploadFile(file, 'questionAudio');
  };

  const onUploadClick = () => {
    inputFile.current.click();
  };

  const onRemoveClick = async () => {
    if (displayImage) await deleteFile(displayImage, 'displayImage');
  };

  const onAudioUploadClick = () => {
    inputAudio.current.click();
  };

  const onRemoveAudioClick = async () => {
    if (audioUrl) await deleteFile(audioUrl, 'audioUrl');
  };

  const onOptionAudioUploadClick = (index) => {
    optionInput.current[index].click();
  };

  const onRemoveOptionMedia = async (fileType, mediaIndex) => {
    if (options[mediaIndex].option)
      await deleteFile(options[mediaIndex].option, fileType, mediaIndex);
  };

  const onPromptMediaUploadClick = (id) => {
    document.getElementById(id).click();
  };

  const onRemovePromptMedia = async (fileType, index, promptIndex) => {
    if (options[index].prompt[promptIndex].value)
      await deleteFile(options[index].prompt[promptIndex].value, fileType, index, promptIndex);
  };

  const uploadFile = (file, type, index, promptIndex) => {
    const data = {
      files: file
    };

    props.uploadFile(data, (err) => onError(err), type, index, promptIndex);
  };

  const createQuestion = async () => {
    const data = {
      questionTitle,
      type,
      title,
      topicId
    };
    // if (composerName) data.composerName = composerName;
    if (displayImage) data.image = displayImage;
    if (audioUrl) data.audio = audioUrl;
    let correctAnswer;
    if (type === 'Ranking' || type === 'Ranking (Audio)')
      correctAnswer = options.map((option) => `${option.option}`);
    else if (type === 'Fill in the blanks' || type === 'Tapping Rhythm') {
      correctAnswer = [answer];
    } else if (type === 'Mix and Match') {
      correctAnswer = options.map((option) => `${option.matchOption}`);
    } else {
      const answer = options.filter((option) => option.correctAnswer === true);
      correctAnswer = [answer[0].option];
    }
    const newOptions = options.map((option) => {
      const tempOption = {
        ...option
        // prompt: option.prompt.map((pro) => {
        //   const prompt = {
        //     type: pro.type,
        //     value: pro.value
        //   };
        //   return prompt;
        // })
      };
      return tempOption;
    });
    const mcqOption = await newOptions.map((option) => {
      const data = {
        option: option.option,
        correctAnswer: option.correctAnswer
        // prompt: option.prompt
      };
      if (option.audioName) data.audioName = option.audioName;
      if (option.imageName) data.imageName = option.imageName;
      if (option.matchOption) data.matchOption = option.matchOption;
      return data;
    });
    data.options = mcqOption;
    data.answer = [...correctAnswer];

    props.createQuestion(data, navigate, (err) => onError(err));
  };
  const updateQuestion = async () => {
    const data = {};
    if (questionTitle !== props.getQuestionData.questionTitle) data.questionTitle = questionTitle;
    if (displayImage && displayImage !== props.getQuestionData.image) data.image = displayImage;
    if (type !== props.getQuestionData.type) data.type = type;
    if (audioUrl && audioUrl !== props.getQuestionData.audio) data.audio = audioUrl;
    const newOptions = options.map((option) => {
      const tempOption = {
        ...option
        // prompt: option.prompt.map((pro) => {
        //   const prompt = {
        //     type: pro.type,
        //     value: pro.value
        //   };
        //   return prompt;
        // })
      };
      return tempOption;
    });
    const mcqOption = await newOptions.map((option) => {
      const data = {
        option: option.option,
        correctAnswer: option.correctAnswer
        // prompt: option.prompt
      };
      if (option.audioName) data.audioName = option.audioName;
      if (option.imageName) data.imageName = option.imageName;
      if (option.matchOption) data.matchOption = option.matchOption;
      return data;
    });
    data.options = mcqOption;
    let correctAnswer;
    if (type === 'Ranking' || type === 'Ranking (Audio)')
      correctAnswer = options.map((option) => `${option.option}`);
    else if (type === 'Fill in the blanks' || type === 'Tapping Rhythm') {
      correctAnswer = [answer];
    } else if (type === 'Mix and Match') {
      correctAnswer = options.map((option) => `${option.matchOption}`);
    } else {
      const answer = options.filter((option) => option.correctAnswer === true);
      correctAnswer = [answer[0].option];
    }
    if (!arraysAreIdentical(props.getQuestionData.answer, correctAnswer))
      data.answer = [...correctAnswer];
    if (title !== props.getQuestionData.title) data.title = title;
    // if (composerName && composerName !== props.getQuestionData.composerName)
    //   data.composerName = composerName;
    if (topicId !== props.getQuestionData.topicId) data.topicId = topicId;
    props.updateQuestion(state.questionId, data, navigate, topicId, (err) => onError(err));
  };

  useEffect(() => {
    const data = props.uploadFileData ? props.uploadFileData : '';
    if (data) {
      if (data.type === 'questionImage') {
        setDisplayImage(data.file);
      }
      if (data.type === 'questionAudio') {
        setAudioUrl(data.file);
      }
      if (data.type === 'option' || data.type === 'promptMedia') {
        const newOptions = [...options];
        const tempOptions = { ...newOptions[data.fileIndex] };
        const { file } = data;
        // if (
        //   (data.type === 'promptMedia',
        //   tempOptions && tempOptions.prompt && tempOptions.prompt[data.promptIndex])
        // )
        //   tempOptions.prompt[data.promptIndex].value = file;
        // else
        tempOptions.option = file;
        newOptions[data.fileIndex] = tempOptions;
        setOptions(newOptions);
      }
    }
  }, [props.uploadFileData]);

  const saveDisabled = () => {
    const isMcqOptionsEmpty = options.find((opt) => !opt.option);
    const isMcqMatchOptionEmpty = options.find((opt) => !opt.matchOption);
    const isMcqAnswerEmpty = options.find((opt) => opt.correctAnswer);

    // const promptEmpty = options.find((opt) => opt.prompt.some((item) => item.value === ''));

    const disableSave =
      !questionTitle ||
      props.updateQuestionLoading ||
      props.addQuestionLoading ||
      !type ||
      !title ||
      // promptEmpty ||
      props.uploadFileLoading;

    let validateOption;
    if (type === 'MCQ (Audio)') validateOption = isMcqOptionsEmpty || !isMcqAnswerEmpty;
    else if (type === 'Mix and Match') validateOption = isMcqOptionsEmpty || isMcqMatchOptionEmpty;
    else if (type === 'MCQ (Image)') {
      validateOption = isMcqOptionsEmpty || !isMcqAnswerEmpty;
    } else if (type === 'Ranking' || type === 'Ranking (Audio)') validateOption = isMcqOptionsEmpty;
    else if (type === 'Fill in the blanks') validateOption = isMcqOptionsEmpty || !answer;
    else if (type === 'Tapping Rhythm') validateOption = isMcqOptionsEmpty || !answer;
    else validateOption = isMcqOptionsEmpty || !isMcqAnswerEmpty;

    if (pathname === '/dashboard/add/question') {
      if (disableSave || props.addQuestionLoading || validateOption) {
        return true;
      }
    }
    if (pathname === '/dashboard/edit/question') {
      if (
        disableSave ||
        props.updateQuestionLoading ||
        validateOption
        // (props.getQuestionData.composerName && !composerName)
      ) {
        return true;
      }
    }
    return false;
  };

  const handleOption = async (e, inputName, inputIndex, promptIndex) => {
    const newOptions = [...options];
    if (inputName === 'correctAnswer') {
      const answer = false;
      const tempOptions = newOptions.map((opt, index) => ({
        ...opt,
        correctAnswer: inputIndex === index ? !answer : answer
      }));
      setOptions(tempOptions);
    } else if (inputName === 'audioOption' || inputName === 'imageOption') {
      const tempOptions = { ...newOptions[inputIndex] };
      const file = e.target.files[0];
      // if (tempOptions.option && file) await deleteFile(tempOptions.option);
      if (file) uploadFile(file, 'option', inputIndex);
    } else if (inputName === 'promptText') {
      const tempOptions = { ...newOptions[inputIndex] };
      // tempOptions.prompt[promptIndex].editorState = e;
      // tempOptions.prompt[promptIndex].value = draftToHtml(convertToRaw(e.getCurrentContent()));
      newOptions[inputIndex] = tempOptions;
      setOptions(newOptions);
    } else if (inputName === 'promptMedia') {
      const tempOptions = { ...newOptions[inputIndex] };
      const file = e.target.files[0];
      // if (tempOptions.prompt[promptIndex].value && file)
      //   await deleteFile(tempOptions.prompt[promptIndex].value);
      if (file) await uploadFile(file, 'promptMedia', inputIndex, promptIndex);
    } else {
      const tempOptions = { ...newOptions[inputIndex] };
      tempOptions[inputName] = e.target.value;
      newOptions[inputIndex] = tempOptions;
      setOptions(newOptions);
    }
  };

  const handleSave = async () => {
    if (pathname === '/dashboard/edit/question') {
      updateQuestion();
    }
    if (pathname === '/dashboard/add/question') {
      createQuestion();
    }
  };

  const handleOnDeleteOption = async (optionIndex) => {
    const newOptions = [...options];
    const tempOptions = { ...newOptions[optionIndex] };
    if (
      type === 'MCQ (Audio)' ||
      type === 'MCQ (Image)' ||
      type === 'Ranking (Audio)' ||
      type === 'Mix and Match' ||
      type === 'Tapping Rhythm'
    ) {
      await deleteFile(tempOptions.option);
    }
    // tempOptions.prompt.forEach((pro) => {
    //   if (pro.type !== 'text' && pro.value) {
    //     deleteFile(pro.value);
    //   }
    // });
    const filteredOptions = options.filter((option, index) => index !== optionIndex);
    setOptions(filteredOptions);
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

  const handleAddPrompt = (prompt, index) => {
    const newOption = [...options];
    const tempOption = { ...newOption[index] };
    if (prompt === 'Text') tempOption.prompt = [...tempOption.prompt, { type: 'text', value: '' }];
    else if (prompt === 'Image')
      tempOption.prompt = [...tempOption.prompt, { type: 'image', value: '' }];
    else tempOption.prompt = [...tempOption.prompt, { type: 'audio', value: '' }];
    newOption[index] = tempOption;
    setOptions(newOption);
    handleClose(index);
  };

  const handleDeletePromptComponent = async () => {
    const newOption = [...options];
    // const tempOption = { ...newOption[promptIndex.optionIndex] };
    // if (promptType === 'media' && tempOption.prompt[promptIndex.promptIndex].value)
    //   await deleteFile(tempOption.prompt[promptIndex.promptIndex].value);
    // tempOption.prompt = await tempOption.prompt.filter(
    //   (pro, index) => index !== promptIndex.promptIndex
    // );
    // newOption[promptIndex.optionIndex] = tempOption;
    setOptions(newOption);
    // handleClose(promptIndex.optionIndex);
    setDeleteDialog(false);
  };

  const topicInput = (inputId, inputName, value, onchange, placeholder, inputType, inputArray) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0px' }}>
      <Grid container direction="row">
        <Grid item container alignItems="center">
          {inputId !== 'MCQ' &&
            inputId !== 'MCQ (Audio)' &&
            inputId !== 'MCQ (Image)' &&
            inputId !== 'Ranking' &&
            inputId !== 'Ranking (Audio)' &&
            inputId !== 'Fill in the blanks' &&
            inputId !== 'Mix and Match' &&
            inputId !== 'Tapping Rhythm' && (
              <Grid item xs={4}>
                <Typography variant="body1">{inputName}</Typography>
              </Grid>
            )}

          <Grid
            item
            xs={
              inputId === 'MCQ' ||
              inputId === 'MCQ (Audio)' ||
              inputId === 'MCQ (Image)' ||
              inputId === 'Ranking' ||
              inputId === 'Ranking (Audio)' ||
              inputId === 'Fill in the blanks' ||
              inputId === 'Mix and Match' ||
              inputId === 'Tapping Rhythm'
                ? 12
                : 8
            }
          >
            {inputId === 'MCQ' ||
            inputId === 'MCQ (Audio)' ||
            inputId === 'MCQ (Image)' ||
            inputId === 'Ranking' ||
            inputId === 'Ranking (Audio)' ||
            inputId === 'Fill in the blanks' ||
            inputId === 'Mix and Match' ||
            inputId === 'Tapping Rhythm' ? (
              <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                {options.map((opt, index) => (
                  <div style={{ width: '100%' }} key={`opt${index + 1}`}>
                    <Grid container direction="column" mb={index === options.length ? 0 : 5}>
                      <Grid item container alignItems="center" mb={1}>
                        <Grid item xs={4}>
                          <Typography variant="body1">Option</Typography>
                        </Grid>
                        <Grid item xs={8}>
                          {inputId === 'MCQ' ||
                          inputId === 'Ranking' ||
                          inputId === 'Fill in the blanks' ? (
                            <Textbox
                              id={`option${index}`}
                              value={opt.option}
                              onChange={(e) => onchange(e, 'option', index)}
                              // placeholder={placeholder}
                              fullWidth
                            />
                          ) : (
                            <div>
                              {inputId === 'MCQ (Audio)' ||
                              inputId === 'Ranking (Audio)' ||
                              inputId === 'Mix and Match' ||
                              inputId === 'Tapping Rhythm' ? (
                                <>
                                  <SelectAudioButton
                                    onClick={() =>
                                      !opt.option
                                        ? onOptionAudioUploadClick(index)
                                        : onRemoveOptionMedia('option', index)
                                    }
                                    value={opt.option}
                                  />
                                  <input
                                    style={{ display: 'none' }}
                                    ref={(el) => (optionInput.current[index] = el)}
                                    onChange={(event) => onchange(event, 'audioOption', index)}
                                    type="file"
                                    accept="audio/*"
                                  />
                                  {opt.option && <AudioPlayer audioUrl={opt.option} />}
                                </>
                              ) : (
                                <Button
                                  style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 8,
                                    border: '1px solid rgba(145, 158, 171, 0.32)',
                                    padding: 0
                                  }}
                                  onClick={() =>
                                    !opt.option
                                      ? onOptionAudioUploadClick(index)
                                      : onRemoveOptionMedia('option', index)
                                  }
                                >
                                  <input
                                    style={{ display: 'none' }}
                                    ref={(el) => (optionInput.current[index] = el)}
                                    onChange={(event) => onchange(event, 'imageOption', index)}
                                    type="file"
                                    accept="image/*"
                                  />
                                  {opt.option ? (
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
                                      <ImageComponent placeholder="Option" value={opt.option} />
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
                                    <div>Option Image</div>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </Grid>
                      </Grid>
                      {(inputId === 'MCQ (Audio)' ||
                        inputId === 'MCQ (Image)' ||
                        inputId === 'Mix and Match' ||
                        inputId === 'Ranking (Audio)') && (
                        <Grid item container alignItems="center" mb={1}>
                          <Grid item xs={4}>
                            <Typography variant="body1">
                              {inputId === 'MCQ (Image)' ? 'Image Name' : 'Audio Name'}
                            </Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Textbox
                              id={`${
                                inputId === 'MCQ (Image)' ? 'imageName' : 'audioName'
                              }${index}`}
                              value={inputId === 'MCQ (Image)' ? opt.imageName : opt.audioName}
                              onChange={(e) =>
                                onchange(
                                  e,
                                  inputId === 'MCQ (Image)' ? 'imageName' : 'audioName',
                                  index
                                )
                              }
                              // placeholder={placeholder}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      )}
                      {inputId === 'Mix and Match' && (
                        <Grid item container alignItems="center" mb={1}>
                          <Grid item xs={4}>
                            <Typography variant="body1">Match Option</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Textbox
                              id={`matchOption${index}`}
                              value={opt.matchOption}
                              onChange={(e) => onchange(e, 'matchOption', index)}
                              // placeholder={placeholder}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      )}
                      <Grid item container alignItems="center" mb={1}>
                        {/* <Grid item xs={12}>
                          <Typography variant="body1">Prompt Information</Typography>
                        </Grid> */}
                        {/* <Grid item xs={12}>
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
                              {opt.prompt &&
                                opt.prompt.map((pro, proIndex) =>
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
                                          setPromptIndex({
                                            optionIndex: index,
                                            promptIndex: proIndex
                                          });
                                          setDeleteDialog(true);
                                        }}
                                      />
                                      <Editor
                                        editorState={pro.editorState}
                                        onEditorStateChange={(e) =>
                                          onchange(e, 'promptText', index, proIndex)
                                        }
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
                                              setPromptIndex({
                                                optionIndex: index,
                                                promptIndex: proIndex
                                              });
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
                                                ? onPromptMediaUploadClick(
                                                    `promptMedia${index}${proIndex}`
                                                  )
                                                : onRemovePromptMedia(
                                                    'promptMedia',
                                                    index,
                                                    proIndex
                                                  )
                                            }
                                          >
                                            <input
                                              style={{ display: 'none' }}
                                              // ref={promptMedia}
                                              id={`promptMedia${index}${proIndex}`}
                                              onChange={(event) =>
                                                onchange(event, 'promptMedia', index, proIndex)
                                              }
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
                                                <ImageComponent
                                                  placeholder="Prompt"
                                                  value={pro.value}
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
                                              <div>Prompt Image</div>
                                            )}
                                          </Button>
                                        </div>
                                      ) : (
                                        <div style={{ marginBottom: 10, position: 'relative' }}>
                                          <DeletePrompt
                                            onClick={() => {
                                              setPromptType('media');
                                              setPromptIndex({
                                                optionIndex: index,
                                                promptIndex: proIndex
                                              });
                                              setDeleteDialog(true);
                                            }}
                                          />
                                          <SelectAudioButton
                                            onClick={() =>
                                              !pro.value
                                                ? onPromptMediaUploadClick(
                                                    `promptMedia${index}${proIndex}`
                                                  )
                                                : onRemovePromptMedia(
                                                    'promptMedia',
                                                    index,
                                                    proIndex
                                                  )
                                            }
                                            value={pro.value}
                                          />
                                          <input
                                            style={{ display: 'none' }}
                                            // ref={promptMedia}
                                            id={`promptMedia${index}${proIndex}`}
                                            onChange={(event) =>
                                              onchange(event, 'promptMedia', index, proIndex)
                                            }
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
                                onClick={(e) => handleClick(e, index)}
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
                                anchorEl={anchorEl[index]}
                                open={Boolean(anchorEl[index])}
                                onClose={() => handleClose(index)}
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
                                    onClick={() => handleAddPrompt(prompt, index)}
                                  >
                                    {prompt}
                                  </MenuItem>
                                ))}
                              </Menu>
                            </div>
                          </div>
                        </Grid> */}
                      </Grid>
                      <Grid item container alignItems="center">
                        <Grid item xs={4}>
                          {inputId !== 'Ranking' &&
                            inputId !== 'Ranking (Audio)' &&
                            inputId !== 'Fill in the blanks' &&
                            inputId !== 'Mix and Match' &&
                            inputId !== 'Tapping Rhythm' && (
                              <Typography variant="body1">Correct Answer</Typography>
                            )}
                        </Grid>
                        <Grid item xs={8} display="flex" justifyContent="space-between">
                          {inputId !== 'Ranking' &&
                            inputId !== 'Ranking (Audio)' &&
                            inputId !== 'Fill in the blanks' &&
                            inputId !== 'Mix and Match' &&
                            inputId !== 'Tapping Rhythm' && (
                              <CommonCheckbox
                                id={`answer${index}`}
                                checked={opt.correctAnswer}
                                onChange={(e) => onchange(e, 'correctAnswer', index)}
                              />
                            )}
                          {options.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Iconify icon="eva:trash-2-outline" />}
                              style={{
                                minWidth: 100,
                                marginLeft:
                                  inputId !== 'Ranking' &&
                                  inputId !== 'Ranking (Audio)' &&
                                  inputId !== 'Fill in the blanks' &&
                                  inputId !== 'Mix and Match'
                                    ? 5
                                    : 'auto'
                              }}
                              onClick={() => handleOnDeleteOption(index)}
                            >
                              Delete
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                ))}
                {inputId !== 'Tapping Rhythm' && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (
                        type === 'Ranking' ||
                        type === 'Ranking (Audio)' ||
                        type === 'Fill in the blanks' ||
                        type === 'Mix and Match'
                      )
                        setOptions([...options, { option: '' }]);
                      else setOptions([...options, { option: '', correctAnswer: false }]);
                    }}
                  >
                    Add Option
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {inputType === 'image' ? (
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
                        <ImageComponent placeholder={placeholder} value={value} />
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
                    {inputType === 'audio' ? (
                      <>
                        <SelectAudioButton
                          onClick={() => (!audioUrl ? onAudioUploadClick() : onRemoveAudioClick())}
                          value={audioUrl}
                        />
                        <input
                          style={{ display: 'none' }}
                          ref={inputAudio}
                          onChange={(event) => handleAudioUpload(event)}
                          type="file"
                          accept="audio/*"
                        />
                        {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
                      </>
                    ) : (
                      <div>
                        {inputType === 'select' ? (
                          <Dropdown
                            itemsArray={inputArray}
                            selectedItem={value}
                            handleChange={onchange}
                          />
                        ) : (
                          <div>
                            {inputId === 'questionTitle' ? (
                              <TextArea
                                id={inputId}
                                value={value}
                                onChange={onchange}
                                placeholder={placeholder}
                                type={inputType}
                              />
                            ) : (
                              <Textbox
                                id={inputId}
                                value={value}
                                onChange={onchange}
                                placeholder={placeholder}
                                type={inputType}
                                fullWidth
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Page
      title={`${
        pathname === '/dashboard/edit/question' ? 'Edit Question' : 'Add Question'
      } | GK-MCQ-UI`}
    >
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {pathname === '/dashboard/edit/question' ? 'Edit Question' : 'Add New Question'}
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
        {props.topicListLoading || props.getQuestionLoading ? (
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
              {topicInput(
                'type',
                'Type',
                type,
                (e) => {
                  setType(e.target.value);
                  if (
                    e.target.value === 'Ranking' ||
                    e.target.value === 'Ranking (Audio)' ||
                    e.target.value === 'Fill in the blanks' ||
                    e.target.value === 'Mix and Match' ||
                    e.target.value === 'Tapping Rhythm'
                  ) {
                    setOptions([{ option: '' }]);
                    setAnswer('');
                  } else {
                    setOptions([{ option: '', correctAnswer: true }]);
                    setAnswer('');
                  }
                },
                'Type',
                'select',
                questionTypes
              )}
              {topicInput(
                'questionTitle',
                'Question',
                questionTitle,
                (e) => setQuestionTitle(e.target.value),
                'Question'
              )}
              {topicInput('title', 'Title', title, (e) => setTitle(e.target.value), 'Title')}
              {/* {topicInput(
                'composerName',
                'Composer Name',
                composerName,
                (e) => setComposerName(e.target.value),
                'Composer Name'
              )} */}
              {topicInput(
                'topic',
                'Topic',
                topicId,
                (e) => setTopicId(e.target.value),
                'Topic',
                'select',
                topicListData
              )}
              {topicInput('image', 'Image', displayImage, null, 'Question Image', 'image')}
              {topicInput('audio', 'Audio', audioUrl, null, 'Audio', 'audio')}
              {(type === 'Fill in the blanks' || type === 'Tapping Rhythm') &&
                topicInput('answer', 'Answer', answer, (e) => setAnswer(e.target.value), 'Answer')}
              {topicInput(type, 'Options', options, handleOption)}
              <LoadingButton
                variant="contained"
                style={{ width: 200, padding: 10, marginTop: 10 }}
                disabled={saveDisabled()}
                loading={
                  pathname === '/dashboard/edit/question'
                    ? props.updateQuestionLoading
                    : props.addQuestionLoading
                }
                onClick={() => handleSave()}
              >
                Save
              </LoadingButton>
            </Box>
          </Card>
        )}
      </Container>
      {/* <CommonDialog
        open={deleteDialog}
        close={() => setDeleteDialog(false)}
        onSuccess={() => handleDeletePromptComponent()}
        dialogTitle={PROMPT}
        dialogMessage={DELETE_PROMPT_COMPONENT_MESSAGE}
      /> */}
    </Page>
  );
}

const mapStateToProps = (state) => ({
  addQuestionData: state.addQuestionData.data,
  addQuestionLoading: state.addQuestionData.loading,

  topicListData: state.topicListData.data,
  topicListLoading: state.topicListData.loading,

  getQuestionData: state.getQuestionData.data,
  getQuestionLoading: state.getQuestionData.loading,

  updateQuestionData: state.updateQuestionData.data,
  updateQuestionLoading: state.updateQuestionData.loading,

  uploadFileData: state.uploadFileData.data,
  uploadFileLoading: state.uploadFileData.loading,

  deleteFileData: state.deleteFileData.data,
  deleteFileLoading: state.uploadFileData.loading
});
export default connect(mapStateToProps, {
  createQuestion,
  fetchTopicList,
  fetchQuestion,
  updateQuestion,
  uploadFile,
  clearUploadFile,
  deleteFile
})(AddEditQuestion);
