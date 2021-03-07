import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import NativeSelect from '@material-ui/core/NativeSelect';
import Input from '@material-ui/core/Input';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import purple from '@material-ui/core/colors/purple';
import red from '@material-ui/core/colors/red';
import { makeStyles } from "@material-ui/core/styles";
import { createMuiTheme } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';

import {
  Row,
  Col,
  FormGroup,

  Button,
  Label,
  Container,
} from "reactstrap";
import {
  Trash2,
  Lock,
  Unlock,
  Volume,
  Eye,
  EyeOff,
  RefreshCw,
  Edit,
  Plus,
  Minus,
  Save,
  ChevronDown,
  Disc,Sliders,Settings,MapPin
} from "react-feather";
import * as THREE from 'three';

import { UserContext } from "../context/user";
import { HotSpot } from '../Components/HotSpot';
import ActionForm from '../Components/ActionForm';
import { 
  icons, 
  iconsCustom, 
  widgetOptions, 
  actionNames, 
  TOOLTIP_MAX_LENGTH,
}  from '../utils/Constants';

import {
  removePanoramaHotSpot,
  updatePanoramaHotSpot,
  addCustomIcon,
  clearCustomIcons,
} from '../../redux/actions/hotspots'
import { Mapping } from "three";

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
    margin: theme.spacing(2),
    minWidth: '100%',
   
  },
  

}));




