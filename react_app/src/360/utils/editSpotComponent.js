import deepEqual from 'deep-equal';
import aframe from 'aframe';

const TIME_TO_KEEP_LOG = 100;

function forceWorldUpdate(threeElement) {

  let element = threeElement;
  while (element.parent) {
    element = element.parent;
  }

  element.updateMatrixWorld(true);
}

function forEachParent(element, lambda) {
  while (element.attachedToParent) {
    element = element.parentElement;
    lambda(element);
  }
}

function someParent(element, lambda) {
  while (element.attachedToParent) {
    element = element.parentElement;
    if (lambda(element)) {
      return true;
    }
  }
  return false;
}

function cameraPositionToVec3(camera, vec3) {
  vec3.set(
    camera.el.components.position.data.x,
    camera.el.components.position.data.y,
    camera.el.components.position.data.z
  );

  forEachParent(camera, element => {

    if (element.components && element.components.position) {
      vec3.set(
        vec3.x + element.components.position.data.x,
        vec3.y + element.components.position.data.y,
        vec3.z + element.components.position.data.z
      );
    }

  });

}

function localToWorld(THREE, threeCamera, vector) {
  forceWorldUpdate(threeCamera);
  return threeCamera.localToWorld(vector);
}

const {unproject} = (function unprojectFunction() {

  let initialized = false;

  let matrix;

  function initialize(THREE) {
    matrix = new THREE.Matrix4();

    return true;
  }

  return {

    unproject(THREE, vector, camera) {

      const threeCamera = camera.components.camera.camera;

      initialized = initialized || initialize(THREE);
      //get world to local
      vector.applyProjection(matrix.getInverse(threeCamera.projectionMatrix));       
      return localToWorld(THREE, threeCamera, vector);
    },
  };
}());

function clientCoordsTo3DCanvasCoords(
  clientX,
  clientY,
  offsetX,
  offsetY,
  clientWidth,
  clientHeight
) {
  return {
    x: (((clientX - offsetX) / clientWidth) * 2) - 1,
    y: (-((clientY - offsetY) / clientHeight) * 2) + 1,
  };
}

const {screenCoordsToDirection} = (function screenCoordsToDirectionFunction() {

  let initialized = false;

  let mousePosAsVec3;
  let cameraPosAsVec3;

  function initialize(THREE) {
    mousePosAsVec3 = new THREE.Vector3();
    cameraPosAsVec3 = new THREE.Vector3();

    return true;
  }

  return {
    screenCoordsToDirection(
      THREE,
      aframeCamera,
      {x: clientX, y: clientY},
      innerWidth = null,
      innerHeight = null
    ) {

      initialized = initialized || initialize(THREE);

      // scale mouse coordinates down to -1 <-> +1
      const {x: mouseX, y: mouseY} = clientCoordsTo3DCanvasCoords(
        clientX, clientY,
        0, 0, // TODO: Replace with canvas position
        innerWidth ? innerWidth : window.innerWidth,
        innerHeight ? innerHeight : window.innerHeight
      );

      mousePosAsVec3.set(mouseX, mouseY, -1);

      // apply camera transformation from near-plane of mouse x/y into 3d space
      // NOTE: This should be replaced with THREE code directly once the aframe bug
      // is fixed:
/*
      cameraPositionToVec3(aframeCamera, cameraPosAsVec3);
      const {x, y, z} = new THREE
       .Vector3(mouseX, mouseY, -1)
       .unproject(aframeCamera.components.camera.camera)
       .sub(cameraPosAsVec3)
       .normalize();
*/
      const projectedVector = unproject(THREE, mousePosAsVec3, aframeCamera);
      const threeCamera = aframeCamera.components.camera.camera;
      cameraPositionToVec3(threeCamera, cameraPosAsVec3);

      // Get the unit length direction vector from the camera's position
      const {x, y, z} = projectedVector.sub(cameraPosAsVec3).normalize();
      return {x, y, z};
    },
  };
}());

/**
 * @param planeNormal {THREE.Vector3}
 * @param planeConstant {Float} Distance from origin of the plane
 * @param rayDirection {THREE.Vector3} Direction of ray from the origin
 *
 * @return {THREE.Vector3} The intersection point of the ray and plane
 */
function rayPlaneIntersection(planeNormal, planeConstant, rayDirection) {
  // A line from the camera position toward (and through) the plane
  const distanceToPlane = planeConstant / planeNormal.dot(rayDirection);
  return rayDirection.multiplyScalar(distanceToPlane);
}

