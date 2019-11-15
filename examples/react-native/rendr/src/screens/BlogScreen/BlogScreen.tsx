// @flow

// Core modules
import React, { Fragment } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import { Navigation } from 'react-native-navigation';

// Utilites
import PageAccessor from "../../utilities/PageAccessor";

// Components
import {Page, TextBlock} from '../../components';

// Navigation
import { pushDefaultScreen, pushBlogPostScreen } from '../../navigation';

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

class BlogScreen extends React.Component<Props, State> {
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

    if (route) {
      const data = await PageAccessor.fetchPage(route)
      if (data) {
        this.setState({
          "blocks": data.blocks,
          "isLoading": false,
        });
      }
    } else {
      this.setState({
        "isLoading": false,
      });
    }
  }

  navigationButtonPressed({ buttonId }) {
    switch (buttonId) {
      case 'nav_home_btn': {
        pushDefaultScreen(2);
        break;
      }
      default:
        break;
    }
  }

  render() {
    const { route } = this.props;
    const { isLoading } = this.state;

    if (isLoading) {
      return <ActivityIndicator color="black" />
    }

    return (
      <Fragment>
        <SafeAreaView style={styles.flex}>
          <ScrollView contentInsetAdjustmentBehavior="automatic">
            {!route ? (
              <>
                <TextBlock settings={{
                  message: "Blog"
                }}
                />
                <Text onPress={() => pushBlogPostScreen('post/my-post', 'Post')}>A Blog Post</Text>
              </>
            ) : <Page {...this.state} />}
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default BlogScreen;
