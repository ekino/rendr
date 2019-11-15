// @flow

// Core modules
import React, { Fragment } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Navigation } from 'react-native-navigation';

// Navigation.
import { pushDefaultScreen } from '../../navigation';

// Utilites
import PageAccessor from "../../utilities/PageAccessor";

// Components.
import { Page } from '../../components';

// Styles.
import styles from './styles';

interface Props {
  componentId?: string;
  route?: string;
}

interface State {
  blocks: object;
  isLoading: boolean;
}

class PageScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      blocks: [],
      isLoading: true,
    }

    Navigation.events().bindComponent(this);
  }

  async componentDidMount() {
    const { route = "" } = this.props;

    const data = await PageAccessor.fetchPage(route)
    if (data) {
      this.setState({
        "blocks": data.blocks,
        "isLoading": false
      })
    }
  }

  navigationButtonPressed({ buttonId }) {
    switch (buttonId) {
      case 'nav_home_btn': {
        pushDefaultScreen();
        break;
      }
      default:
        break;
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

export default PageScreen;
