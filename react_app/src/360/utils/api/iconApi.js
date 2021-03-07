import axios from "axios";
import {
  addCustomIcon,
  clearCustomIcons,
} from '../../../redux/actions/hotspots'

export const getCustomIcon = (placeId) => dispatch => {
  dispatch(clearCustomIcons());
  axios
    .get(`/api/icons/${placeId}`)
    .then((res) => {
      console.log('icons information => ', res.data);
      const { icons } = res.data
      icons.map((icon) => {
        dispatch(addCustomIcon(icon));
      })
    })
    .catch((error) => {
      // showAlert({
      //   msg: `Dear Admin add tour `,
      //   type: "success",
      //   show: true,
      // });
      //history.push("/");
      console.log(error);
    });

};

