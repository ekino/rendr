// @flow

// Core modules
import React, { Fragment } from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

// Utilites
import PageAccessor from "../../utilities/PageAccessor";

// Components
import { Page } from '../../components';

// Styles
import styles from './styles';

interface Props {
  componentId?: string;
  route?: string;
}

interface State {
  blocks: object;
  isLoading: boolean;
}

class DefaultScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      blocks: [],
      isLoading: true,
    }
  }

  async componentDidMount() {
    const { route = "" } = this.props;

    const data = await PageAccessor.fetchPage(route)
    if(data) {
      this.setState({ 
        "blocks": data.blocks, 
        "isLoading": false 
      })
    }
  }

  render() {
    const { isLoading } = this.state;

    if (isLoading) {
      return <ActivityIndicator color="black" />
    }

    return (
      <Fragment>
        <SafeAreaView style={styles.flex}>
          <ScrollView contentInsetAdjustmentBehavior="automatic">
            <Page {...this.state} />
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default DefaultScreen;