const {directionToWorldCoords} = (function directionToWorldCoordsFunction() {

  let initialized = false;

  let direction;
  let cameraPosAsVec3;

  function initialize(THREE) {
    direction = new THREE.Vector3();
    cameraPosAsVec3 = new THREE.Vector3();

    return true;
  }

  return {
    /**
     * @param camera Three.js Camera instance
     * @param Object Position of the camera
     * @param Object position of the mouse (scaled to be between -1 to 1)
     * @param depth Depth into the screen to calculate world coordinates for
     */
    directionToWorldCoords(
      THREE,
      aframeCamera,
      camera,
      {x: directionX, y: directionY, z: directionZ},
      depth
    ) {

      initialized = initialized || initialize(THREE);

      cameraPositionToVec3(aframeCamera, cameraPosAsVec3);
      direction.set(directionX, directionY, directionZ);

      // A line from the camera position toward (and through) the plane
      const newPosition = rayPlaneIntersection(
        camera.getWorldDirection(),
        depth,
        direction
      );

      // Reposition back to the camera position
      const {x, y, z} = newPosition.add(cameraPosAsVec3);

      return {x, y, z};

    },
  };
}());

export const {getThreeDirectionFromClientRect} = (function getThreePositionFunction() {

  let initialized = false;

  let cameraPosAsVec3;
  let directionAsVec3;
  let raycaster;
  let plane;

  function initialize(THREE) {
    plane = new THREE.Plane();
    cameraPosAsVec3 = new THREE.Vector3();
    directionAsVec3 = new THREE.Vector3();
    raycaster = new THREE.Raycaster();

    // TODO: From camera values?
    raycaster.far = Infinity;
    raycaster.near = 0;

    return true;
  }

  return {
    getThreeDirectionFromClientRect(THREE, selector, camera, clientX, clientY, innerWidth = null, innerHeight = null) {

      initialized = initialized || initialize(THREE);

      const {x: directionX, y: directionY, z: directionZ} = screenCoordsToDirection(
        THREE,
        camera,
        {x: clientX, y: clientY},
        innerWidth,
        innerHeight
      );
      console.log('{x: directionX, y: directionY, z: directionZ} =>',
      {x: directionX, y: directionY, z: directionZ});

      const threeCamera = camera.components.camera.camera;
      cameraPositionToVec3(threeCamera, cameraPosAsVec3);

      return {x: directionX + cameraPosAsVec3.x,
        y: directionY + cameraPosAsVec3.y,
        z: directionZ + cameraPosAsVec3.z};  
    },
  };
}());

export function getCameraRotationFromObject(THREE, element, camera, depth, mouseInfo) 
{

  const threeCamera = camera.components.camera.camera;

  // Setting up for rotation calculations
  const startCameraRotationInverse = threeCamera.getWorldQuaternion().inverse();
  const startElementRotation = element.object3D.getWorldQuaternion();
  const elementRotationOrder = element.object3D.rotation.order;
  const elementPosVec = element.object3D.position;
  const rotationQuaternion = new THREE.Quaternion();


  const activeCamera = element.sceneEl.systems.camera.activeCameraEl;

  const isChildOfActiveCamera = someParent(element, parent => parent === activeCamera);

    // lastMouseInfo = {clientX, clientY};

    // const direction = screenCoordsToDirection(
    //   THREE,
    //   camera,
    //   {x: clientX, y: clientY}
    // );

    const {x, y, z} = directionToWorldCoords(
      THREE,
      camera,
      camera.components.camera.camera,
      elementPosVec,
      depth
    );


    let rotationDiff;

    // Start by rotating backwards from the initial camera rotation
    rotationDiff = rotationQuaternion.copy(startCameraRotationInverse);


    // Then add the current camera rotation
    rotationDiff = rotationQuaternion.multiply(threeCamera.getWorldQuaternion());

    // offsetVector.applyQuaternion(rotationDiff);
}

