import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

// Components.
import Jumbotron from './Jumbotron';
import MainText from '../MainText/MainText';

describe('<Jumbotron>', () => {
  const inst = (title = 'title', contents = 'contents') =>
    renderer.create(<Jumbotron title={title} contents={contents} />);

  let tree = inst().toJSON();

  it('renders both title and contents', () => {
    expect(tree.children.length).toBe(2);
  });

  it('render only the title', () => {
    tree = inst('title', null).toJSON();
    expect(tree.children.length).toBe(1);
  });

  it('render only the contents', () => {
    tree = inst(null, 'contents').toJSON();
    expect(tree.children.length).toBe(1);
  });
});
