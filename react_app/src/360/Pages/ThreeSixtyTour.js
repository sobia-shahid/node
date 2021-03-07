import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useParams, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import ContentLoader from "react-content-loader";
import { FillSpinner } from "react-spinners-kit"; //spiners
import * as AFRAME from 'aframe';
import anime from 'animejs/lib/anime.es.js';
import { setFont, media, setButtonColor } from "../styled.js";
import { UserContext } from "../context/user";
import Frame from "../../360/Pages/Frame";
import { ProductContext } from "../context/products";
import Rotate from "../Assets/rotate.png";
import RotatNo from "../Assets/rotateNo.png";
import Loading from "../Pages/Loading";
import IconButton from "@material-ui/core/IconButton";
import hdLogo from "../Assets/HD.png";
import Carousel, { arrowsPlugin } from '@brainhubeu/react-carousel';
import "@brainhubeu/react-carousel/lib/style.css";
import Badge from '@material-ui/core/Badge';

import { Row, Col, FormGroup, Form, Input, Button, Label } from "reactstrap";
import {
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Info,
  Lock,
  Maximize,
  Minimize,
  Settings,
  Edit,
  Move,
  PlayCircle,
  Play,
  Pause,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  Disc,
  Compass,
  Slash,
  ArrowRight,
  

} from "react-feather";
import { makeStyles } from "@material-ui/core/styles";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import "../../assets/scss/pages/authentication.scss";
import * as THREE from "three";
import Heart from '../Assets/playicon/heart.png';
import HeartFull from '../Assets/playicon/heartfull.png';
import { transitionTypes, transitionDurations } from '../utils/Constants';

import {
  addPlaceAllSpots,
  clearAllHotSpots,  
} from '../../redux/actions/hotspots'
import { registerHotSpotCompenent } from '../utils/editSpotComponent';

registerHotSpotCompenent();
AFRAME.components["look-controls"].Component.prototype.onTouchMove = function (evt) {
  const PI_2 = Math.PI/2;
  let deltaX,deltaY;
  const canvas = this.el.sceneEl.canvas;
  const yawObject = this.yawObject;
  const pitchObject = this.pitchObject;
  if (this.touchStarted && 
      this.data.touchEnabled) { 
    deltaX = 2 * Math.PI * (evt.touches[0].pageY - this.touchStart.y) / canvas.clientHeight; 
    deltaY = 2 * Math.PI * (evt.touches[0].pageX - this.touchStart.x) / canvas.clientWidth; 
    pitchObject.rotation.x += .3 * deltaX;
    yawObject.rotation.y += .5 * deltaY;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    this.touchStart = {
      x: evt.touches[0].pageX,
      y: evt.touches[0].pageY
    };
    }
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
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },

  root1: {
    width: "90%",
    margin: "1rem",
  },
  margin: {
    height: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "92%",
    marginLeft: 10,
    color: "red",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  select: {
    "&:before": {
      borderColor: "#000000",
      height: "5px",
    },
    "&:after": {
      borderColor: "#0ca8fd",
      height: "5px",
    },
  },
  formControl2: {
    margin: theme.spacing(1),
    minWidth: "100%",
    marginLeft: 0,
    color: "red",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  select: {
    "&:before": {
      borderColor: "#000000",
      height: "5px",
    },
    "&:after": {
      borderColor: "#0ca8fd",
      height: "5px",
    },
  },
  opacitySlider: {
    width: "100%",
  },
  exitbtn: {
    "& > *": {
      margin: theme.spacing(1),
      padding: "0.7rem 0.5rem",
    },

    outline: "none!important",
  },
}));

