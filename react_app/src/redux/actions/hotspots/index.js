
import {
  HOT_ADD_PLACE,
  HOT_ADD_PLACE_SPOTS,
  HOT_ADD_PANORAMA_SPOT ,
  HOT_REMOVE_PLACE_SPOTS,
  HOT_REMOVE_PANORAMA_SPOT,
  HOT_UPDATE_PLACE_SPOTS,
  HOT_UPDATE_PANORAMA_SPOT,
  HOT_CLEAR_ALL_SPOTS,
  HOT_SET_ACTIVE,

  ADD_CUSTOM_ICON,
  REMOVE_CUSTOM_ICON,
  CLEAR_CUSTOM_ICONS,
  HOT_SET_PANORAMA_VIEWPORT,
  HOT_CLEAR_PANORAMA_VIEWPORT,
} from '../../../360/utils/Constants.js'

export const addPlaceAllSpots = (allSpots) => {
  return dispatch => dispatch({ type: HOT_ADD_PLACE , data: allSpots });
}
export const addPlaceHotSpots = (panoramaId, spots) => {
  return dispatch => dispatch({ type: HOT_ADD_PLACE_SPOTS , data: { panoramaId: panoramaId, hotSpotsData: spots } });
}
export const addPanoramaHotSpot = (panoramaId, spot) => {
  return dispatch => dispatch({ type: HOT_ADD_PANORAMA_SPOT , data: { panoramaId: panoramaId, spot: spot } });
}
export const clearPlaceHotSpots = (panoramaId) => {
  return dispatch => dispatch({ type: HOT_REMOVE_PLACE_SPOTS , data: panoramaId });
}
export const setPanoramaViewPort = (panoramaId, viewport) => {
  return dispatch => dispatch({ type: HOT_SET_PANORAMA_VIEWPORT , data: { panoramaId: panoramaId, viewport: viewport } });
}
export const clearPanoramaViewPort = (panoramaId) => {
  return dispatch => dispatch({ type: HOT_CLEAR_PANORAMA_VIEWPORT , data: panoramaId });
}
export const removePanoramaHotSpot = (panoramaId, spotId) => {
  return dispatch => dispatch({ type: HOT_REMOVE_PANORAMA_SPOT , data: { panoramaId: panoramaId, id: spotId} });
}
export const updatePlaceHotSpots = (panoramaId, spots) => {
  return dispatch => dispatch({ type: HOT_UPDATE_PLACE_SPOTS , data: { panoramaId: panoramaId, hotSpotsData: spots} });
}
export const updatePanoramaHotSpot = (panoramaId, spot) => {
  return dispatch => dispatch({ type: HOT_UPDATE_PANORAMA_SPOT , data: { panoramaId: panoramaId, spot: spot} })
}
export const clearAllHotSpots = () => {
  return dispatch => dispatch({ type: HOT_CLEAR_ALL_SPOTS })
}
export const addCustomIcon = icon => {
  return dispatch => dispatch({ type: ADD_CUSTOM_ICON , data: icon })
}
export const RemoveCustomIcon = iconID => {
  return dispatch => dispatch({ type: REMOVE_CUSTOM_ICON , data: iconID })
}
export const clearCustomIcons = iconID => {
  return dispatch => dispatch({ type: CLEAR_CUSTOM_ICONS })
}
