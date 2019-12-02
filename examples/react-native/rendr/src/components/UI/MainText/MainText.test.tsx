import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

// Components.
import MainText from './MainText';

describe('<MainText>', () => {
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const tree = renderer.create(
        <MainText style={{color: 'black'}}>Testing</MainText>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});