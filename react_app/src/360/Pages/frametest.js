import React, { useState, useEffect } from "react";
import "aframe";
import "aframe-event-set-component";

export default function Frame(props) {
  const {
    image,
    animation,
    fov,
    nadir,
    nadirScale,
    nadirOpacity,
    isMobile,
  } = props;

  const initialState = {
    zoom: parseFloat(props.zoom),
  };

  const [state, setState] = useState(initialState);

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
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
        }}
        vr-mode-ui="enabled: true "
        isMobile={isMobile}
      >
        <a-sky
          src={image}
          animation={animation}
          animation__mouseenter="property: components.material.material.color; type: color; to: blue; startEvents: mouseenter; dur: 500"
        >
          {nadir ? (
            <a-image
              src={nadir}
              position="0 0 0 "
              rotation="90 0 0"
              scale={nadirScale}
              opacity={nadirOpacity}
            ></a-image>
          ) : (
            ""
          )}
        </a-sky>

        <a-camera
          id="cam"
          zoom={state.zoom}
          wasd-controls-enabled="false"
        ></a-camera>
        {/* test */}
        <a-entity camera look-controls wasd-controls></a-entity>
        {/* end test */}
      </a-scene>
    </>
  );
}