export function registerSpotEditComponent() {
  aframe.registerComponent(`hotspotedit`, {
    schema: {
      id: { default: '' },
      tooltip: { default: '' },
      status: { default: '' }
    },

    init: function () {
      // Use events to figure out what raycaster is listening so we don't have to 
      var data = this.data;

      var el = this.el;  // <a-image> 
      var defaultColor = el.getAttribute('material').color;

      const THREE = aframe.THREE;
      const sceneEl = document.querySelector('a-scene');
      const { canvas } = sceneEl
      const canvasSize = sceneEl.canvas.getBoundingClientRect();
      function getCanvasPos () {
        return sceneEl.canvas.getBoundingClientRect();
      }
      let position;
      /* if canvas doesn't exist, listen for canvas to load. */
      if (!canvas) {
        el.sceneEl.addEventListener('render-target-loaded', this.init.bind(this))
        console.log('canvas=> ', canvas);
        return;
      }
      
      window.addEventListener('resize', getCanvasPos);
      document.addEventListener('scroll', getCanvasPos);
      /* update _canvas in case scene is embedded */
      canvas.addEventListener('mousemove', function (evt) {
        position = {x:evt.clientX, y: evt.clientY}
        if (data.tooltip !== '' && data.status === 'hover') {
          const tooltip = document.getElementById("tooltip");                 
          const tipNode = document.getElementById("tip-text"); 
          if (tooltip && tipNode) {
            tipNode.innerText = data.tooltip;
            tooltip.style.top = position.y - 50 +'px';
            tooltip.style.left = position.x + 10 + 'px';
            tooltip.style.opacity = 1;
          }
        }
        return;        
      });

      el.addEventListener('mouseenter', function (evt) {          
        el.setAttribute('color', '#0ca8fd');
        data.status = 'hover';
      });
  
      el.addEventListener('mouseleave', function (evt) {
        el.setAttribute('color', defaultColor);
        const tooltip = document.getElementById("tooltip"); 
        if (tooltip) tooltip.style.opacity = 0;
        data.status = '';
      });
      el.addEventListener('click', function(evt){
        data.status = 'clicked';
        this.setAttribute('material', 'color','#0ca8fd');
        el.emit('sopt-clicked', { id: data.id });
      });
      el.addEventListener('componentchanged', function (evt) {
        if (evt.detail.name === 'position') {
          // console.log('Entity has moved to', evt.target.getAttribute('position'), '!',data.id);
        }
        // console.log('Event name => ',evt.detail);
      })
    },
    remove: function () {
    },      

  });
}

export function registerHotSpotCompenent() {
  aframe.registerComponent(`hotspot`, {
    schema: {
      id: { default: '' },
      tooltip: { default: '' },
      status: { default: '' }
    },
    init: function () {
      // Use events to figure out what raycaster is listening so we don't have to 
      var data = this.data;

      var el = this.el;  // <a-image> 
      var defaultColor = el.getAttribute('material').color;

      const THREE = aframe.THREE;
      const sceneEl = document.querySelector('a-scene');
      const { canvas } = sceneEl
      const canvasSize = sceneEl.canvas.getBoundingClientRect();
      function getCanvasPos () {
        return sceneEl.canvas.getBoundingClientRect();
      }
      let position;
      /* if canvas doesn't exist, listen for canvas to load. */
      if (!canvas) {
        el.sceneEl.addEventListener('render-target-loaded', this.init.bind(this))
        console.log('canvas=> ', canvas);
        return
      }
      
      window.addEventListener('resize', getCanvasPos);
      document.addEventListener('scroll', getCanvasPos);
      /* update _canvas in case scene is embedded */
      canvas.addEventListener('mousemove', function (evt) {
        position = {x:evt.clientX, y: evt.clientY}
        if (data.tooltip !== '' && data.status === 'hover') {
          const tooltip = document.getElementById("tooltip");                 
          const tipNode = document.getElementById("tip-text"); 
          if (tipNode) tipNode.innerText = data.tooltip;
          if (tooltip) {
            tooltip.style.top = position.y - 50 +'px';
            tooltip.style.left = position.x + 10 + 'px';
            tooltip.style.opacity = 1;
          }
        }
        return;        
      });

      el.addEventListener('mouseenter', function (evt) {          
        // console.log('MOUSE POSITION => ', position);
        el.setAttribute('color', '#7755FF');
        data.status = 'hover';
      });
  
      el.addEventListener('mouseleave', function (evt) {
        el.setAttribute('color', defaultColor);
        const tooltip = document.getElementById("tooltip"); 
        if (tooltip) tooltip.style.opacity = 0;
        data.status = '';
      }); 
      el.addEventListener('click', function(evt){
        data.status = 'clicked';
        el.emit('sopt-clicked', { id: data.id });
      });    
    },
    remove: function () {
    }, 
    // events: {
    //   click: function (evt) {
    //     console.log('registerComponent clicked=>', this.el.id);
    //     console.log('evt clicked=>', evt);
    //     // const ids = this.el.id.split("-")
    //     // setActionSpotId(ids[2]);
    //     // this.el.setAttribute('material', 'color', 'red');
    //   },
    // }
  });
};