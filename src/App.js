import React, { Component } from 'react';
import { Header, Form, Icon, Message, Dimmer } from 'semantic-ui-react';
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

const isEmail = (potential) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return potential.match(emailRegex);
};

class App extends Component {
  state = {
    error_password: false, error_verify: false,
    loading: false,
    success: false,
    reset_hash: "",
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  componentDidMount = () => {
    const params = getParams(window.location.toString());
    const reset_hash = params.reset_hash;
    const email = params.email || "";
    this.setState({
      email,
      reset_hash,
      reset_hash_provided: !!reset_hash })
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { email, password, password_verify, reset_hash } = this.state;

    let error_email = false;
    let error_password = false;
    let error_verify = false;
    let error_hash = false;
    let errors = [];

    if (!reset_hash) {
      error_hash = true;
      errors.push("Something went wrong. The reset hash wasn't specified");
    }

    if (!email) {
      error_email = true;
      errors.push("Please enter your login email address");
    }
    else if (!isEmail(email)) {
      error_email = true;
      errors.push("Please enter a valid email address");
    }

    if (!password) {
      error_password = true;
      errors.push("Please provide a password");
    }
    else {
      const { strong, feedback } = passwordStrength(password);
      if (!strong) {
        error_password = true;
        errors.push(<div>Your password isn't strong enough {feedback.warning ? " - " + feedback.warning : null}
          {feedback.suggestions ? <ul>
            {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul> : null}
        </div>)
      }
    }

    if (password && !password_verify) {
      error_verify = true;
      errors.push("Please verify your password");
    }
    else if (password && password_verify && (password !== password_verify)) {
      error_verify = true,
        errors.push("The passwords do not match");
    }

    const error = error_hash || error_verify || error_password || error_email;
    this.setState({
      error,
      error_email,
      error_hash,
      error_password,
      error_verify,
      error_message: errors.map((e, i) => <p key={i}>{e}</p>)
    });
    if (error) {
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
    if (reset_hash) {
      this.setState({ reset_hash_provided: true });
    }
  };

  render() {
    const {
      email,
      reset_hash, reset_hash_provided,
      error, error_password, error_verify, error_email,
      success,
      loading,
      error_message
    } = this.state;
    return (
      <div className="App">
        <Header icon dividing textAlign="center" style={{ paddingTop: "1em" }}><Icon name="key" />
          <Header.Content>Password reset</Header.Content></Header>

        <Dimmer.Dimmable>
          <Dimmer active={!reset_hash_provided}>
            <Form inverted onSubmit={this.handleSubmitHash} style={{ padding: "2em" }}>
              <Form.Input required name="reset_hash" type="text" value={reset_hash}
                          label="Copy and paste the provided password reset hash in here"
                          onChange={this.handleChange} />
              <Form.Button type="submit" content="Use hash" fluid />
            </Form>
          </Dimmer>
          <Form loading={loading} error={error || error_password || error_verify || error_email} success={success}
                onSubmit={this.handleSubmit} style={{ padding: "2em" }}>
            <Message success header="Success!" content="Your password was successfully updated!" />
            <Message error content={error_message} />
            {!success ?
              <Form.Group widths="equal">
                <Form.Input error={error_email} name="email" type="text" value={email}
                            label="Enter your email" onChange={this.handleChange} />
                <Form.Input error={error_password} name="password" type="password"
                            label="Enter your password" onChange={this.handleChange} />
                <Form.Input error={error_verify} name="password_verify" type="password"
                            label="Repeat your password" onChange={this.handleChange} />
              </Form.Group> : null}
            <Form.Button type="submit" content="Save new Password" fluid />
          </Form>
        </Dimmer.Dimmable>
      </div>
    );
  }
}

export default App;
