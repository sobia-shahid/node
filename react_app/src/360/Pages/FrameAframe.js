import React, { useState, useEffect } from "react";
import Spinner from "../../components/@vuexy/spinner/Loading-spinner";
export default function Frame(props) {
  const {
    image,
    animation,
    fov,
    zoom,
    nadir,
    nadirScale,
    nadirOpacity,
    isMobile,
    style,
    loading,
    noVR,
    cameraRotation
  } = props;

  const initialState = {
    zoom: parseFloat(props.zoom),
  };

  const [state, setState] = useState(initialState);
  const [imageLoading, setImageLoading] = useState(loading);
  let forceLoading = props.loading;

  const cameraEl = document.getElementById('preview-cammera');   
  useEffect(() => {
    // const cameraEl = document.getElementById('preview-cammera');   
    console.log('cameraEl =>', cameraEl)
    console.log('cameraRotation =>', cameraRotation)
    if (cameraEl && cameraRotation && cameraEl.components['look-controls']) {
      cameraEl.components['look-controls'].pitchObject.rotation.x = cameraRotation.rotateX;
      cameraEl.components['look-controls'].yawObject.rotation.y = cameraRotation.rotateY;      
    }   
  }, [cameraEl]);

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
    function handleWheel(e) {
      const delta = Math.sign(e.wheelDelta);
      let newZoom = state.zoom + delta;
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 1) newZoom = 1;
      setState({ zoom: newZoom });
    }
    window.addEventListener("wheel", handleWheel);

    return function cleanUpListener() {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [state]);

  return (
    <>
      <a-scene
        loading-screen="enabled:false"
        embedded
        style={style 
          ? style 
          : {
            zIndex: "1",
            width: "100%",
            height: "100%",
            // position: "absolute",
            // top: "0",
          }}
        vr-mode-ui={`enabled: ${!noVR}`}
      >
        <a-assets>
          <img
            id="my-asset"
            src={image}
            onLoad={() => setImageLoading(false)}
            crossorigin="anonymous"
          />
        </a-assets>
        {imageLoading ? (
          <Spinner />
        ) : (
          <a-sky
            src={image}
            phi-length="360"
            phi-start="0"
            do-on-asset-load="#my-asset"
          ></a-sky>
        )}

        <a-entity
          id="rig"
          position="0 1.6 0">
          <a-camera 
            position="0 0 0"
            id="preview-cammera"
            animation={animation}
            wasd-controls-enabled="false"
            // look-controls-enabled="true"
            zoom={zoom}
            fov={fov}
            ></a-camera>
        </a-entity>
      </a-scene>
    </>
  );
}
