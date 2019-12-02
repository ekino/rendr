import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

// Components.
import TextBlock from './TextBlock';
import MainText from '../MainText/MainText';
import HTMLContainer from '../HTMLContainer/HTMLContainer';

describe('<TextBlock>', () => {
  describe('Rendering', () => {
    it('renders the correct content', () => {
        const tree = renderer.create(
          <TextBlock rawHtml={false} contents="Testing" />,
        );
        const text = tree.root.findByType(MainText);
        expect(text.props.children).toEqual('Testing');
    });

    it('renders the correct html', () => {
      const tree = renderer.create(
        <TextBlock rawHtml={true} contents="<div><p>Testing HTML</p></div>" />,
      );
      const text = tree.root.findByType(HTMLContainer);
      expect(text.props.html).toEqual('<div><p>Testing HTML</p></div>');
    });
  });
});
