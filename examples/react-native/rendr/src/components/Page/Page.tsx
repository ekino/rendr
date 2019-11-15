import React from 'react';

// Components
import TextBlock from '../UI/TextBlock/TextBlock';
import Jumbotron from '../UI/Jumbotron/Jumbotron';

const Component = props => {
    const { type } = props;

    switch (type) {
        case "rendr.text":
            return <TextBlock {...props} />
        case "rendr.jumbotron":
            return <Jumbotron {...props} />
        default:
            return null;
    }
}

const Page = props => {
    const { blocks } = props;

    return blocks
        ? Object(blocks).map((block, i) => {
            return <Component key={i} {...block} />;
        })
        : null;
};
export default Page;