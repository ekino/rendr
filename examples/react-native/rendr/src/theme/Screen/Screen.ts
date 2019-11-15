import { Dimensions, Platform, StatusBar } from 'react-native';

const { height: viewportHeight } = Dimensions.get("window");

const deviceH = Dimensions.get("screen").height;
const bottomNavBarH = deviceH - viewportHeight;
const screenH =
    bottomNavBarH === 0
        ? viewportHeight - (Platform.OS === "android" ? StatusBar.currentHeight : 0)
        : viewportHeight - (bottomNavBarH - StatusBar.currentHeight);

export const MIN_VIEWPORT_HEIGHT = screenH;
