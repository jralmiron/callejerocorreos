// ChangeMapView.js
import { useMap } from "react-leaflet";

const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export default ChangeMapView;
