import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import Button from '@material-ui/core/Button';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Carousel from "@brainhubeu/react-carousel";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import {
  ChevronDown,
  Upload,
  Square,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Trash2,
} from "react-feather";

import Frame from "../../360/Pages/FrameAframe";
import {
  updatePanoramaHotSpot
} from '../../redux/actions/hotspots'
import { 
  featuredOptions, 
  actionNames, 
  TOOLTIP_MAX_LENGTH, 
  INFO_PANEL_MAX_LENGTH 
}  from '../utils/Constants';
import {
  Row,
  Col,
  FormGroup,

  Label,
  Container,
} from "reactstrap";
import { FormControl } from "@material-ui/core";

const inputProps = {
  style:{
    width: '100%',
    color: '#fff9',
    paddingLeft: '5px',
    borderWidth: 1,
    backgroundColor: '#fff2',
    borderColor: '#2d2c2c',
    borderStyle: 'solid',
  }
}
const previewAframStyle = {
  zIndex: "1",
  width: "100%",
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
 
  },

  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "bold",
    textTransform: "uppercase",
    color:'white'
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    color:'#535353'
  },
  formControl: {
    margin: theme.spacing(0),
    minWidth: '100%',
    palette: {
      primary: {
        main: 'white'
      },
  },
}}));
const ActionForm = ({ style, spot, place, panoramaId }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(true);
  const createEditorState = (html) => {
    console.log('created html=>', html)
    let contentBlock;
    if (html) {
      contentBlock = htmlToDraft(html);
    } else {
      contentBlock = htmlToDraft('<p></p>');
    }
    console.log('created contentBlock=>', contentBlock)
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editor = EditorState.createWithContent(contentState);
      return editor;
    }
    return null;
  }
  const [editorState, setEditorState] = useState(() => {
    const index = actionNames.indexOf(spot.actionType);
    if (index === 2) {
      return createEditorState(spot.actionData)
    } else {
      return EditorState.createEmpty();
    }
  });
  const [htmlDoc, setHtmlDoc] = useState('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState(() => {
    if (spot.actionData && spot.actionData.url !== null) {
      return spot.actionData.url;
    }
    return '';
  });
  const [defaultPanorama, setDefaultPanorama] = useState(() => {
    if (spot.actionData && spot.actionData.panorama  !== null) {
      return spot.actionData.panorama;
    }
    return null;
  });
  const [defaultPanoramaIndex, setDefaultPanoramaIndex] = useState(() => {
    if (spot.actionData && spot.actionData.panoramaId !== null) {
      return spot.actionData.panoramaId;
    }
    return -1;
  });
  const [panoramas, setPanoramas] = useState(JSON.parse(place.imgsData[0]));
  const [delay, setdelay] = useState("1"); // define the delay
  const [rotation, setRotation] = useState(
    place.rotation
  );
  const [cameraRotation, setCameraRotation] = useState(() => {
    if (spot.actionData && spot.actionData.rotation !== null) {
      return spot.actionData.rotation;
    }
    return null;
  });
  const [isPlaying, setPlaying] = useState(false);

  useEffect(() => {
    const actionIndex = actionNames.indexOf(spot.actionType);
    if (actionIndex === 4 && spot.actionData && spot.actionData.rotation) { //panorama
      setCameraRotation(spot.actionData.rotation);      
    }
    if (actionIndex === 5) { //sound
      const audio = document.getElementById("test-audio");
      if (audio) {
        console.log('spot updated =>', spot)
        audio.load();
       }
    }
  }, [spot.actionData])

  function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue((value) => ++value); // update the state to force render
  }

  const forceUpdate = useForceUpdate();
  const  openWidget =  () => {
    let featuredWidget = window.cloudinary.createUploadWidget(
      featuredOptions,
      async (error, result) => {
        error ? console.log(result) : console.log("he");
        error ? console.log("error.status") : console.log("non");
        console.log(result.event);
        if (!error && result && result.event === "queues-end") {
          console.log(result.event);
          console.log(result.info.files[0]);
          if (result.info.files[0].uploadInfo != null) {
            let newSpot = { ...spot };
            newSpot.actionData = result.info.files[0];
            console.log('newFiles from cloudinary => ', newSpot);
            dispatch(updatePanoramaHotSpot(panoramaId, newSpot));

          // forceUpdate();

          }
        }
      }
    );
    featuredWidget.open();
  };
  const classes = useStyles();
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  }
  const handleLinkChange = (e) => {
    setLink(e.target.value);
  }
  const handleOpenChange = (e) => {
    setOpenNew(e.target.value);
  }
  const handleUploadImage = (e) => {
    openWidget()
  }
  const onEditorStateChange = (editorState) => {
    const contentBlocks = convertToRaw(editorState.getCurrentContent())
    const html = draftToHtml(contentBlocks);
    let textLen = 0;
    contentBlocks.blocks.map((block) => {
      textLen += block.text.length;
    })
    if (textLen < INFO_PANEL_MAX_LENGTH) {
      setEditorState(editorState);
      setHtmlDoc(html);
    }
  }
  const handleSaveAction = (e) => {
    e.preventDefault();
    const newSpot = { ...spot };
    console.log('newSpot BEFOR => ', newSpot);
    const actionIndex = actionNames.indexOf(spot.actionType);
    switch (actionIndex) {
      case 1: // image
        newSpot.actionTitle = title; // files are saved from cloudinary
        break;
      case 2: // html(panel)
      const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        newSpot.actionData = html;
        break;
      case 3: //url
        newSpot.actionData = {
          newOpenMode: openNew,
          url: link,
        };
        break;
      case 4: //panorama
        if (defaultPanorama) {
          const cameraEl = document.getElementById('preview-cammera'); 
          const rotateX = cameraEl.components['look-controls'].pitchObject.rotation.x;
          const rotateY = cameraEl.components['look-controls'].yawObject.rotation.y;

          newSpot.actionData = {
            panoramaId: defaultPanoramaIndex,
            panorama: defaultPanorama,
            rotation: {rotateX: rotateX, rotateY: rotateY},
          }
        } else {
          alert('Please select default panorama and set up view')
          return;
        }
        break;
      case 5: //sound
        newSpot.actionTitle = title; // files are saved from cloudinary
        break;
      default:
        newSpot.actionType = actionNames[0];
        newSpot.actionFiles = [];
        newSpot.actionData = null;
        return;
    }
    newSpot.actionEditing = false;
    console.log('newSpot => ', newSpot);
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleCloseAction = (e) => {
    e.preventDefault();
    const newSpot = { ...spot };
    newSpot.actionEditing = false;
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handlePanoramaPreviewChange = (e) => {
    console.log('handlePanoramaPreviewChange=>', e)
    // setPrePanoIndex(e.target.value || 0);
  }
  const handleImagePreviewChange = (e) => {
    console.log('handleImagePreviewChange=>', e)
  }
  const handleCheckPreview = (index) => (e) => {
    if(defaultPanoramaIndex === index) {
      setDefaultPanoramaIndex(-1);
      setDefaultPanorama(null);
    } else {
      setDefaultPanoramaIndex(index);
      setDefaultPanorama(panoramas[index].secure_url);
    }
  }
  const handleDeleteActionData = (index) => (e) => {
    const newSpot = { ...spot };
    // newSpot.actionFiles.splice(index, 1);
    newSpot.actionData = null;
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handlePlaySound = (e) => {
    setPlaying(true);
    const audio = document.getElementById("test-audio");
    if (audio) audio.play();
  }
  const handlePauseSound = (e) => {
    setPlaying(false);
    const audio = document.getElementById("test-audio");
    if (audio) audio.pause();
  }
  const actionIndex = actionNames.indexOf(spot.actionType);

 console.log('action sppot=>', spot);

  return (
    <UploadFormContainer >
      <div className="root">
        <Typography className="upload-text">Action: {spot.actionType}</Typography>
        { actionIndex === 1 && //images
          <>
            <Input
              id="input"
              inputProps={{...inputProps, maxlength:TOOLTIP_MAX_LENGTH}}
              placeholder="Image Title (option)"
              defaultValue={spot.actionTitle}
              onChange={handleTitleChange}
            />
            <sapn className="upload-button">
              {spot.actionData
                ? <Carousel
                    slidesPerPage={1}
                    offset={0}
                    draggable
                    arrows={true}
                    arrowLeft={<ChevronLeft/>}
                    arrowRight={<ChevronRight/>}
                    addArrowClickHandler={handleImagePreviewChange}
                  >
                    <>
                      <div className="spot-panoramas">
                        <Upload
                          size={20}
                          className="thumb-upload"
                          onClick={handleUploadImage}
                        />
                        <Trash2
                          size={20}
                          className="thumb-delete"
                          onClick={handleDeleteActionData(spot)}
                        />
                        <img
                          //thumb
                          src={spot.actionData.uploadInfo.thumbnail_url}
                          // key={panorama.asset_id}
                        />
                      </div>
                    </>
                  </Carousel>
                : <Upload onClick={handleUploadImage}/>
              }
            </sapn>
            <Typography className="upload-text">Allowed file types: png, jpg, gif</Typography>
          </>
        }
        {actionIndex === 2 && //html
          <>
            <Typography className="upload-text">Html Contents:</Typography>
            <Editor
              editorState={editorState}
              toolbarClassName="toolbarClassName"
              wrapperClassName="wrapperClassName"
              editorClassName="editorClassName"
              toolbar={{
                options: ['inline','list', 'link', 'image', 'remove', 'history'],
                inline: {
                  options: ['bold', 'italic', 'underline', 'strikethrough'],
                },
                list: {
                  options: ['unordered', 'ordered'],
                },
              }}
              onEditorStateChange={onEditorStateChange}
            />           
          </>
        }
        { actionIndex === 3 && //link
          <>
            <Input
              id="input"
              inputProps={inputProps}
              placeholder="Enter full Url e.g:https://www.walkin.com"
              defaultValue={spot.actionData && spot.actionData.url ? spot.actionData.url: ''}
              value={link}
              onChange={handleLinkChange}
              />
              <div className="open-tab">
                <Typography className="text">
                  Open in new Tab/Window
                </Typography>
                <NativeSelect
                  className="open-select"
                  value={spot.actionData && spot.actionData.newOpenMode ? spot.actionData.newOpenMode: openNew}
                  IconComponent={ChevronDown}
                  onChange={handleOpenChange}
                  inputProps={{
                    style:{
                      paddingLeft: '5px',
                      borderWidth: 1,
                      borderColor: '#565656',
                      borderStyle: 'solid',
                      backgroundColor: '#fff2',
                    }
                  }}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </NativeSelect>
              </div>
          </>
        }
        { actionIndex === 4 && //panorama
          <>

          <FormControl className={classes.formControl}>
              <Container className="pl-0 pr-0 mb-0">
              <Row className="pl-0 pr-0 mb-0">
             <Col className="pl-0 pr-0 mb-0">
    
            <div className="panorama-view">
              <Carousel
                slidesPerPage={1}
                offset={0}
                draggable
                arrows={true}
                arrowLeft={<ChevronLeft />}
                arrowRight={<ChevronRight />}
                addArrowClickHandler={handlePanoramaPreviewChange}
               >
                {panoramas.length > 0
                  ? panoramas.map((panorama, index) => {
                     console.log('defaultPanoramaIndex=>', defaultPanoramaIndex);
                     console.log('index=>', index);
                      return (
                        <>
                          <div className="spot-panoramas">
                            {defaultPanoramaIndex === index
                              ?
                              <CheckSquare
                                size={20}
                                className="preview-check"
                                onClick={handleCheckPreview(index)}
                              ></CheckSquare>
                              :<Square
                                size={20}
                                className="preview-check"
                                onClick={handleCheckPreview(index)}
                              ></Square>
                            }

                            <img
                              //thumb
                              src={panorama.thumbnail_url}
                              key={panorama.asset_id}
                            />
                          </div>
                        </>
                      );
                    })
                  : console.log("no")}
              </Carousel>
              {defaultPanorama !== null
                ? <div className="spot-panorama-preview">
                    <div onMouseDown={(e) => setRotation(false)}>
                        <Frame
                          style={previewAframStyle}
                          image={defaultPanorama}
                          cameraRotation={cameraRotation}
                          // animation={cameraRotation ? null : `property: rotation; from:0 0 0; to: 0 -360 0; loop: ${place.loop}; dur: ${place.rotationSpeed} delay:${delay}; dir:${place.direction};`}
                          zoom={place.zoom}
                          fov={"80"}
                          loading={true}
                        />
                    </div>
                  </div>
                : <div className="spot-panorama-preview">
                    Please set default panorama view.
                  </div>
              }
            </div>
            {/* <div className="default-view"></div> */}
            </Col>
              </Row>
              </Container>
              </FormControl>
          </>
        }
        { actionIndex === 5 && //sound
          <>
            <Input
              id="input"
              inputProps={inputProps}
              placeholder="Sound Title (option)"
              defaultValue={spot.actionTitle}
              onChange={handleTitleChange}
            />
            <sapn className="upload-button">
              {spot.actionData &&
                <>
                  <audio id="test-audio">
                    <source src={spot.actionData.uploadInfo.secure_url} type={spot.actionData.type} />
                    Your browser does not support the audio element.
                  </audio>
                  {isPlaying
                    ? <Pause onClick={handlePauseSound}/>
                    : <Play onClick={handlePlaySound}/>
                  }
                   <Trash2
                    className="audio-delete"
                    onClick={handleDeleteActionData(spot)}
                  />
                </>
              }
              <Upload onClick={handleUploadImage}/>
            </sapn>
            <Typography className="upload-text">Allowed file types: wav</Typography>
          </>
        }

          <div className="button-group">
            <Button className="button" onClick={handleSaveAction}>Save</Button>
            <Button className="button" onClick={handleCloseAction}>Close</Button>
          </div>

      </div>
    </UploadFormContainer>

  )
}
const UploadFormContainer = styled.div`
  .root {
    display: flex;
    flex-direction: column;
    background-color: #fff2;
    padding: 5px;
    color: #fff9;
  }
  .thumb-upload{
    color: white;
    position: absolute;
    top: 5px;
    left: 5px;
  }
  .thumb-delete{
    color: white;
    position: absolute;
    top: 5px;
    left: 25px;
  }
  .preview-check {
    ${'' /* color: "#0ca8fd"; */}
    color: white;
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .text {
    padding: 3px;
    margin: 0px;
  }
  .open-tab {
    margin: 3px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .open-select {
    color: #fff9;
  }
  .open-select option {
    color: #fff9;
    background-color: #2d2c2c !important;
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
  }
  .button {
    margin: 3px;
    padding: 3px;
    color: #fff9;
    border-radius: 3px;
    border: 1px solid #fff2;
    background-color: #fff2;
  }
  .upload-button {
    width: 100%;
    min-height: 100px;
    display: flex;
    justify-content: center;
    border: 1px dashed #fff2;
    /* margin: 3px; */
    padding: 3px;
  }
  .upload-button img{
    width: 100%;
    height: 100%;
    padding: 0px;
  }
  .toolbarClassName {
    background-color: #ffffffdb;
    display: flex;
    flex-wrap: wrap;
  }
  .toolbarClassName .rdw-option-active {
    background-color: #b1aeaeb3;
    border-radius: 2px;
  }
  .toolbarClassName .rdw-option-wrapper:hover {
    background-color: #b1aeaeb3;
    border-radius: 2px;
  }
  .toolbarClassName > div {
    display: flex;
  }
  .toolbarClassName img {
    width: auto;
    height: auto;
  }
  .editorClassName {
    height: 100px;
    color: black;
    background-color: white;
    font-size: 0.8em;
    overflow-y: auto;
  }
  .spot-panoramas {
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .spot-panoramas img {
    width: 100%;
    height: 100%;
    padding: 0px;
    border-radius: 0px;
  }
  .spot-panorama-preview {
    padding: 5px;
    width: 100%;
    height: 100%;
  }
  .spot-panorama-preview img {
    width: 100%;
    height: 100%;
    padding: 0px;
    border-radius: 0px;
  }
  .spot-panorama-preview .a-canvas {
    position: relative !important;
    width: 100%;
    height: 150px;
  }
`;

export default ActionForm;