const HotSpotPanel = ({
  place, panoramaId,
  activeSpotId,
  setActiveSpotId
  }) => {
  const dispatch = useDispatch();
  const hotSpots = useSelector((state) => state.hotspots.spots);
  const customIcons = useSelector((state) => state.hotspots.customIcons);
  const { id } = useParams();
  const { user } = React.useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [objectTabIndex, setObjectTabIndex] = useState(0);
  const [selectedIconIndex, setSelectIconIndex] = useState(-1);
  const [tooltip, setTooltip] = useState('');
  const [isSpotNameEdit, setSpotNameEdit] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [currentPanoramaHotSpots, setCurrentPanoramaHotSpots] = useState(() => {
    const index = hotSpots.findIndex((it) => it.panoramaId === panoramaId);
    if (index >= 0) {
      return hotSpots[index].hotSpotsData;
    } else {
      return [];
    }
  });
  const [focusSpotEdit, setFocusSpotEdit] = useState(false);
  useEffect(() => {
    getCustomIcon();
    iconsCustom.map((icon) => {
      dispatch(addCustomIcon({...icon, placeId: id, userId: user.user._id}));
    })
  },[])

  useEffect(() => {
    const index = hotSpots.findIndex((it) => it.panoramaId === panoramaId);
    if (index >= 0) {
      setCurrentPanoramaHotSpots(hotSpots[index].hotSpotsData);
    } else {
      setCurrentPanoramaHotSpots([]);
    }
  },[hotSpots, panoramaId])

  function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue((value) => ++value); // update the state to force render
  }

  //---------------------------------------------------
  const forceUpdate = useForceUpdate();
  const openWidget = () => {
    let featuredWidget = window.cloudinary.createUploadWidget(
      widgetOptions,
      (error, result) => {
        if (!error && result && result.event === "success") {
          const newIcon = {
            name: 'hotSpot',
            imageUrl: result.info.secure_url,
            placeId: id,
            userId: user.user._id
          };
          addSpotCustomIcon(newIcon);
          if (result.info ) {
            dispatch(addCustomIcon(newIcon));
          }
          featuredWidget.close();

          forceUpdate();
        } else if (!error && result && result.event === "queues-end") {
          // featuredWidget.close();
          forceUpdate();
        }
      }
    );
    featuredWidget.open();
  };
  const addSpotCustomIcon = (iconInfo) => {

    let form = new FormData();
    form.append('name', iconInfo.name);
    form.append('imageUrl', iconInfo.imageUrl);
    form.append("placeId", iconInfo.placeId);
    form.append("userId", iconInfo.userId);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
      setLoading(true);
    console.log(form);
    axios
      .post('/api/icons/add', form, config)
      .then((res) => {
        console.log(res);

        setLoading(false);
        // history.push(`/VirtualTour`);
        // window.location.reload();
      })
      .catch((error) => console.log(error));
  }
  const handleObjectTabChange = (e, index) => {
    setObjectTabIndex(index);
  }
  const getCustomIcon = () => {
    dispatch(clearCustomIcons());
    setLoading(true);
    axios
      .get(`/api/icons/${id}`)
      .then((res) => {
        console.log('icons information => ', res.data);
        const { icons } = res.data
        icons.map((icon) => {
          dispatch(addCustomIcon(icon));
        })
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });

  }
  const handleIconMouseDown = (index) => (e) => {
    setSelectIconIndex(index);
  }
  const handleSpotDel = (spot) => (e) => {
    e.preventDefault();
    dispatch(removePanoramaHotSpot(panoramaId, spot.id));
  }
  const handleSpotLock = (spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot, lock: !spot.lock };
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleSpotHide = (spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot, hide: !spot.hide };
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleSpotView = (spot) => (e) => {
    e.preventDefault();

    function rotatePoint( angle , inverseSpeed , v1 , v2 , toNormalize ){
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      // inverseSpeed directly affects the speed of the camera.  so a higher inverseSpeed = slower speed.
      var v3 = new THREE.Vector3(
        inverseSpeed * ( c * v1.x ) + ( s * ( ( v2.y * v1.z ) - ( v2.z * v1.y ) ) ) ,
        inverseSpeed * ( c * v1.y ) + ( s * ( ( v2.z * v1.x ) - ( v2.x * v1.z ) ) ),
        inverseSpeed * ( c * v1.z ) + ( s * ( ( v2.x * v1.y ) - ( v2.y * v1.x ) ) )
      );
      if ( toNormalize ){ v3.normalize(); }
      return v3;
    }; // used to rotate position of camera.
    
    function newLookAt( axisVector , zoom , tilt , tiltIncrement ) {
      var a = new THREE.Vector3( axisVector.x * ( ( tilt - zoom ) * tilt * 0.5 ) , axisVector.y * ( ( tilt - zoom ) * tilt * 0.5 ) , axisVector.z * ( ( tilt - zoom ) * tiltIncrement * 0.5 ) );
      return a;
    };

    const elSpot = document.getElementById(`hotspot-${panoramaId}-${spot.id}-edit`);
    const spotPosition = elSpot.getAttribute('position');
    console.log(`hotspot-${spot.id} position => `, spotPosition);

    const elEditCamera = document.getElementById('spots-editor-camera');
    const elOriginCamera = document.getElementById('spots-origin-camera');
    const threeCameraEditor = elEditCamera.components.camera.camera;
    const threeCameraOrigin = elOriginCamera.components.camera.camera;
    threeCameraEditor.lookAt(spotPosition);
    threeCameraEditor.up.set(0, 1, 0);
    // threeCameraEditor.rotation.z = 0;

    // elEditCamera.components['look-controls'].pitchObject.rotation.x = 0;
    // elEditCamera.components['look-controls'].yawObject.rotation.y = 0;  

    threeCameraOrigin.lookAt(spotPosition);
    threeCameraOrigin.rotation.z = 0;
    threeCameraOrigin.up.set(0, 1, 0);

  }
  const handlePropertyChange = (field, spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot };
    switch(field) {
      case 'x':
        newSpot.rotation.x = Number(e.target.value);
        break;
      case 'y':
        newSpot.rotation.y = Number(e.target.value);
        break;
      case 'z':
        newSpot.rotation.z = Number(e.target.value);
        break;
      case 'opacity':
        newSpot.opacity.value = Number(e.target.value);
        break;
      case 'scale':
        newSpot.scale.value = Number(e.target.value);
        break;
    }
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handlePropertyReset = (field, spot) => (e) => {
     e.preventDefault();
    const newSpot = { ...spot };
    switch(field) {
      case 'x':
        newSpot.rotation.x = 0;
        break;
      case 'y':
        newSpot.rotation.y = 0;
        break;
      case 'z':
        newSpot.rotation.z = 0;
        break;
      case 'opacity':
        newSpot.opacity.value = 70;
        break;
      case 'scale':
        newSpot.scale.value = 10;
        break;
    }
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleChangeAction = (spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot };
    const index = actionNames.indexOf(e.target.value);
    if (index === 0 ) newSpot.actionEditing = false;
    else newSpot.actionEditing = true;
    newSpot.actionType = e.target.value;
    newSpot.actionData = null;
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleTooltipChange = (spot) => (e) => {
    e.preventDefault();
    setTooltip(e.target.value);
    spot.tip = e.target.value;
  }
  const handleTooltipSave = (spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot };
    newSpot.tip = tooltip;
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleActionEdit = (spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot };
    newSpot.actionEditing = true;
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }
  const handleChangeIconName = (e) => {
    e.preventDefault();
    setSpotName(e.target.value);
  }
  const handleSpotNameEdit = (spot) => (e) => {
    e.preventDefault();
    setSpotNameEdit(true);
  }
  const handleSpotNameSave = (spot) => (e) => {
    e.preventDefault();
    const newSpot = { ...spot, name: spotName };
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
    setSpotNameEdit(false);
  }
  const handleEditSpotItemExpand = (spot) => (e) => {
    setActiveSpotId(spot.id);
  }
  const handleEditSpotItemClose = (spot) => (e) => {
    setActiveSpotId('');
    const newSpot = { ...spot };
    newSpot.actionEditing = false;
    dispatch(updatePanoramaHotSpot(panoramaId, newSpot));
  }

  const displayActionForm = (spot) => spot.actionType !== actionNames[0] && spot.actionEditing === true;
