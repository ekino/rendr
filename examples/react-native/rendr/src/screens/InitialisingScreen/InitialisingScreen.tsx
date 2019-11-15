// @flow

// Core modules
import React from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';

console.log(require.main, module);

import { createApiLoader, createChainedLoader } from '@ekino/rendr-loader';

// Utilites
import PageAccessor from "../../utilities/PageAccessor";

// Styles
import styles from './styles';
import { createContext, Page } from '@ekino/rendr-core';

interface Props {
  componentId?: string;
  route?: string;
}

interface State {
  isLoading: boolean;
}

const loader = createChainedLoader([
  createApiLoader(`https://static-api.rande.now.sh/api`),
]);

class InitialisingScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    // load page definition
    const ctx = createContext({url: "/"})

    const page = await loader(ctx, new Page(), () => null);

    console.log('page', page);


    // const loader = createChainedLoader([apiLoader]);
    // console.log('loader', loader);
  }

  render() {
    const {isLoading} = this.state;

    if (isLoading) {
      return (
        <ActivityIndicator style={styles.activityIndicator} color="orange" />
      );
    }
  }
}

function mapStateToProps(state) {
  return {}
  // return {
  //   posts: state.posts,
  // };
}

export default connect(
  mapStateToProps,
  {},
)(InitialisingScreen);
