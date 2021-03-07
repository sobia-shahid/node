import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import styled from "styled-components";
import { X } from "react-feather";
import * as AFRAME from 'aframe';

import { setFont, media, setButtonColor } from "../styled.js";
import { UserContext } from "../context/user";
import Spinner from "../../components/@vuexy/spinner/Fallback-spinner";
import { icons, iconsCustom, actionNames }  from '../utils/Constants';
import { getCustomIcon } from '../utils/api/iconApi';

import {
  addCustomIcon,
} from '../../redux/actions/hotspots'

export default function Frame(props) {
  const {
    panoramaId,
    spotActionId,
    image,
    animation,
    fov,
    isMobile,
    loading,
    // setLoading,
    setActionSpotId,
    setActionSpotType,
    jumpToPanorama,
    cameraRotation,
    applyPanoramaAnnoying,
    trasitionPending,
    isGyroscope,
    rotation
  } = props;

  const initialState = {
    zoom: parseFloat(props.zoom),
  };
  const hotSpots = useSelector((state) => state.hotspots.spots);
  const dispatch = useDispatch();
  const customIcons = useSelector((state) => state.hotspots.customIcons);
  const { id } = useParams();
  const { user } = React.useContext(UserContext);
  const [state, setState] = useState(initialState);
  const [imageLoading, setImageLoading] = useState(loading);

  const [currentPanoramaHotSpots, setCurrenthotSpots] = useState(() => {
    const index = hotSpots.findIndex((it) => it.panoramaId === panoramaId);
    if (index >= 0 && hotSpots[index].hotSpotsData) {
      return hotSpots[index].hotSpotsData;
    } else {
      return [];
    }
  });

  useEffect(() => {
    triggerCameraRotation();
  }, [rotation]);

  const cameraEl = document.getElementById('tour-cammera');   
  useEffect(() => {
    let panoramaTimer = 0;
    panoramaTimer = setInterval(() => {
    if (cameraEl && cameraRotation && 
        cameraEl.components['look-controls'] &&
        cameraEl.components['look-controls'].pitchObject &&
        cameraEl.components['look-controls'].yawObject) {
      console.log('cameraRotation => ', cameraRotation)
      cameraEl.components['look-controls'].pitchObject.rotation.x = cameraRotation.rotateX;
      cameraEl.components['look-controls'].yawObject.rotation.y = cameraRotation.rotateY;  
      if (rotation) {
        document.getElementById('tour-cammera').dispatchEvent(new CustomEvent('rotation-begin'));
      }      
      clearInterval(panoramaTimer);    
    }
    }, 100);
  }, [cameraEl, cameraRotation]);

  useEffect(() => {
    console.log("hotSpots, panoramaId changed", hotSpots, panoramaId);
    const index = hotSpots.findIndex((it) => it.panoramaId === panoramaId);
    if (index >= 0) {
      setCurrenthotSpots(hotSpots[index].hotSpotsData);
    } else {
      setCurrenthotSpots([]);
    }
  },[hotSpots, panoramaId])


  //Skipping first iteration (exactly like componentWillReceiveProps):
  const isFirstRun = React.useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    console.log("count changed", image);
    setImageLoading(true);
    
    const imageEl = document.getElementById('check-loading');    
    if (imageEl) {
      console.log("imageEl => ", imageEl.complete, imageEl.naturalHeight);
      const isLoaded = imageEl.complete && imageEl.naturalHeight !== 0;
      if (isLoaded) setImageLoading(false);
    }
  }, [image]);

  const triggerCameraRotation = () => {
    let currentRotationEvent = 'rotation-begin';
    if (rotation) {
      currentRotationEvent = 'rotation-resume';
    } else {
      currentRotationEvent = 'rotation-pause';
      // const cameraEl = document.getElementById('tour-cammera')
      // const animationEl = AFRAME.components["animation"];
      // console.log('animationEl =>', animationEl);
      // const curRotation = AFRAME.utils.coordinates.stringify(cameraEl.getAttribute('rotation'));
      // console.log('curRotation =>', curRotation);
      // console.log(' cameraEl.components.animation =>',  cameraEl.components.animation);
      // console.log(' cameraEl.components.animation rotation =>',  cameraEl.components.animation.el.getAttribute('from'));
      // cameraEl.components.animation.el.setAttribute('from', curRotation);
    }
    document.getElementById('tour-cammera').dispatchEvent(new CustomEvent(currentRotationEvent));
  } 


  useEffect(() => {
    function handleWheel(e) {
      const delta = Math.sign(e.wheelDelta);
      let newZoom = state.zoom + parseFloat(delta/5);
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 0.6) newZoom = 0.6;
      setState({ zoom: newZoom });
    }
    window.addEventListener("wheel", handleWheel);

    return function cleanUpListener() {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [state]);

  useEffect(() => {
    dispatch(getCustomIcon(id));
    iconsCustom.map((icon) => {
      dispatch(addCustomIcon({...icon, placeId: id, userId: user.user ? user.user._id : ''}));
    })
    document.getElementById('tour-cammera').addEventListener('pause', function () {
      this.animation.el.setAttribute('from', AFRAME.utils.coordinates.stringify(this.getAttribute('rotation')))
    })
  }, [])  

  const handleClose =(e) => {
    setActionSpotId('');
  }
  const showAction = () => {
    const hotSpot = currentPanoramaHotSpots.find((it) => it.id === spotActionId );
    if (hotSpot) {
      const { actionType, actionData, actionTitle } = hotSpot;
      const actionIndex = actionNames.indexOf(actionType);
      setActionSpotType(actionIndex);
      const actionView = (actionIndex) => {
        switch (actionIndex) {
          case 1: // images
            return (
              <div className="actionWindow">
                <img className="action-image" src={actionData.uploadInfo.secure_url}/>                
                 <span className="view-title">
                  <Typography className="image-title">{actionTitle}</Typography>
                  <span className="view-close">
                    <X size={30} onClick={handleClose} />
                </span>
                </span>
              </div>
            )
            break;
          case 2: //html
            return (
              <div className="html-section">
                <div className="view-html" dangerouslySetInnerHTML={{ __html: actionData }} />
                <span className="html-close">
                  <X size={20} onClick={handleClose} />
                </span>
              </div>
            )
            break;
          case 3: //link
            if (actionData.newOpenMode !== null) {
              if (actionData.newOpenMode === true || actionData.newOpenMode === 'true') {
                window.open(`${actionData.url}`,"_blank");
                handleClose();
              } else if ( actionData.newOpenMode === false || actionData.newOpenMode === 'false') {
                window.open(`${actionData.url}`,"_top");
              }
            }
            break;
          case 4: //panorama
            jumpToPanorama(actionData);
            return null;
            break;
          case 5: //sound
            return (
              <div >
                {actionData &&
                  <audio id={`action-audio`}>
                    <source src={actionData.uploadInfo.secure_url} type={actionData.type} />
                    Your browser does not support the audio element.
                  </audio>
                }
              </div>
            )
            break;
        }
      }
      return (
        <div>        
          {actionView(actionIndex)}
        </div>
      )
    }
  }
  const handleImageLoaded = () => {
    setImageLoading(false);
  }
  
  console.log('panoramaId=>', panoramaId);
  console.log('hotSpots=>', hotSpots);
  // console.log('currentPanoramaHotSpots=>', currentPanoramaHotSpots);
  console.log('animation => ', animation)
  return (
    <>    
      <a-scene
        loading-screen="enabled:false"
        embedded
        style={{
          width: "100vw",
          height: "calc(100vh - 0px)",
          // position: "absolute",
        }}
        vr-mode-ui="enabled: false"
        isMobile={isMobile}
        cursor="rayOrigin: mouse"    
      >         
        {currentPanoramaHotSpots && currentPanoramaHotSpots.map((spot) => {
          const show = !imageLoading && !trasitionPending && !spot.hide;
            return (
              <a-image
                key={`hotspot-${panoramaId}-${spot.id}`}
                id={`hotspot-${panoramaId}-${spot.id}`}
                visible={show}
                src={spot.iconType === "custom" ? customIcons[spot.iconIndex] && customIcons[spot.iconIndex].imageUrl : icons[spot.iconIndex].imageUrl}
                position={spot.position.x.toFixed(2) + ' '+ spot.position.y.toFixed(2) + ' ' + spot.position.z.toFixed(2)}
                rotation={spot.rotation.x.toString() + ' '+ spot.rotation.y.toString() + ' ' + spot.rotation.z.toString()}
                scale={(spot.scale.value/spot.scale.max).toFixed(2) + ' '+ (spot.scale.value/spot.scale.max).toFixed(2) + ' ' + (spot.scale.value/spot.scale.max).toFixed(2)}
                opacity={(spot.opacity.value/spot.opacity.max).toFixed(2)}
                hotspot={`id: ${spot.id}; tooltip: ${spot.tip}`}
                >
              </a-image>
            )
        })}
        {imageLoading 
          ? trasitionPending 
            ? null 
            : <Spinner />
          : <a-sky
              shader="flat"
              src={image}
            >
            </a-sky>
        }
        <a-entity
          id="rig"
          position="0 1.6 0">
          <a-camera 
            position="0 0 0"
            id="tour-cammera"
            animation={animation}
            zoom={state.zoom}
            wasd-controls-enabled="false"
            look-controls={`enabled:true; magicWindowTrackingEnabled: ${isGyroscope ? 'true;' : 'false;'}`}
            fov={fov}
            ></a-camera>
        </a-entity>
      </a-scene>
      <TourFrame>
        <img
          id="check-loading"
          className="check-loading"
          src={image}
          onLoad={handleImageLoaded}
          // crossorigin="anonymous"
        />
        <div id="tooltip" className="tooltip">
          <span id="tip-text" className="tooltiptext"></span>
        </div> 
        {spotActionId !=='' && showAction()}
      </TourFrame>
    </>
  );
}
const TourFrame = styled.div`
  .check-loading {
    width: 0px;
    heigh: 0px;
  }
  .actionWindow {
    width: 98%;
    height: 98%;
    position: absolute;
    border-radius: 25px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
 
    z-index: 12;
    animation-duration: 3s;
    animation-fill-mode: forwards;
  }
  .html-section {
    position: absolute;
    top: 25%;
    left: 40%;
    width: 120px;
    height: auto;
    background-color: #0000;
    border-radius: 3px;
    justify-content: center;
    display: flex;
    flex-direction: column;
    padding: 5px;
  }
  .action-image{
    object-fit: cover;
    border-radius: 25px;
  }
  .view-html {
    align-items: center;
    position: absolute;
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    text-align:center;
    background-color: #fff;
    border-radius: 3px;
    justify-content: center;
    display: flex;
    flex-direction: column;
    /* padding: 5px; */
  }
  .sound-play{
    align-items: center;
    position: absolute;
    top: 25%;
    left: 40%;
    width: auto;
    height: 70px;
    background-color: #00000096;
    color: aqua;
    border-radius: 3px;
    justify-content: center;
    display: flex;
    flex-direction: column;
    padding: 5px;
  }
  .action-image {
    width: 100%;
    height: 100%;
  }
  .view-title {
    position: absolute;
    width: 100%;
    display: flex;
    color: azure;
    justify-content: center;
    bottom: 0px;
    right: 0px;
    z-index: 13;
    background: linear-gradient( to bottom, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0) 100% );
  }
  .view-close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index:20;
  }
  .image-title {
    font-size: 1.5rem;
    text-transform: uppercase;
    padding-top:15px;
  }
  .html-close {
    z-index: 11111;
    position: fixed;
    right: 15px;
    top: 15px;
    max-width: 30px;
    max-height: 30px;
    display: block;
    cursor: pointer;
  }
  .actionWindow svg {
    margin: 0 1px;
    padding: 2px;
    border-radius: 3px;
    align-self: center;
    color: azure;
  }
  .actionWindow svg:hover {
    background-color: #8888;
    border-radius: 3px;
  }

  /* phone media */
  ${media.phone`
  .html-section {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 97%;
    height:  97%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
  `}

  ${media.tablet`
  .html-section {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width:  100%;
    height:  100%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
`}
  ${media.desktop`
  .html-section {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 30%;
    height: 40%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
`}

${media.large`
.html-section {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 30%;
    height: 40%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
`}
`;
