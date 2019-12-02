// Core modules.
import React from 'react';
import {Animated, TouchableWithoutFeedback, View} from 'react-native';

// Navigation.
import {toggleLeftDrawer} from '../../../navigation';

// Styles.
import styles from './styles';

interface Props {}

interface State {
  offset: any;
}

class Burger extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      offset: new Animated.Value(0),
    };
  }

  restart = () => {
    this.setState({
      offset: new Animated.Value(0),
    });
  };

  render() {
    const {offset} = this.state;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          toggleLeftDrawer();

          Animated.timing(offset, {
            duration: 600,
            toValue: 1,
          }).start(this.restart);
        }}>
        <View style={styles.bun}>
          {[...Array(3)].map((_e, i) => (
            <Animated.View
              key={i}
              style={[
                styles.patty,
                i === 1 && {
                  left: offset.interpolate({
                    inputRange: [0, 0.35, 0.8, 1],
                    outputRange: [0, 18, -9, 0],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Burger;
