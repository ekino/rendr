// Core modules.
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
const realWidth = height > width ? width : height;
const deviceBaseWidth = 375;

const vw = size => {
  return Math.ceil((size * realWidth) / deviceBaseWidth);
};

export default vw;
