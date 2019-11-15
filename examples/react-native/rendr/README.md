```
import { action$fetchPosts } from '../../redux/posts/posts.actions';

interface Props {
  componentId?: string;
  action$fetchPosts: any;
  posts: any;
  route?: string;
}


...

this.props.action$fetchPosts();

...


function mapStateToProps(state) {
  return {
    posts: state.posts,
  };
}

export default connect(
  mapStateToProps,
  {action$fetchPosts},
)(InitialisingScreen);

```