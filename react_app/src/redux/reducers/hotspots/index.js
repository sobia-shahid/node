import {
  HOT_REGISTER_COMPONENT,
  HOT_UNREGISTER_COMPONENT,
  HOT_REGISTER_EDIT_COMPONENT,
  HOT_UNREGISTER_EDIT_COMPONENT,

  HOT_ADD_PLACE,
  HOT_ADD_PLACE_SPOTS,
  HOT_ADD_PANORAMA_SPOT ,
  HOT_REMOVE_PLACE_SPOTS,
  HOT_REMOVE_PANORAMA_SPOT,
  HOT_UPDATE_PLACE_SPOTS,
  HOT_UPDATE_PANORAMA_SPOT,
  HOT_CLEAR_ALL_SPOTS,
  ADD_CUSTOM_ICON,
  REMOVE_CUSTOM_ICON,
  CLEAR_CUSTOM_ICONS,
  HOT_SET_ACTIVE,
  HOT_SET_PANORAMA_VIEWPORT,
  HOT_CLEAR_PANORAMA_VIEWPORT,
} from '../../../360/utils/Constants.js'
const initialState = {
  spots: [],
  customIcons: [],
  fixedIcons: [],
  editSpotId: '',
}

const hotSpotsReducer = (state = initialState, action) => {
  // console.log('hotSpotsReducer: state => ', state);
  // console.log('hotSpotsReducer: action => ', action);
  let currentAllSpots = [];
  let currentPlaceSpots = [];
  let currentPanoramaSpots = [];
  let updatedPanoramaSpots = [];

  switch (action.type) {
    case HOT_ADD_PLACE:      
      return { ...state, spots: action.data };

    case HOT_ADD_PLACE_SPOTS:
      currentAllSpots = [...state.spots];
      return { ...state, spots: [...currentAllSpots, action.data] };

    case HOT_SET_ACTIVE:
      return { ...state, editSpotId: action.data};

    case HOT_ADD_PANORAMA_SPOT:
      currentAllSpots = [...state.spots];
      const index = currentAllSpots.findIndex((it) => it.panoramaId === action.data.panoramaId);
      if (index >= 0) {
        currentAllSpots[index].hotSpotsData.push(action.data.spot);
        return { ...state, spots: [...currentAllSpots] };
      } else {
        currentPanoramaSpots = { panoramaId: action.data.panoramaId, hotSpotsData: [ action.data.spot ]};
        return { ...state, spots: [...currentAllSpots, currentPanoramaSpots] };
      }

    case HOT_SET_PANORAMA_VIEWPORT:
      currentAllSpots = [...state.spots];
      const index1 = currentAllSpots.findIndex((it) => it.panoramaId === action.data.panoramaId);
      if (index1 >= 0) {
        const panorama = currentAllSpots[index1];
        const newPanorama = { ...panorama, viewport: action.data.viewport};
        currentAllSpots.splice(index1, 1, newPanorama) // replace
        return { ...state, spots: [...currentAllSpots] };
      } else {
        const newPanorama = { panoramaId: action.data.panoramaId, viewport: action.data.viewport, hotSpotsData: []};
        return { ...state, spots: [...currentAllSpots, newPanorama] };
      }
      
    case HOT_REMOVE_PLACE_SPOTS:
      currentPlaceSpots = state.spots.filter((it) => it.panoramaId !== action.data.panoramaId);
      return { ...state, spots: currentPlaceSpots };
      
    case HOT_REMOVE_PANORAMA_SPOT:
      currentPlaceSpots = state.spots.filter((it) => it.panoramaId !== action.data.panoramaId);
      updatedPanoramaSpots = state.spots.find((it) => it.panoramaId === action.data.panoramaId);
      const newPanoramaSpots = updatedPanoramaSpots.hotSpotsData.filter((it) => it.id !== action.data.id);
      return { ...state, spots: [ ...currentPlaceSpots, {...updatedPanoramaSpots, hotSpotsData: newPanoramaSpots}] };
        
    case HOT_CLEAR_PANORAMA_VIEWPORT:
      currentAllSpots = [...state.spots];
      const index2 = currentAllSpots.findIndex((it) => it.panoramaId === action.data);
      if (index2 >= 0) {
        const panorama = currentAllSpots[index2]
        const newPanorama = { ...panorama, viewport: null};
        currentAllSpots.splice(index2, 1, newPanorama) // replace
      } 
      return { ...state, spots: [...currentAllSpots] };
      
    case HOT_UPDATE_PLACE_SPOTS:
      currentPlaceSpots = state.spots.filter((it) => it.panoramaId !== action.data.panoramaId);
      return { ...state, spots: [ ...currentPlaceSpots, action.data] };

    case HOT_UPDATE_PANORAMA_SPOT:
      currentPlaceSpots = state.spots.filter((it) => it.panoramaId !== action.data.panoramaId);
      updatedPanoramaSpots = state.spots.find((it) => it.panoramaId === action.data.panoramaId);
      const index3 = updatedPanoramaSpots.hotSpotsData.findIndex((it) => it.id === action.data.spot.id);
      updatedPanoramaSpots.hotSpotsData.splice(index3, 1, action.data.spot) // replace spot
      return { ...state, spots: [ ...currentPlaceSpots, updatedPanoramaSpots] };

    case HOT_CLEAR_ALL_SPOTS:
      return { ...state, spots: [] };

    case ADD_CUSTOM_ICON:
      const newAddedCustomIcon = [...state.customIcons, action.data];
      return { ...state, customIcons: newAddedCustomIcon };

    case REMOVE_CUSTOM_ICON:
      const newCustomIcon = state.customIcons.filter((it) => it.id !== action.data);
      return { ...state, customIcons: newCustomIcon };

    case CLEAR_CUSTOM_ICONS:
      return { ...state, customIcons: [] };
    default:
      return state;
  }
}

export default hotSpotsReducer