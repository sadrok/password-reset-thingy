import React, { Component } from 'react';
import { Header, Form, Input, Icon, Segment, Message, Dimmer } from 'semantic-ui-react';
import zxcvbn from 'zxcvbn';
import './App.css';

const passwordStrength = (password) => {
  const result = zxcvbn(password);
  return {
    strong: result.score >= 2,
    feedback: result.feedback
  };
};

const getParams = (search) => {
  const hashes = search.slice(search.indexOf('?') + 1).split('&')
  let params = {};
  hashes.map((hash) => {
    const [key, val] = hash.split('=');
    params[key] = decodeURIComponent(val);
  });
  return params;
};

class App extends Component {
  state = {
    error_password: false, error_verify: false,
    loading: false,
    success: false,
    reset_hash: "",
    username: "retail@takealot.com"
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  componentDidMount = () => {
    const params = getParams(window.location.toString());
    const reset_hash = params.reset_hash;
    this.setState({ reset_hash, reset_hash_provided: !!reset_hash })
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { password, password_verify, reset_hash } = this.state;

    if (!reset_hash) {
      this.setState({
        error: true,
        error_message: "Something went wrong. The reset hash wasn't specified"
      });
      return;
    }

    if (!password || !password_verify) {
      this.setState({
        error_password: !password,
        error_verify: !password_verify,
        error_message: "Please enter a passwords"
      });
      return;
    }

    if (password !== password_verify) {
      this.setState({
        error_verify: true,
        error_message: "The passwords do not match"
      });
      return;
    }

    const { strong, feedback } = passwordStrength(password);
    if (!strong) {
      this.setState({
        error: true,
        error_message: <div>Your password isn't strong enough {feedback.warning ? " - " + feedback.warning : null}
          {feedback.suggestions ? <ul>
            {feedback.suggestions.map((s,i) => <li key={i}>{s}</li>)}
          </ul> : null}
        </div>
      });
      return;
    }

    this.setState({ loading: true, error: false });
    setTimeout(() => {
      this.setState({
        loading: false, success: true
      })
    }, 3000)
  };

  handleSubmitHash = () => {
    const { reset_hash } = this.state;
    if(reset_hash) {
      this.setState({reset_hash_provided: true});
    }
  };

  render() {
    const {
      username,
      reset_hash, reset_hash_provided,
      error, error_password, error_verify,
      success,
      loading,
      error_message
    } = this.state;
    return (
      <div className="App">
        <Header icon dividing textAlign="center" style={{ paddingTop: "1em" }}><Icon name="key" />
          <Header.Content>New password for {username}</Header.Content></Header>

        <Dimmer.Dimmable>
          <Dimmer active={!reset_hash_provided}>
            <Form inverted onSubmit={this.handleSubmitHash} style={{ padding: "2em" }}>
              <Form.Input required name="reset_hash" type="text" value={reset_hash}
                          label="Copy and paste the provided password hash in here" onChange={this.handleChange} />
              <Form.Button type="submit" content="Use hash" fluid />
            </Form>
          </Dimmer>
          <Form loading={loading} error={error || error_password || error_verify} success={success}
                onSubmit={this.handleSubmit} style={{ padding: "2em" }}>
            <Message success header="Success!" content="Your password was successfully updated!" />
            <Message error content={error_message} />
            {!success ?
              <Form.Group widths="equal">
                <Form.Input error={error_password} required name="password" type="password"
                            label="Enter your password" onChange={this.handleChange} />
                <Form.Input error={error_verify} required name="password_verify" type="password"
                            label="Repeat your password" onChange={this.handleChange} />
                <Form.Button type="submit" content="Save new Password" fluid />
              </Form.Group> : null}
          </Form>
        </Dimmer.Dimmable>
      </div>
    );
  }
}

export default App;
