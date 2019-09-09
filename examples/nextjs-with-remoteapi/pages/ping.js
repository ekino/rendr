export default class Ping extends React.Component {
  static async getInitialProps({ res }) {
    res.statusCode = 403;

    return {};
  }

  render() {
    return <div>this is a ping file, so I send you a pong!!!</div>;
  }
}