console.log('hotSpots => ', hotSpots);
console.log('currentPanoramaHotSpots => ', currentPanoramaHotSpots);
const classes = useStyles();
  return (

  <>
  <Container className="pl-0 pr-0 mb-1">

  <Row className="pl-0 pr-0 mb-1">
    <Col className="pl-0 pr-0 mb-1">
    <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',fontWeight:'bold'}}>
        1 . Drag icon to the scene 
      </h6>
      </Col>
      </Row>
      
    <Row className="pl-0 pr-0 mb-1">
    <Col className="pl-0 pr-0 mb-1">
    <Accordion className="panel-body" >
      <AccordionSummary
        expandIcon={<ChevronDown style={{ color: "#0ca8fd" }} />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        className="panel-header"
      >
       <Typography className={classes.heading}> <Sliders size={20} style={{paddingRight:'10px'}}/>Icons</Typography>
                <Typography className={classes.secondaryHeading}>
                  Drag icon to the scene
                </Typography>
      </AccordionSummary>
      <AccordionDetails className="panel-sub-body">
      
        <Tabs
        className={classes.formControl}
          value={objectTabIndex}
          indicatorColor="primary"
          onChange={handleObjectTabChange}
          aria-label="Hotspots tabs">
          <Tab
            label="Custom Icons"
            id="object-tab-0"
            aria-controls="object-tabpanel-0"
            className="tab-object tab-object-custom"

          />
          <Tab

            label="Icons"
            id="object-tab-1"
            aria-controls="object-tabpanel-1"
            className="tab-object"
          />
        </Tabs>
        <div
          className="tab-body"
          role="tabpanel"
          id={`object-tabpanel-${objectTabIndex}`}
          aria-labelledby={`object-tab-${objectTabIndex}`}
        >
        {objectTabIndex === 0 && (
          <>
            <div className="upload-button" onClick={openWidget}>
              <Plus/>
            </div>
            {customIcons.map((icon, index)=>
              <HotSpot
                key={`iconsCustom-${index}`}
                iconType="custom"
                iconIndex={index}
                name={icon.name}
                selected={selectedIconIndex === index}
                handleMouseDown={handleIconMouseDown(index)}
                >
                <img src={icon.imageUrl} />
              </HotSpot>
            )}
          </>
        )}
        {objectTabIndex === 1 && (
          <>
            {icons.map((icon, index) =>
              <HotSpot
                key={`icons-${index}`}
                iconType="icon"
                iconIndex={index}
                selected={selectedIconIndex === index}
                handleMouseDown={handleIconMouseDown(index)}
                >
                <img src={icon.imageUrl} />
              </HotSpot>)
            }
          </>
        )}
        </div>
      </AccordionDetails>
    </Accordion>
    </Col>
    </Row>
   
   
   
    <Row className="pl-0 pr-0 mb-1">
    <Col className="pl-0 pr-0 mb-1">
      <h6 style={{fontSize:'12px', color:'white' ,textAlign:'left',textTransform:'uppercase', fontWeight:'bold'}}>
        2 . Add action to the icon 
      </h6>
      </Col>
      </Row>
   
    <Row className="pl-0 pr-0 mb-1">
    <Col className="pl-0 pr-0 mb-1">
     <Accordion className="panel-body" expanded={activeSpotId !== '' || focusSpotEdit} onChange={()=>setFocusSpotEdit(!focusSpotEdit)}>
      <AccordionSummary
        expandIcon={<ChevronDown style={{ color: "#0ca8fd" }} />}
        aria-controls="panel2a-content"
        id="panel2a-header"
        className="panel-header"
      >
         <Typography className={classes.heading}> <Sliders size={20} style={{paddingRight:'10px'}}/>Action</Typography>
                <Typography className={classes.secondaryHeading}>
                <Badge badgeContent={`${currentPanoramaHotSpots.length} ` } color="primary" style={{marginRight:'15px'}}>
                 </Badge> hotspots with actions
                </Typography>
      
      </AccordionSummary>
      <AccordionDetails className="panel-sub-body">
      {currentPanoramaHotSpots.map((spot, index) => {
        if (customIcons.length > 0 ) {
          const spotName = spot.name? spot.name
                    : spot.iconType === 'custom'
                      ? customIcons[spot.iconIndex] && customIcons[spot.iconIndex].name
                      : icons[spot.iconIndex].name;
        return (
          <Container className="pl-1 pr-1 pt-1 pb-1 mb-0">
             <Row className="pl-0 pr-0 mb-0">
    <Col className="pl-0 pr-0 mb-0">
        <Accordion
          key={`hotspot-${index}`}
          className="spot-body"
          expanded={activeSpotId === spot.id}
          >
          <AccordionSummary
            expandIcon={activeSpotId === spot.id 
              ? spot.lock 
                ? null
                : <Minus onClick={handleEditSpotItemClose(spot)} /> 
              : <Plus onClick={handleEditSpotItemExpand(spot)}/>}            
            aria-controls="panel2a-content"
            id="spot2a-header"
            className="spot-header"
          >
            <Typography className="panel-subtitle">
            <Divider orientation="vertical" flexItem />
            <MapPin size={40} style={{position:'absolute', left:'5px', color:'white', paddingRight:'5px'}}/>
              <span style={{fontSize:"15px", paddingRight:'10px', paddingTop:'5px'}}>{index+1 }</span>
              <Trash2 onClick={handleSpotDel(spot)} />&nbsp;
              {spot.lock
                ? <Lock onClick={handleSpotLock(spot)}/>
                : <Unlock onClick={handleSpotLock(spot)}/>}&nbsp;
            
              {spot.hide
                ? <EyeOff onClick={handleSpotHide(spot)}/>
                : <Eye onClick={handleSpotHide(spot)}/>}&nbsp;
              <Disc onClick={handleSpotView(spot)}/>&nbsp;
    
              {/* {isSpotNameEdit
                ? <><input
                      key={`hotspot-name-${spot.id}`}
                      id={`hotspot-name-${spot.id}`}
                      type="text"
                      className="hotspot-name"
                      defaultValue={spotName}
                      disabled={!isSpotNameEdit}
                      onChange={handleChangeIconName}
                      maxlength={TOOLTIP_MAX_LENGTH}
                    />
                    <Save onClick={handleSpotNameSave(spot)}/>
            
                  </>
                : <>{spotName}<Edit onClick={handleSpotNameEdit(spot)}/></>
              } */}

            </Typography>
          </AccordionSummary>
          <AccordionDetails className="panel-sub-body">
          {!spot.lock &&
            <>
    {/* tooltip */}
    <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'15px', fontWeight:'bold'}}>1 - Tooltip</h6>
            <div  className="line-center">
            <FormControl className={classes.formControl}>
              <Container className="pl-0 pr-0 mb-0">
              <Row className="pl-0 pr-0 mb-0">
             <Col className="pl-0 pr-0 mb-0">
              <Input
               className="action-select"
              fullWidth
              label="Helper text"
                id="standard-basic"
                inputProps={{
                  minWidth:'100%!important',
                  color:'primary',
                  minWidth:'100%important',
                  maxlength: TOOLTIP_MAX_LENGTH
                }}
                onChange={handleTooltipChange(spot)}
                defaultValue={spot.tip}

              />
             
     </Col>
              </Row>
              </Container>
              </FormControl>




              
              {/* <Save onClick={handleTooltipSave(spot)}/> */}
            </div> 






            {/* actions selector */}
            
            <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'10px',fontWeight:'bold'}}>2 - select the action</h6>
            <div className="line-center">
              {/* <Typography className="label">Action:</Typography> */}
          
              <FormControl className={classes.formControl}>
              <Container className="pl-0 pr-0 mb-0">
              <Row className="pl-0 pr-0 mb-0">
        
           
              <Grid item xs={11}>
                     
               <NativeSelect
               fullWidth
                className="action-select"
                value={spot.actionType}
                IconComponent={ChevronDown}
                onChange={handleChangeAction(spot)}
                // inputProps={{
                //   style:{
                //     paddingLeft: '5px',
                //     borderWidth: 1,
                //     borderColor: '#565656',
                //     borderStyle: 'solid',
                //   }
                // }}
              >
                {actionNames.map((name) =>
                  <option value={name}>{name}</option>
                )}
              </NativeSelect>
              </Grid>
         
              {/* <Edit onClick={handleActionEdit(spot)}/>
              <FormHelperText>Some important helper text</FormHelperText> */}
              
              
         
              <Grid item xs={1}>
              <Settings  style={{cursor:'pointer'}} onClick={handleActionEdit(spot)}/>
         </Grid>
    
   </Row>
 
   
      </Container>
      </FormControl>
            </div>


        
           
           
           
           
           
           
            {displayActionForm(spot) &&         
              <ActionForm                  
                spot={spot} place={place} panoramaId={panoramaId} />
            }
            { !displayActionForm(spot) &&
              <>




              {/* rotate x */}

              <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'10px',fontWeight:'bold'}}>3 - Rotate the icon, X <RefreshCw style={{position:"absolute", right:'6px'}} onClick={handlePropertyReset('x',spot)}/></h6>
      <div  className="line-center">
                <FormControl className={classes.formControl}>
                   <Container className="pl-0 pr-0 mb-0">
                     <Row className="pl-0 pr-0 mb-0">
                         <Col className="pl-0 pr-0 mb-0">
                           <div style={{width:'100%'}} >
                <Typography className="property-setting-value">{spot.rotation.x}</Typography>
                   <input
                    type="range"
                    step="1"
                    min={spot.rotation.min}
                    max={spot.rotation.max}
                    id={`input-rotation-x-${spot.id}`}
                    onChange={handlePropertyChange('x',spot)}
                    defaultValue={spot.rotation.x}
                    value={spot.rotation.x}
                  />
                </div>
                </Col>
              </Row>
              </Container>
              </FormControl>

      </div>

              {/* y rotation */}
              <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'10px',fontWeight:'bold'}}>4 - Rotate the icon, Y <RefreshCw style={{position:"absolute", right:'6px'}} onClick={handlePropertyReset('y',spot)}/></h6>
      <div  className="line-center">
                <FormControl className={classes.formControl}>
                   <Container className="pl-0 pr-0 mb-0">
                     <Row className="pl-0 pr-0 mb-0">
                         <Col className="pl-0 pr-0 mb-0">
                           <div style={{width:'100%'}} >
                <Typography className="property-setting-value">{spot.rotation.y}</Typography>
                <input
                    type="range"
                    step="1"
                    min={spot.rotation.min}
                    max={spot.rotation.max}
                    id={`input-rotation-y-${spot.id}`}
                    onChange={handlePropertyChange('y',spot)}
                    defaultValue={spot.rotation.y}
                    value={spot.rotation.y}
                  />
                </div>
                </Col>
              </Row>
              </Container>
              </FormControl>

      </div>

                 {/* z rotation */}


                 <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'10px',fontWeight:'bold'}}>5 - Rotate the icon, Z <RefreshCw style={{position:"absolute", right:'6px'}} onClick={handlePropertyReset('z',spot)}/></h6>
      <div  className="line-center">
                <FormControl className={classes.formControl}>
                   <Container className="pl-0 pr-0 mb-0">
                     <Row className="pl-0 pr-0 mb-0">
                         <Col className="pl-0 pr-0 mb-0">
                           <div style={{width:'100%'}} >
                <Typography className="property-setting-value">{spot.rotation.z}</Typography>
                <input
                    type="range"
                    step="1"
                    min={spot.rotation.min}
                    max={spot.rotation.max}
                    id={`input-rotation-z-${spot.id}`}
                    onChange={handlePropertyChange('z', spot)}
                    defaultValue={spot.rotation.z}
                    value={spot.rotation.z}
                  />
                </div>
                </Col>
              </Row>
              </Container>
              </FormControl>

      </div>

                              {/* opacity */}


                              <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'10px',fontWeight:'bold'}}>6 - Change icon opacity <RefreshCw style={{position:"absolute", right:'6px'}} onClick={handlePropertyReset('opacity', spot)}/></h6>
      <div  className="line-center">
                <FormControl className={classes.formControl}>
                   <Container className="pl-0 pr-0 mb-0">
                     <Row className="pl-0 pr-0 mb-0">
                         <Col className="pl-0 pr-0 mb-0">
                           <div style={{width:'100%'}} >
                <Typography className="property-setting-value">{spot.opacity.value}</Typography>
                <input
                    type="range"
                    step="1"
                    min={spot.opacity.min}
                    max={spot.opacity.max}
                    id={`input-rotation-opacity-${spot.id}`}
                    onChange={handlePropertyChange('opacity',spot)}
                    defaultValue={spot.opacity.value}
                    value={spot.opacity.value}
                  />
                </div>
                </Col>
              </Row>
              </Container>
              </FormControl>

      </div>   

                              {/* scale */}


                              <h6 style={{fontSize:'13px', color:'white' ,textAlign:'left', textTransform:'uppercase',marginTop:'10px'}}>7 - Change icon Scale <RefreshCw style={{position:"absolute", right:'6px'}} onClick={handlePropertyReset('scale', spot)}/></h6>
      <div  className="line-center">
                <FormControl className={classes.formControl}>
                   <Container className="pl-0 pr-0 mb-0">
                     <Row className="pl-0 pr-0 mb-0">
                         <Col className="pl-0 pr-0 mb-0">
                           <div style={{width:'100%'}} >
                <Typography className="property-setting-value">{spot.scale.value}</Typography>
                <input
                    type="range"
                    step="1"
                    min={spot.scale.min}
                    max={spot.scale.max}
                    id={`input-rotation-scale-${spot.id}`}
                    onChange={handlePropertyChange('scale', spot)}
                    defaultValue={spot.scale.value}
                    value={spot.scale.value}
                  />
                </div>
                </Col>
              </Row>
              </Container>
              </FormControl>

      </div>
              </>
            }
            </>
          }
          </AccordionDetails>
        </Accordion>
        </Col>
        </Row>
        
        </Container>
        )
        } else return null
      })}
      </AccordionDetails>
    </Accordion>
   
    </Col>
      </Row>
   
    </Container>
  </>
  );
}

export default HotSpotPanel;
