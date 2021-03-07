import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from 'react-dnd';
import aframe from 'aframe';
import registerClickDrag from 'aframe-click-drag-component';
import { useDrop } from 'react-dnd';
import * as THREE from "three";

import Spinner from "../../components/@vuexy/spinner/Fallback-spinner";
import { IconTypes, icons, actionNames }  from '../utils/Constants';
import { getVarcharEight }  from '../utils/helper';
import {
  addPanoramaHotSpot,
} from '../../redux/actions/hotspots'
import { getThreeDirectionFromClientRect } from '../utils/editSpotComponent';

registerClickDrag(aframe);

const FrameSpotsEditor = (props) => {
  const {
    activeSide,
    panoramaId,
    image,
    animation,
    fov,
    nadir,
    nadirScale,
    nadirOpacity,
    isMobile,
    loading,
    style,
    rotato,
    zoom,
    parentMethod,
    activeSpotId,
  } = props;
  const dispatch = useDispatch();
  const hotSpots = useSelector((state) => state.hotspots.spots);
  const customIcons = useSelector((state) => state.hotspots.customIcons);
  const [iconIndex, setIconIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(loading);
  const [adjustedZoom, setZoom] = useState(Number(zoom));
  const [iconType, setIconType] = useState('custom');
  const [currentPanoramaHotSpots, setCurrentHotSpots] = useState(() => {
    const index = hotSpots.findIndex((it) => it.panoramaId === panoramaId);
    if (index >= 0) {
      return hotSpots[index].hotSpotsData;
    } else {
      return [];
    }
  });

  //Skipping first iteration (exactly like componentWillReceiveProps):
  const isFirstRun = React.useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    console.log("count changed", props.image);
    setImageLoading(true);
  }, [props.image]);

  useEffect(() => {
    const index = hotSpots.findIndex((it) => it.panoramaId === panoramaId);
    if (index >= 0) {
      setCurrentHotSpots(hotSpots[index].hotSpotsData);
    } else {
      setCurrentHotSpots([]);
    }
  },[hotSpots, panoramaId])

  let sceneEl = document.getElementById('a-scene-tour');
  useEffect(() => {
    function handleWheel(e) {
      const delta = Math.sign(e.wheelDelta);
      let newZoom = adjustedZoom + parseFloat(delta/5);
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 0.6) newZoom = 0.6;
      setZoom(newZoom);
    }
    // const sceneEl = document.getElementById('a-scene-tour');
    if (sceneEl) {
      // window.addEventListener("wheel", handleWheel);
      sceneEl.addEventListener("wheel", handleWheel);
    }

    return function cleanUpListener() {
      if (sceneEl) {
        // window.removeEventListener("wheel", handleWheel);
        sceneEl.removeEventListener("wheel", handleWheel);
      }
    };
  }, [adjustedZoom, sceneEl]);

  const getSpotDropCoordination = (clientX, clientY, innerWidth = null, innerHeight = null) => {
    const cameraEl = document.getElementById('spots-origin-camera');
    return getThreeDirectionFromClientRect(THREE, '', cameraEl, clientX, clientY, innerWidth, innerHeight);
  }

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: IconTypes.ICON,
    canDrop: ()=> true,
    drop: (item, monitor) => {
      setIconType(item.iconType); // set icon type
      setIconIndex(item.index); // set icon index  in icon array

      // get offset in client dom rect
      const clientOffset = monitor.getClientOffset();
      const nNewPosVec = getSpotDropCoordination(clientOffset.x, clientOffset.y);
      const rotateY = THREE.Math.radToDeg(Math.atan(nNewPosVec.x/nNewPosVec.z)).toFixed(2);
      const len = currentPanoramaHotSpots.length;
      const hotspot = {
        id: getVarcharEight(),
        name: item.name,
        iconType: item.iconType,
        iconIndex: item.index,
        tip: '',
        actionType: actionNames[0],
        actionTitle: '',
        actionFiles: [],
        actionData: null,
        actionEditing: false,
        hide: false,
        lock: false,
        rotation: {
          x: 0,
          y: rotateY,
          z: 0,
          min: -180,
          max: 180
        },
        position: {
          x: nNewPosVec.x,
          y: nNewPosVec.y,
          z: nNewPosVec.z,
        },
        scale : {
          value: 10,
          min: 0,
          max: 100
        },
        opacity: {
          value: 70,
          min: 0,
          max: 100
        }
      };
      dispatch(addPanoramaHotSpot(panoramaId, hotspot));
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // console.log('activeSpotId =>', activeSpotId);
  
  return (
    <>
    <a-scene
      ref={drop}
      isMobile
      embedded
      id="a-scene-tour"
      loading-screen="enabled:false"
      style={style 
        ? style 
        : {
          zIndex: "1",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: "0",
        }}
      vr-mode-ui="enabled: false"
      cursor="rayOrigin: mouse"
    >
      {imageLoading && <Spinner /> } 
      <a-sky
        shader="flat"
        src={image}          
      >       
      </a-sky>        
      {activeSide ==="hotspot" && customIcons.length > 0 && currentPanoramaHotSpots.map((spot) => {
          if (!spot.lock) {
            return (
            <a-image  
              key={`hotspot-${panoramaId}-${spot.id}-edit`}    
              id={`hotspot-${panoramaId}-${spot.id}-edit`}
              src={spot.iconType === "custom" ? customIcons[spot.iconIndex] && customIcons[spot.iconIndex].imageUrl : icons[spot.iconIndex].imageUrl}
              position={spot.position.x.toFixed(2) + ' '+ spot.position.y.toFixed(2) + ' ' + spot.position.z.toFixed(2)}
              rotation={spot.rotation.x.toString() + ' '+ spot.rotation.y.toString() + ' ' + spot.rotation.z.toString()}
              scale={(spot.scale.value/spot.scale.max).toFixed(2) + ' '+ (spot.scale.value/spot.scale.max).toFixed(2) + ' ' + (spot.scale.value/spot.scale.max).toFixed(2)}
              opacity={(spot.opacity.value/spot.opacity.max).toFixed(2)}
              visible={!spot.hide}
              click-drag="enabled: true"
              hotspotedit={`id: ${spot.id}; tooltip: ${spot.tip}`}
              >                                 
            </a-image>
            )
          } else {
          return (
            <a-image    
              key={`hotspot-${panoramaId}-${spot.id}-edit`}               
              id={`hotspot-${panoramaId}-${spot.id}-edit`}
              src={spot.iconType === "custom" ? customIcons[spot.iconIndex] && customIcons[spot.iconIndex].imageUrl : icons[spot.iconIndex].imageUrl}
              position={spot.position.x.toFixed(2) + ' '+ spot.position.y.toFixed(2) + ' ' + spot.position.z.toFixed(2)}
              rotation={spot.rotation.x.toString() + ' '+ spot.rotation.y.toString() + ' ' + spot.rotation.z.toString()}
              scale={(spot.scale.value/spot.scale.max).toFixed(2) + ' '+ (spot.scale.value/spot.scale.max).toFixed(2) + ' ' + (spot.scale.value/spot.scale.max).toFixed(2)}
              opacity={(spot.opacity.value/spot.opacity.max).toFixed(2)}
              visible={!spot.hide}
              hotspotedit={`id: ${spot.id};tooltip: ${spot.tip}`}
              // raycaster="objects: [data-raycastable]"                
              >                           
            </a-image>
          )}
        })
      }      
      <a-entity
        id="rig"
        position="0 1.6 0">  
        <a-camera
          id="spots-editor-camera"
          look-controls-enabled="true" 
          wasd-controls-enabled="false"     
          animation={animation}                 
          position="0 0 0"
          zoom={adjustedZoom}
        >
        </a-camera>
      </a-entity> 
      <a-camera
        id="spots-origin-camera"
        camera="active: false"            
        position="0 1.59 0"
        look-controls-enabled="true" 
        animation={animation} 
        zoom={adjustedZoom}
      />
    </a-scene>
    <div id="tooltip" className="tooltip">
      <span id="tip-text" className="tooltiptext"></span>
    </div>
    <img
      className="check-loading"
      src={image}
      onLoad={()=>setImageLoading(false)}
      crossorigin="anonymous"
    />
    </>
  )
}

export default FrameSpotsEditor;


