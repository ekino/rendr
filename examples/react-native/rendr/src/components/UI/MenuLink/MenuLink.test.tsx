import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

// Components.
import MenuLink from './MenuLink';
import MainText from '../MainText/MainText';

describe('<MenuLink>', () => {
    const inst = active => renderer.create(
      <MenuLink
        key="key"
        title="Menu Title"
        active={active}
        onPress={() => alert('onPress')}
      />,
    );

    const tree = inst(true).toJSON();
    const active = inst(true).root.findByType(MainText);
    const inactive = inst(false).root.findByType(MainText);

    it('does not render the active attribute by default', () => {
      expect(inactive.props.testId).toBe(null);
    });

    it('renders the active attribute if current', () => {
      expect(active.props.testId).toBe('active');
    });

    it('renders the correct display text', () => {
        expect(active.props.children).toEqual('Menu Title');
    });
});