const useQuery = () => {
  return new URLSearchParams(useLocation().search) 
}
export default function ThreeSixtyTour({ viewMode }) {
  const classes = useStyles();
  const query = useQuery();
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const hotSpots = useSelector((state) => state.hotspots.spots);
  const { user } = React.useContext(UserContext); // we will use it
  const { products, likes, updateLikes } = React.useContext(ProductContext);

  const [likeavailable, setLikeavailable] = useState(true);
  const [usermailfromuser] = useState(user.user ? user.user.email : '');
  const [tourLikes, setTourLikes] = useState("");
  const handle = useFullScreenHandle();
  const product = products.filter((item) => item.id === id);
  const [title, settitle] = useState(product.map((item) => item.title));
  const [hd, setHd] = useState(false);
  const [description, setdescription] = useState(
    product.map((item) => item.description)
  );
  const [havePassword, sethavePassword] = useState(
    product.map((item) => item.havePassword)
  );
  const [passwordo, setpasswordo] = useState(
    product.map((item) => item.passwordo)
  );
  const [featuredImage, setfeaturedImage] = useState(
    product.map((item) => item.image)
  );
  const [featuredImageFinal, setFeaturedImageFinal] = useState();

  const [rotationSpeed, setRotationSpeed] = useState(
    product.map((item) => item.rotationSpeed)
  );
  const [rotation, setRotation] = useState(
    product.map((item) => item.rotation)
  );
  const [rotationWas, setRotationWas] = useState(
    product.map((item) => item.rotation)
  );
  const [openDescription, setopenDescription] = useState(
    product.map((item) => item.openDescription)
  );
  const [loop, setLoop] = useState(product.map((item) => item.loop));
  const [direction, setdirection] = useState(
    product.map((item) => item.direction)
  );
  const [zoom, setZoom] = useState(product.map((item) => item.zoom));
  const [userPassword, setUserPassword] = useState("");
  const [pause, setPause] = useState(product.map((item) => item.pause));
  const [showImageFeaturedInPause, setshowImageFeaturedInPause] = useState(
    product.map((item) => item.showImageFeaturedInPause)
  );
  const [playicon, setplayicon] = useState(
    product.map((item) => item.playicon)
  );
  const [disTourTitle, setdisTourTitle] = useState(
    product.map((item) => item.disTourTitle)
  );

  const [pauseOpacity, setpauseOpacity] = useState(
    product.map((item) => item.pauseOpacity)
  );
  const [cssTourTitle, setCssTourTitle] = useState(
    product.map((item) => item.cssTourTitle)
  );
  const [openCarousel, setopenCarousel] = useState(
    product.map((item) => item.openCarousel)
  );
  const [mailuserFromPorduct, setMailuserFromPorduct] = useState(
    product.map((item) => item.email)
  );
  const [carouselWasOpen, setCarouselWasOpen] = useState();
  const [infoButtonIsActive, setInfoButtonIsActive] = useState(true);
  const [carouselDesing, setcarouselDesing] = useState(
    product.map((item) => item.carouselDesing)
  );
  const [puplicId, setPuplicId] = useState("");

  const [css, setCss] = useState(true);
  const [css1, setCss1] = useState(true);
  const [loading, setLoading] = useState(true); // this will show the loading component
  const [image, setImage] = useState([]); // this we be added with getplaces/ the image we added with addThreeSixty form
  const [imageURL, setImageURL] = useState([]);
  const [imageCard, setImageCard] = useState(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [imageURLHd, setImageURLHd] = useState([]);
  const [imageURLSd, setImageURLSd] = useState("");
  const [displayTitleBesideThumb, setDisplayTitleBesideThumb] = useState(true); // difne is to show title beside the thumbnail
  const [showCompanyTitle, setShowCompanyTitle] = useState(true); // define if we wantt to show company title in the pause
  const [compnyTitle, setCompnyTitle] = useState("WALKIN"); // define the company title.
  const [showCompanyTitleWithUrl, setshowCompanyTitleWithUrl] = useState(false); // if we will show company title with url
  const [companyUrl, setcompanyUrl] = useState("https://walkin-360.com/"); // company url,
  const [spinnerColor, setspinnerColor] = useState("#008000"); // spinner color
  const [spinnerSize, setSpinnerSize] = useState("100"); // spinner size

  const [nadir, setnadir] = useState(true); // define if we will use nadir .
  const [nadirImage, setnadirImage] = useState(
    "/static/media/Best-15.fae96415.jpg"
  ); // fefine the nadir image
  const [nadirScale, setnadirScale] = useState(".5 .5 .5 "); // deifne the nadir size
  const [nadirOpacity, setnadirOpacity] = useState("0.5"); // define nadir opacity
  const [isMobile, setisMobile] = useState(false); // define if the user use mobile or dekstop
  const [activeImageCarousel, setActiveImageCarousel] = useState(false);
  const [activeImage, setActiveImage] = useState();
  const [panoramaId, setPanoramaId] = useState(0);
  const [spotActionId, setActionSpotId] = useState('');
  const [spotActionType, setActionSpotType] = useState(-1);
  const [isPlaying, setPlaying] = useState(false);
  const [cameraRotation, setCameraRotation] = useState(null);
  const [viewport, setViewport] = useState(true);
  const [annoyingAnimation, setAnnoyingAnimation] = useState(null);
  const [transitionEffect, setTransitionEffect] = useState(null);
  const [trasitionPending, setTrasitionPending] = useState(false);
  const [isGyroscope, setGyroscope] = useState(false);
  const [rotationText, setRotationText] = useState(null);
  // here you can change the quality when HD is false
  let imageQ = 70;

  // Likes
  const ids = likes.filter((item) => {
    return item.uuid2 === tourLikes;
  });
  const idss = ids.map((item) => {
    return item._id;
  });
  const con = ids.map((item) => {
    return item.count;
  });
  
  const checkLikes = () => {
    const likeInfo = likes.filter((item) => {
      return item.uuid2 === tourLikes;
    });    
    if(likeInfo.length > 0 && likeInfo[0].users && user.user) {
      const users = JSON.parse(likeInfo[0].users);
      const index = users.findIndex((userId) => userId === user.user._id)
      if (index > -1) {
        setLikeavailable(false)
      } else {
        setLikeavailable(true)
      }
    } else {
      setLikeavailable(true)
    }
  }

  const likeadd = (e) => {
    if (user.user === null) {
      history.push('/login');
      return;
    }
    if(!likeavailable) return;
    updateLikes(user.user._id, idss, true);    
  };

  const dislike = () => {
    if(likeavailable) return;
    updateLikes(user.user._id, idss, false);    
  };

  const HandelInfo = () => {
    setopenDescription(true);
    setInfoButtonIsActive(false);
    if (openCarousel) {
      setCarouselWasOpen(true);
      setopenCarousel(false);
    }
    if (!openCarousel) {
      setCarouselWasOpen(false);
    }

    if (rotation) {
      setRotationWas(true);
      setRotation(false);
    }
    if (!rotation) {
      setRotationWas(false);
    }
  };

  const close = () => {
    setopenDescription(false);
    if (carouselWasOpen) {
      setopenCarousel(true);
    }
    if (!carouselWasOpen) {
      setopenCarousel(false);
    }
    if (rotationWas) {
      setRotation(true);
    }
    if (!rotationWas) {
      setRotation(false);
    }
    setInfoButtonIsActive(true);
  };

  const getPlaces = () => {
    setLoading(true);
    dispatch(clearAllHotSpots());
    axios
      .get(`/api/places/${id}`)
      .then((res) => {
        let img = JSON.parse(res.data.place.imgsData[0])[0];
        let qImg = { ...img };
        console.log('place info=>',res.data);
        console.log(JSON.parse(res.data.place.imgsData[0]));
        console.log(img.public_id);
        setImage(JSON.parse(res.data.place.imgsData[0]));

        console.log(JSON.parse(res.data.place.imgsData[0]));
        setImageTitle(JSON.parse(res.data.place.imgsData[0])[0].title);
        setImageDescription(
          JSON.parse(res.data.place.imgsData[0])[0].description
        );
        // console.log('res.data.place.image =>', res.data.place.image);
        setImageCard(JSON.parse(res.data.place.image));
        setFeaturedImageFinal(JSON.parse(res.data.place.image));
        console.log('original img =>', img);
        qImg.secure_url = img.secure_url.replace("upload/", `upload/q_${imageQ}/`);
        setImageURLHd(img);
        setImageURLSd(qImg);
        setImageURL(img);
        setPuplicId(img.public_id);
        settitle(res.data.place.title);
        setRotation(res.data.place.rotation);
        setRotationSpeed(res.data.place.rotationSpeed);
        setdescription(res.data.place.description);
        setopenDescription(res.data.place.openDescription);
        setpasswordo(res.data.place.passwordo);
        sethavePassword(res.data.place.havePassword);
        setfeaturedImage(res.data.place.image);
        setdirection(res.data.place.direction);
        setLoop(res.data.place.loop);
        setZoom(res.data.place.zoom);
        setPause(res.data.place.pause);
        setdisTourTitle(res.data.place.disTourTitle);
        setpauseOpacity(res.data.place.pauseOpacity);
        setCssTourTitle(res.data.place.cssTourTitle);
        setMailuserFromPorduct(res.data.place.email);
        setshowImageFeaturedInPause(res.data.place.showImageFeaturedInPause);
        setplayicon(res.data.place.playicon);
        setActiveImage(res.data.place.activeImage);
        setTourLikes(res.data.place.uuid2);
        if (res.data.place.transitionEffect) {
          setTransitionEffect(JSON.parse(res.data.place.transitionEffect));
        }

        if (res.data.place.hotSpots.length > 0) {
          const allSpots = JSON.parse(res.data.place.hotSpots[0]);
          dispatch(addPlaceAllSpots(allSpots));
        }
        let interval = 0;
        interval = setInterval(() => {
          setLoading(false);
          clearInterval(interval);
        }, 1000);
      })
      .catch((error) => {
        history.push("/");
      });
  };

  useEffect(() => {
    getPlaces();
    setDefaultViewport();
    addSpotEventHandler();
    setisMobile(AFRAME.utils.device.isMobile());
    setBodyOverflowHidden();

    return(() => {
      setBodyOverflowHidden(false);
    })
  }, []);

  useEffect(() => {
    checkLikes();
  }, [likes, tourLikes]);

  // This will return true or false depending on if it's full screen or not.
  let fullScreenMode = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen; 
  useEffect(() => {
    if (!fullScreenMode) setShowFullScreen(false);
  },[fullScreenMode]);

  useEffect(() => {
    if (spotActionType === 5) { //first play sound
      const audio = document.getElementById(`action-audio`);
      if (audio) {
        audio.load();
        handlePlaySound();
      }
    }
  }, [spotActionType, spotActionId]);

  useEffect(() => {
    setDefaultViewport();
  },[viewport, panoramaId]);

  useEffect(() => {
    if (hotSpots.length > 0) {
      setViewport(true);
      setDefaultViewport();
    }
  },[hotSpots.length]);

  // image.length > 0 ? console.log(image) : console.log("still uploading");
  // console.log(imageURLHd);
  // console.log(image.length);

  const addSpotEventHandler =() => {
    document.addEventListener('sopt-clicked', (evt => {
      setActionSpotId(evt.detail.id)}));
  }

  const setAnimation = ({rotateX, rotateY}) => {
    const rotationSP = (Number(rotationSpeed)*3).toString();
    const rotationX = THREE.Math.radToDeg(rotateX).toFixed(0);
    const rotationY = THREE.Math.radToDeg(rotateY).toFixed(0);
    const endY = rotationY - 360;

    setRotationText(
      `property: rotation; startEvents: rotation-begin; pauseEvents: rotation-pause; resumeEvents: rotation-resume; from: ${rotationX} ${rotationY} 0; to: 0 ${endY} 0; loop:${loop}; dur: ${rotationSP}; dir:${direction}; easing :easeOutBack;`
    )
  }

  const setDefaultViewport = () => {
    const curPanorama = hotSpots.find((it) => it.panoramaId === panoramaId);
    console.log('setDefaultViewport status =>', panoramaId, viewport, rotation, curPanorama)
    if (viewport) {
      if (curPanorama && curPanorama.viewport) {
        setCameraRotation(curPanorama.viewport);
        setAnimation(curPanorama.viewport);
      } else {
        setCameraRotation({ rotateX:0, rotateY: 0 });
        setAnimation({ rotateX: 0, rotateY: 0 });
      }       
      setViewport(false);
    }
  };

  const setBodyOverflowHidden = (hidden = true) => {
    document.querySelector('body').style.overflow = hidden ? 'hidden': 'auto';
  }
  const applyPanoramaAnnoying = () => {    
    const canvasEl = document.querySelector('canvas');
    if (canvasEl) {
      console.log('transitionEffect=>', transitionEffect);
      console.log('annoyingAnimation=>', annoyingAnimation);
      if (annoyingAnimation) {
        annoyingAnimation.restart();
      } else {
        const annoyingAnimation1 = transitionEffect && transitionEffect.type
        ? anime({
            targets: 'canvas',
            easing: 'easeInOutSine',
            duration: transitionEffect.duration,
            ...transitionEffect.type.animation,                        
            begin: function(anim) {
              setTrasitionPending(true);
            }, 
            complete: function(anim) {
              setTrasitionPending(false);
            }     
          })
        : anime({
            targets: 'canvas',
            duration: 1000,
            easing: 'easeInOutSine',
            ...transitionTypes[0].animation,
            begin: function(anim) {
              setTrasitionPending(true);
            }, 
            complete: function(anim) {
              setTrasitionPending(false);
            }        
          });
        annoyingAnimation1.restart();
        setAnnoyingAnimation(annoyingAnimation1);
      }
    }
  } 
  const PasswordCheck = (password, userpassword, css) => {
    console.log(userpassword);
    if (password == userpassword) {
      setCss(false);
      setCss1(false);
    } else console.log("password false");
  };
  const jumpToPanorama = (actionData) => {
    {
      if (actionData.panoramaId >= 0)  {
        setTrasitionPending(true);
        // setActionSpotId('');
        setActionSpotType(-1);
        const panorama =  image[actionData.panoramaId];
        setPanoramaId(actionData.panoramaId);
        setCameraRotation(actionData.rotation);
        setAnimation(actionData.rotation);
        setZoom(zoom);
        setImageURLHd(panorama);
        let qImg = { ...panorama };
        
        qImg.secure_url = panorama.secure_url.replace(
          "upload/",
          `upload/q_${imageQ}/`
          );
        setImageURLSd(qImg);
        setImageTitle(panorama.title);
        setImageDescription(panorama.description);
        applyPanoramaAnnoying();       
      }
    }
  };
  const handlePlaySound = () => {
    setPlaying(true);
    const audio = document.getElementById(`action-audio`);
    if (audio) {
      audio.play();
    }
  }
  const handlePauseSound = () => {
    setPlaying(false);
    const audio = document.getElementById(`action-audio`);
    if (audio) audio.pause();
  }
  
  const handleChangeCarousPanorama = (panorama, id) => (e) => {
    setZoom(zoom);    
    setActionSpotType(-1);
    setActionSpotId('');
    setPlaying(false);
    setPanoramaId(id)
    setImageURLHd(panorama);
    let qImg = { ...panorama };
    
    qImg.secure_url = panorama.secure_url.replace(
      "upload/",
      `upload/q_${imageQ}/`
      );
      
    setImageURLSd(qImg);
    setImageTitle(panorama.title);
    setImageDescription(panorama.description);
    setRotation(product.map((item) => item.rotation)[0]);
    setViewport(true);
    setTrasitionPending(true);
    applyPanoramaAnnoying();
  }

  const handleChangeFullScreen = (e) => {
    if(!showFullScreen) {
      handle.enter(); 
    } else {
      handle.exit(); 
    }
    setShowFullScreen(!showFullScreen);

  }

  const handleJumpPrePage = (e) => {
    const backPath = query.get('back');
    if (backPath === 'edit') {
      const backId= query.get('id');
      if (backId) {
        history.push(`/EditPictures/${id}`);
      } else {
        history.push("/VirtualTour");
      }
    } else if (backPath === 'EditTour') {
      history.push("/EditTour", {
        prooduct: {
          id,
          title,
          image,
        },
      });
    } else {
      history.goBack()
    }
  }

  const handleSetGyroscope = (e) => {
    if (!isGyroscope) setRotation(false);
    setGyroscope(!isGyroscope)
  }

  const handleClickRotate = (e) => {
    if (isGyroscope) return ;
    setRotation(!rotation);
  }
  if (loading) {
    return <Loading />;
  }

  console.log('panorama images => ', image)
  console.log('place hotSpots => ', hotSpots)
  console.log('panoramaId => ', panoramaId)
  console.log('spotActionType => ', spotActionType)  

  return (
    <>
      {!loading && (
        <div className="all-page" >
          <FullScreen handle={handle}  >
            <div >
              {/* description */}
              <div>
                {openDescription && (
                  // if the information background is open, what to show, here we talk about title of tour and description of tour
                  <div>
                    <Title>
                      <div
                        className="black-background"
                        style={{
                          width: "100vw",
                          height: "100vh",
                          // backgroundColor: "black",
                          position: "fixed",
                          top: "0px",
                          left: "0px",
                          zIndex: "19",
                          // opacity: "0.5",
                        }}
                      ></div>
                      <div className="containers">
                        <XCircle
                          className="close1"
                          onClick={close}
                          color="#0ca8fd"
                        />
                        <div>
                          <img
                            src={imageCard.uploadInfo.secure_url}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "25px 0px 0px 25px",
                              objectFit: "cover",
                              justifySelf: "center",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto auto auto",
                          }}
                        >
                          <div>
                            <div className="title">
                              {imageTitle ? imageTitle : title}
                            </div>

                            <div className="descrition">
                              {imageDescription
                                ? imageDescription
                                : description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Title>
                  </div>
                )}
              </div>
              {/* end description */}
              {!pause && ( // if we are on pause, mean we have pasue start screen. if we are not on pause screen then to show home and dinfromation buttons
                <Btn>
                  <div className="top-shadow" />
                  <div className="container-top-left">
                    <div className={classes.exitbtn}>
                      {/* {user.user &&user.user.isAdmin ?} */}
                      {user.user && user.user.isEditor ? (
                        <IconButton
                          aria-label="delete"
                          style={{
                            outline: "none",
                            backgroundColor: "rgba(255,0,0,0.0)",
                          }}
                        >
                          <ArrowLeft
                            onClick={handleJumpPrePage}
                            size={25}
                            style={{
                              color: "white",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          />
                        </IconButton>
                       ) : (
                        <IconButton
                          aria-label="delete"
                          style={{
                            outline: "none",
                            backgroundColor: "rgba(255,0,0,0.0)",
                          }}
                        >
                          <ArrowLeft
                            onClick={handleJumpPrePage}
                            size={25}
                            style={{
                              color: "white",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          />
                        </IconButton>
                      )}

                      {infoButtonIsActive ? (
                        <IconButton
                          aria-label="delete"
                          style={{
                            outline: "none",
                            backgroundColor: "rgba(255,0,0,0.0)",
                          }}
                        >
                          <Info
                            onClick={HandelInfo}
                            size={25}
                            style={{
                              color: "white",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          />
                        </IconButton>
                       ) : (
                        <IconButton
                          disabled
                          aria-label="delete"
                          style={{
                            outline: "none",
                            backgroundColor: "rgba(255,0,0,0.0)",
                          }}
                        >
                          <Info
                            onClick={HandelInfo}
                            size={25}
                            style={{
                              color: "white",
                              backgroundColor: "rgba(255,0,0,0.0)",
                              opacity: "0.5",
                            }}
                          />
                        </IconButton>
                      )}
                      {spotActionType === 5 && (   //play sound
                        isPlaying
                        ? <IconButton
                            aria-label="player"
                            style={{
                              outline: "none",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          >
                            <PauseCircle
                              onClick={handlePauseSound}
                              size={25}
                              style={{
                                color: "white",
                                backgroundColor: "rgba(255,0,0,0.0)",
                              }}
                            />
                          </IconButton>
                        : <IconButton
                            aria-label="player"
                            style={{
                              outline: "none",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          >
                            <PlayCircle
                              onClick={handlePlaySound}
                              size={25}
                              style={{
                                color: "white",
                                backgroundColor: "rgba(255,0,0,0.0)",
                              }}
                            />
                          </IconButton>
                      )}
                    </div>
                    {isMobile== true ? 
                    (''): (    <div className="title-tour">
                    <h5>{title}</h5>
                  </div>)}
                
                  </div>

                  <div className="top-bar">


                    <div className={classes.exitbtn}>
                      <>
                        {!pause && rotation ? (
                          <IconButton
                            aria-label="delete"
                            style={{
                              outline: "none",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          >
                            <img
                              src={Rotate}
                              onClick={handleClickRotate}
                              size={25}
                              style={{
                                color: "white",
                                backgroundColor: "rgba(255,0,0,0.0)",
                                width: "27px",
                                height: "25px",
                                position: "fixed",
                                top: "20px",
                                right: "20px",
                              }}
                            />
                          </IconButton>
                        ) : (
                          <IconButton
                            aria-label="delete"
                            style={{
                              outline: "none",
                              backgroundColor: "rgba(255,0,0,0.0)",
                            }}
                          >
                            <img
                              src={RotatNo}
                              onClick={handleClickRotate}
                              size={25}
                              style={{
                                color: "white",
                                backgroundColor: "rgba(255,0,0,0.0)",
                                width: "27px",
                                height: "25px",
                                position: "fixed",
                                top: "20px",
                                right: "20px",
                              }}
                            />
                          </IconButton>
                        )}

                        <>
                          {hd ? (
                            <IconButton
                              aria-label="delete"
                              style={{
                                outline: "none",
                                backgroundColor: "rgba(255,0,0,0.0)",
                              }}
                              onClick={()=>setHd(false)}
                            >
                              <div
                                style={{
                                  backgroundColor: "green",
                                  position: "fixed",
                                  width: "7px",
                                  height: "7px",
                                  zIndex: "1111",
                                  borderRadius: "7px",

                                  top: "20px",
                                  right: "60px",
                                }}
                              ></div>
                              <img
                                src={hdLogo}
                                style={{
                                  color: "white",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                  // width: "27px",
                                  height: "23px",

                                  position: "fixed",
                                  top: "23px",
                                  right: "63px",
                                }}
                              ></img>
                            </IconButton>
                          ) : (
                            <>
                              <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={()=>setHd(true)}
                              >
                                {" "}
                                <div
                                  style={{
                                    backgroundColor: "red",
                                    position: "fixed",
                                    width: "7px",
                                    height: "7px",
                                    zIndex: "1111",
                                    borderRadius: "7px",
                                    opacity: "0.7",
                                    top: "20px",
                                    right: "60px",
                                  }}
                                ></div>
                                <img
                                  src={hdLogo}
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "0.4",
                                    position: "fixed",
                                    top: "23px",
                                    right: "63px",
                                  }}
                                ></img>
                              </IconButton>
                            </>
                          )}
                          {!showFullScreen 
                            ? <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={handleChangeFullScreen}
                              >
                                <Maximize
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "1",
                                    position: "fixed",
                                    top: "23px",
                                    right: "105px",
                                  }}
                                ></Maximize>
                              </IconButton>                            
                            : <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={handleChangeFullScreen}
                              >
                                <Minimize
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "1",
                                    position: "fixed",
                                    top: "23px",
                                    right: "105px",
                                  }}
                                ></Minimize>
                              </IconButton>                            
                          }

                          {/* buttons that will show only for the admin of the tour */}
                          {viewMode === 'tour' && mailuserFromPorduct == usermailfromuser && (
                            <>
                              <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={() => {
                                  history.push("/EditTour", {
                                    prooduct: {
                                      id,
                                      title,
                                      image,
                                    },
                                  });
                                }}
                              >
                                <Settings
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "1",
                                    position: "fixed",
                                    top: "23px",
                                    right: "150px",
                                  }}
                                ></Settings>
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={() => {
                                  history.push(`/EditPictures/${id}`, {
                                    product: {
                                      id,
                                    },
                                  });
                                }}
                              >
                                <Edit
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "1",
                                    position: "fixed",
                                    top: "23px",
                                    right: "195px",
                                  }}
                                ></Edit>
                              </IconButton>
                            </>
                          )}
                          {viewMode === 'allTour' && 
                            (
                            <>
                            {isMobile &&
                              <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={handleSetGyroscope}
                              >
                                {!isGyroscope
                                ? <Compass
                                    style={{
                                      color: "white",
                                      backgroundColor: "rgba(255,0,0,0.0)",
                                      // width: "27px",
                                      height: "25px",
                                      opacity: "1",
                                      position: "fixed",
                                      top: "23px",
                                      right: "140px",
                                    }}
                                  />
                                : <Move
                                    style={{
                                      color: "white",
                                      backgroundColor: "rgba(255,0,0,0.0)",
                                      // width: "27px",
                                      height: "23px",
                                      opacity: "1",
                                      position: "fixed",
                                      top: "23px",
                                      right: "140px",
                                    }}
                                  />  
                                }                              
                              </IconButton> 
                            }
                            {likeavailable 
                            ? <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={likeadd}
                              >
                                <Badge badgeContent={con} color="error"
                                  style={{
                                    position: "fixed",
                                    top: "23px",
                                    right: isMobile ? "215px" : "190px",
                                    color: "white",
                                  }}
                                >                                 
                                <img
                                  src={Heart}  
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "1",
                                    position: "fixed",
                                    top: "23px",
                                    right: isMobile? "175px" : "150px",
                                  }}
                                />
                                </Badge>
                              </IconButton>
                            : <IconButton
                                aria-label="delete"
                                style={{
                                  outline: "none",
                                  backgroundColor: "rgba(255,0,0,0.0)",
                                }}
                                onClick={() => dislike()}
                              >
                                <Badge badgeContent={con} color="primary"
                                  style={{
                                    position: "fixed",
                                    top: "23px",
                                    right: isMobile ? "215px" : "190px",
                                    color: "white",
                                  }}
                                >                                  
                                <img
                                  src={HeartFull}  
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(255,0,0,0.0)",
                                    // width: "27px",
                                    height: "23px",
                                    opacity: "1",
                                    position: "fixed",
                                    top: "23px",
                                    right: isMobile ? "175px" : "150px",
                                  }}
                                />
                                </Badge>
                              </IconButton>}
                            </>
                          )}
                        </>
                      </>
                    </div>
                  </div> 
                </Btn>
              )}

              <Tour >
                {/* // if we define to have rotation the 360 , then what will show, we will go for checking the nadir , if we have nadir or not. */}
                {!loading 
                  ? <div onMouseDown={(e) => setRotation(false)}>
                      <Frame
                        panoramaId={panoramaId}
                        spotActionId={spotActionId}
                        image={hd ? imageURLHd.secure_url : imageURLSd.secure_url}
                        animation={rotationText}
                        zoom={zoom}
                        nadir={nadir}
                        nadir={nadirImage}
                        nadirScale={nadirScale}
                        nadirOpacity={nadirOpacity}
                        loading={true}
                        // setLoading={setLoading}
                        isMobile={isMobile}
                        setActionSpotId={setActionSpotId}
                        setActionSpotType={setActionSpotType}
                        jumpToPanorama={jumpToPanorama}
                        cameraRotation={cameraRotation}
                        trasitionPending={trasitionPending}
                        applyPanoramaAnnoying={applyPanoramaAnnoying}
                        isGyroscope={isGyroscope}
                        rotation={rotation}
                      />
                    </div>
                  :  <div>
                      <Frame
                        image={hd ? imageURLHd.secure_url : imageURLSd.secure_url}
                        zoom={zoom}
                        loading={true}
                      />
                    </div>  
                }

                {!pause && showCompanyTitleWithUrl && showCompanyTitle ? (
                  <div className="company-title">
                    <p>
                      <a href={companyUrl}>{compnyTitle}</a>
                    </p>
                  </div>
                ) : (
                  ""
                )}

                {pause ? ( // here we checking if we are in pasue , if yes , then we will go for other check, if we will show featured image in the pause screen, if not to show him image that we will define, background, black screen, we need to dfine those
                  <>
                    <div
                      style={{
                        width: "100vw",
                        height: "100vh",
                        position: "fixed",
                        left: "0px",
                        top: "0px",
                        zIndex: "11",
                      }}
                    >
                      {showImageFeaturedInPause ? (
                        <img
                          src={featuredImage}
                          className="image-background-on-pause"
                        />
                      ) : (
                        ""
                      )}

                      <div
                        style={{
                          backgroundColor: "black",

                          width: "100vw",
                          height: "100vh",
                          position: "fixed",
                          left: "0px",
                          top: "0px",
                          zIndex: "10",
                          opacity: pauseOpacity,
                        }}
                      ></div>
                      <div
                        onClick={() => {
                            setPause(false);
                            setLoading(true);
                            let interval = 0;
                            interval = setInterval(() => {
                              setLoading(false);
                              clearInterval(interval);
                            }, 100);
                          }
                        }
                      >
                        {disTourTitle && (
                          <h1 className={cssTourTitle}>
                            {
                              title // here we checking if we will disply tour title, if not what to show
                            }
                          </h1>
                        )}

                        <img src={playicon} alt="Play" className="play-btn" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="not-pause"></div>
                )}
              </Tour>
              {/* // here we define if not pause, to show the carousel */}
              <Circle1>
                <div>
                  {!pause && openCarousel ? ( // here we define if the carousel is start with open or close status
                    <div className="carousel">
                      <Carousel
                        slidesPerPage={3}
                        // onChange={() => setActiveImage(true)}
                        offset={10}
                        draggable
                        itemWidth={200}
                        plugins={[
                          {
                            resolve: arrowsPlugin,
                            options: {
                              arrowLeft: <button><ArrowLeft name="angle-double-left" /></button>,
                              arrowLeftDisabled:<button><ArrowLeft name="angle-left" /></button>,
                              arrowRight: <button><ArrowRight name="angle-double-right" /></button>,
                              arrowRightDisabled: <button><ArrowRight name="angle-right" /></button>,
                              addArrowClickHandler: true,
                            }
                          }
                        ]}
                        
                      >
                        {image.length > 0
                          ? image.map((panorama, index) => {
                              return (
                                <>
                                  {loading ? (
                                    <div
                                      key={`panorama-${index}`}
                                      style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                      }}
                                    >
                                      {<Loading />}
                                    </div>
                                  ) : (
                                    <div
                                      // url image
                                      key={`panorama-${index}`}
                                      style={{ cursor: "pointer" }}
                                      className={carouselDesing}
                                      onDoubleClick={handleChangeCarousPanorama(panorama, index)}
                                    >
                                      <div
                                        className={`${
                                          panorama.thumbnail_url ==
                                            imageURLHd.thumbnail_url ||
                                          panorama.thumbnail_url ==
                                            imageURLSd.thumbnail_url
                                            ? "activeImage"
                                            : "notActiveImage"
                                        }`}
                                      >
                                        {(panorama.thumbnail_url !==
                                          imageURLHd.thumbnail_url ||
                                          panorama.thumbnail_url !==
                                            imageURLSd.thumbnail_url) && (
                                          <div
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              top: "0px",
                                              left: "0px",
                                              position: "absolute",
                                              backgroundColor: "black",
                                              opacity: "0.4",
                                            }}
                                          ></div>
                                        )}
                                        {(panorama.thumbnail_url ==
                                          imageURLHd.thumbnail_url ||
                                          panorama.thumbnail_url ==
                                            imageURLSd.thumbnail_url) && (
                                          <div
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              top: "0px",
                                              left: "0px",
                                              position: "absolute",
                                              backgroundColor: "black",
                                              opacity: "0.8",
                                            }}
                                          ></div>
                                        )}
                                        {(panorama.thumbnail_url ==
                                          imageURLHd.thumbnail_url ||
                                          panorama.thumbnail_url ==
                                            imageURLSd.thumbnail_url) && (
                                          <PlayCircle
                                            size={20}
                                            className="visited"
                                            style={{
                                              color: "white",
                                              position: "absolute",
                                              left: "10px",
                                              top: "10px",
                                              color: "white",
                                              zIndex: "1111111",
                                            }}
                                          ></PlayCircle>
                                        )}
                                        <img
                                          src={panorama.thumbnail_url}
                                          style={{
                                            width: "200px",
                                            height: "100px",
                                            objectFit: "cover",
                                          }}
                                        ></img>
                                        {(panorama.thumbnail_url !==
                                          imageURLHd.thumbnail_url ||
                                          panorama.thumbnail_url !==
                                            imageURLSd.thumbnail_url) && (
                                          <PlayCircle
                                            size={40}
                                            className="onhoverplay"
                                          />
                                        )}
                                        {/* <div className="image-overlay"></div> */}
                                        {displayTitleBesideThumb && ( // here we define if there is title inside the carousel
                                          <h1 className="left-title">
                                            {panorama.title ? panorama.title : ""}
                                          </h1>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })
                          : console.log("no")}
                      </Carousel>
                      {image.length > 1 && (
                        <div
                          className="close-carousel"
                          onClick={() => {
                            return setopenCarousel(false);
                          }}
                        >
                          <ChevronDown size={35} color="white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="open-carousel"
                      onClick={() => {
                        return setopenCarousel(true);
                      }}
                    >
                      <ChevronUp size={35} color="white" />
                    </div>
                  )}
                </div>
              </Circle1>
              <LockPage>
                {havePassword ? (
                  <>
                    <div className={css1 ? "black-back" : "black-back-none"}>
                      {" "}
                    </div>
                    <div
                      className={
                        css ? "lockPage-container" : "lockPage-container-none"
                      }
                    >
                      <div className="left-image">
                        <img
                          src={featuredImageFinal.uploadInfo.secure_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            // border: "2px solid black",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="main-form-container">
                        <div>
                          <h3 style={{ textTransform: "uppercase" }}>
                            {title}
                          </h3>
                        </div>
                        <div>
                          <h5>Please insert the password</h5>
                        </div>

                        <div>
                          {/* <input
                        type="text"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                      />

                      <button
                        onClick={() => PasswordCheck(password, userPassword)}
                      >
                        clikck
                      </button> */}

                          <Row className="justify-content-md-center mt-2">
                            <Col lg="6" md="12" mt="12">
                              <FormGroup className="position-relative form-label-group has-icon-left">
                                <Input
                                  type="text"
                                  value={userPassword}
                                  onChange={(e) =>
                                    setUserPassword(e.target.value)
                                  }
                                  placeholder="Insert Password"
                                />
                                <div className="form-control-position">
                                  <Lock size={15} />
                                </div>
                                <Label>Insert Password</Label>
                              </FormGroup>
                              <Button.Ripple
                                color="primary"
                                onClick={() =>
                                  PasswordCheck(passwordo, userPassword)
                                }
                              >
                                Submit
                              </Button.Ripple>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  ""
                )}
              </LockPage>
            </div>
          </FullScreen>
        </div>
      )}
    </>
  );
}
const LockPage = styled.div`
  .black-back {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: black;
    z-index: 12;
    opacity: 0.95;
  }
  .black-back-none {
    display: none;
  }
  .lockPage-container {
    background-color: white;
    width: 50%;
    height: 50%;
    left: 50%;
    top: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 13;
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* border: 2px solid red; */
  }
  .lockPage-container-none {
    display: none;
  }
  .main-form-container {
    width: 100%;
    height: 200px;
    align-self: center;
    justify-self: center;
    text-align: center;

    display: grid;
  }
`;
const Title = styled.div`
  .containers {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 60%;
    height: 70%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
  .black-background {
    background: rgb(0, 0, 0);
    background: radial-gradient(
      circle,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.4713235636051295) 100%
    );
  }

  .cover-about {
    position: fixed;
    padding: 3rem;
    right: 0px;
    top: 52px;
    width: 25%;
    height: 100vh;
    z-index: 10;
    background-color: black;
    opacity: 0.8;
  }
  .close1 {
    z-index: 11111;
    position: fixed;
    right: 15px;
    top: 15px;
    max-width: 30px;
    max-height: 30px;
    display: block;
    cursor: pointer;
  }

  ${media.phone`
  .containers {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 97%;
    height: 97%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
  .title {
    color: #0ca8fd;
    font-size: 1.5rem;
    text-align: center;
    padding: 5rem 2rem 2rem 2rem;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .descrition {
    color: #787878;
    font-size: 13px;
    position: relative;
    padding: 3rem 2rem;
    text-align:center;
  }
 
  `}

  ${media.tablet`
  .containers {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 97%;
    height: 97%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
  .title {
    color: #0ca8fd;
    font-size: 20px;
    text-align: center;
    padding: 3rem 5rem;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .descrition {
    color: #787878;
    font-size: 13px;
    position: relative;
    padding: 0rem 5rem;
    text-align:center;
  }
 
  `}

  ${media.desktop`
  .containers {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 60%;
    height: 70%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
  .title {
    color: #0ca8fd;
    font-size: 20px;
    text-align: left;
    padding: 3rem 5rem;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .descrition {
    color: #787878;
    font-size: 13px;
    position: relative;
    padding: 0rem 5rem;
    text-align: left;
  }
  `}

  ${media.large`
  .containers {
    position: absolute;
    display: grid;
    grid-template-columns: 40% 60%;
    /* padding: 3rem; */
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 60%;
    height: 70%;
    z-index: 20;
    background-color: white;
    border-radius: 25px;
    -webkit-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
    box-shadow: -5px -3px 5px -4px rgba(0, 0, 0, 0.52);
  }
  .title {
    color: #0ca8fd;
    font-size: 20px;
    text-align: left;
    padding: 3rem 5rem;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .descrition {
    color: #787878;
    font-size: 13px;
    position: relative;
    padding: 0rem 5rem;
    text-align: left;
  }
  `}
`;
const Btn = styled.div`
  .container-top-left {
    position: absolute;
    left: 7px;
    top: 7px;
    display: grid;
    grid-template-columns: auto auto auto;
    height: 50px;
    align-items: center;

    z-index: 11;
    justify-items: center;
  }
  .title-tour h5 {
    text-transform: uppercase;
    color: white;
    font-size: 1rem;
    margin-top: 5px;
    margin-left: 8px;
    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
  }

  .btn-info {
    z-index: 11;
    position: absolute;

    width: 30px;
    height: 30px;
    z-index: 10;
    cursor: pointer;
    font-family: "Titillium Web", sans-serif;
  }
  .btn-back {
    z-index: 11;
    position: absolute;

    width: 30px;
    height: 30px;
    z-index: 10;
    cursor: pointer;
    font-family: "Titillium Web", sans-serif;
  }
  .image {
    position: absolute;
    left: 2rem;
    top: 5rem;
    width: 30px;
    height: 30px;
    z-index: 10;
    cursor: pointer;
  }

  .information {
    border: none;
    border-radius: 0px;
    padding: 1rem;
    z-index: 11;
    cursor: pointer;
    background: green;
    font-size: 15px;
    font-weight: bold;
  }
  .top-bar {
    position: absolute;
    right: 0rem;
    top: 0rem;
    display: grid;
    grid-template-columns: auto auto auto;

    z-index: 11;
    justify-items: end;
    font-family: "Titillium Web", sans-serif;
  }
  .top-shadow {
    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
    position: fixed;
    top: 0px;
    width: 100%;
    height: 70px;
    left: 0px;
    z-index: 4;
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#000000+0,ffffff+100&0.54+0,0+100 */
    background: -moz-linear-gradient(
      top,
      rgba(0, 0, 0, 0.54) 0%,
      rgba(255, 255, 255, 0) 100%
    ); /* FF3.6-15 */
    background: -webkit-linear-gradient(
      top,
      rgba(0, 0, 0, 0.54) 0%,
      rgba(255, 255, 255, 0) 100%
    ); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.54) 0%,
      rgba(255, 255, 255, 0) 100%
    ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#8a000000', endColorstr='#00ffffff',GradientType=0 ); /* IE6-9 */
  }

  .hd {
    border: none;
    border-radius: 0px;
    padding: 1rem;
    z-index: 11;
    cursor: pointer;
    position: fixed;
    right: 0px;
    top: 112px;
    font-size: 15px;
    font-weight: bold;
  }
  .hd:after {
    content: "HD";
  }
`;
const Tour = styled.div`
  overflow: hidden;
  .pause {
    width: 100vw;
    height: 100vh;
    background-color: black;
    opacity: 0.6;
    position: fixed;
    left: 0px;
    top: 0px;
    z-index: 10;
  }
  .pause1 {
    width: 100vw;
    height: 100vh;
    background-color: black;
    opacity: 0.1;
    position: fixed;
    left: 0px;
    top: 0px;
    z-index: 10;
  }
  .play-btn {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    z-index: 10000;
    cursor: pointer;
  }
  .tour-title {
    position: absolute;
    left: 50%;
    top: 65%;
    transform: translate(-50%, -50%);
    color: White;
    z-index: 110000;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 2rem;
    text-align: center;
  }
  .tourShadow {
    position: absolute;
    left: 50%;
    top: 65%;
    transform: translate(-50%, -50%);
    color: White;
    z-index: 110000;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 2rem;
    text-align: center;
    text-shadow: 4px 4px 4px rgba(0, 0, 0, 1);
  }
  .company-title {
    position: absolute;
    left: 5%;
    top: 15%;
    transform: translate(-50%, -50%);
    color: White;
    z-index: 110000;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 2rem;
  }
  .not-pause {
    display: none;
  }
  .image-background-on-pause {
    background-position: center;
    background-size: cover;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }
`;
const Circle1 = styled.div`
  .carousel {
    user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
  }
  .activeImage {
    background-color: black;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    z-index: 111111111111111111111;
  }
  .notActiveImage {
    opacity: 1 !important;
  }

  .image-overlay1 {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: red;
    opacity: 0.6;
  }
  .image-overlay {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.3;
  }

  .small-image-button {
    border: none;
    /* border: 5px solid black; */
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    float: left;
  }

  .small-image-button:hover .image-overlay {
    opacity: 0.5;
    border: 10px solid black;
    box-shadow: inset 0px 0px 0px 2px white;
    box-sizing: border-box; /* Include padding and border in element's width and height */
  }
  .small-image-button1 {
    border: none;

    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    float: left;
  }
  .small-image-button1:hover .image-overlay {
    width: 100%;
    height: 8px;
    position: absolute;
    top: 0px;
    left: 0px;
    background-color: #0ca8fd;
    opacity: 0.9;
  }

  .BrainhubCarousel__container {
    position: fixed;
    bottom: 0px;
    left: 0px;
    /* background-color: rgba(0, 0, 0, 0.6); */
    padding: 0.6rem 0.2rem;
    z-index: 2;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.0) 100%
    );
  }

  .open-carousel {
    border: none;
    border-radius: 0px;
    padding: 0.3rem;
    z-index: 1;
    cursor: pointer;
    position: fixed;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 15px;
    font-weight: bold;
    opacity: 1;
    cursor: pointer;
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#000000+0,000000+100&0.02+1,0.16+100 */
    background: -moz-linear-gradient(
      top,
      rgba(0, 0, 0, 0.02) 0%,
      rgba(0, 0, 0, 0.02) 1%,
      rgba(0, 0, 0, 0.16) 100%
    ); /* FF3.6-15 */
    background: -webkit-linear-gradient(
      top,
      rgba(0, 0, 0, 0.02) 0%,
      rgba(0, 0, 0, 0.02) 1%,
      rgba(0, 0, 0, 0.16) 100%
    ); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.02) 0%,
      rgba(0, 0, 0, 0.02) 1%,
      rgba(0, 0, 0, 0.16) 100%
    ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#05000000', endColorstr='#29000000',GradientType=0 ); /* IE6-9 */
  }
  .close-carousel {
    border: none;
    border-radius: 0px;
    padding: 0.3rem;
    z-index: 1;
    cursor: pointer;
    position: fixed;
    bottom: 114px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 15px;
    font-weight: bold;
    opacity: 1;
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#000000+0,000000+100&0.07+1,0.16+100 */
    background: -moz-linear-gradient(
      top,
      rgba(0, 0, 0, 0.07) 0%,
      rgba(0, 0, 0, 0.07) 1%,
      rgba(0, 0, 0, 0.16) 100%
    ); /* FF3.6-15 */
    background: -webkit-linear-gradient(
      top,
      rgba(0, 0, 0, 0.07) 0%,
      rgba(0, 0, 0, 0.07) 1%,
      rgba(0, 0, 0, 0.16) 100%
    ); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.07) 0%,
      rgba(0, 0, 0, 0.07) 1%,
      rgba(0, 0, 0, 0.16) 100%
    ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#12000000', endColorstr='#29000000',GradientType=0 ); /* IE6-9 */
  }

  .onhoverplay {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: white;
    opacity: 0;
  }
  .BrainhubCarouselItem:hover .onhoverplay {
    opacity: 1;
    transition: opacity 0.4s;
  }
  .left-title {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 15px;
    transform: translate(-50%, -50%);
    color: white;
    text-transform: uppercase;
    opacity: 1;
  }
  .BrainhubCarouselItem:hover .left-title {
    opacity: 0.1;
    transition: opacity 0.5s;
  }
`;
