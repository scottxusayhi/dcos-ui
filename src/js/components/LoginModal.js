import React from "react";
import { connect } from "react-redux";
import { Modal } from "reactjs-components";
import fetch from 'isomorphic-fetch'
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import { RequestUtil } from "mesosphere-shared-reactjs";
import Config from "#SRC/js/config/Config";

function buildURI(path) {
  return `${Config.rootUrl}${Config.marathonAPIPrefix}${path}`;
}

var LoginModal = React.createClass({
  getInitialState() {
    return {
      userInput: "",
      userInputError: ""
    };
  },

  createGroup(group) {
    var checkStatus = response => {
      if (response.status===409 || response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
      }
    }
    console.log(buildURI("/groups"), group);
    fetch(buildURI("/groups"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: "/"+group })
    })
      .then(checkStatus)
      .then(result => {
        return result.json()
      })
      .then(json=>{
        this.props.groupExists();
      })
      .catch(error=>{
        console.error(error);
        var p = error.response.json();
        p.then(json=> {
          console.log(json)
        })
      })
  },

  handleFakeLogin() {
    var user = String.trim(this.state.userInput);
    var regex = new RegExp("^[A-Za-z0-9]+$");
    if (regex.test(user)) {
      console.log("should login ", user);
      this.props.logInEvent(user);
      this.createGroup(user);
      this.setState({
        userInputError: ""
      })
    } else {
      this.setState({
        userInputError: "user name can only contains A-Z a-z and 0-9"
      })
    }
  },

  isLoggedIn() {
    if (this.props.userCookie !== "" && this.props.groupExists) {
      return true;
    }

    return false;
  },

  componentDidMount() {
    var cookie = readCookie("fake_auth_user");
    if (cookie) {
      cookie = String.trim(cookie);
      this.props.hasCookie(cookie);
    }
  },

  render() {
    // console.log("render LoginModal props=", this.props);

    return (
      <div>
        <Modal open={this.props.fakeAuth.userCookie==="" || !this.props.fakeAuth.groupExists} classNames="modal modal-mylogin">
          <FieldInput
            placeholder="Input user name ..."
            value={this.state.userInput}
            onChange={e => this.setState({ userInput: e.target.value })}
          />
          <FieldError>{this.state.userInputError}</FieldError>
          <button
            className="button button-primary button-login"
            onClick={() => { this.handleFakeLogin(); }}
            width="100%"
          >
            Login
          </button>
        </Modal>
      </div>
    );
  }
});

function createCookie(name, value, days) {
  value = String.trim(value);
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
}

function eraseCookie(name) {
  createCookie(name, "", -1);
}

// actions
function logOutEvent() {
  return {
    type: "FAKE_AUTH_LOG_OUT"
  };
}

function logInEvent(user) {
  return {
    type: "FAKE_AUTH_LOG_IN",
    user: user
  };
}

function groupExists() {
  return {
    type: "FAKE_AUTH_GROUP_EXISTS"
  };
}

function hasCookie(user) {
  return {
    type: "FAKE_AUTH_HAS_COOKIE",
    user: user
  };
}

// reducer
const initFakeAuth = {
  userCookie: "",
  groupExists: false
}

function fakeAuth(state=initFakeAuth, action) {
  switch (action.type) {
    case "FAKE_AUTH_LOG_IN":
      createCookie("fake_auth_user", action.user, 1);

      return Object.assign({}, state, {
        userCookie: action.user
      })
    case "FAKE_AUTH_LOG_OUT":
      eraseCookie("fake_auth_user");

      return Object.assign({}, state, {
        userCookie: ""
      })
    case "FAKE_AUTH_GROUP_EXISTS":
      return Object.assign({}, state, {
        groupExists: true
      })
    case "FAKE_AUTH_HAS_COOKIE":
      return Object.assign({}, state, {
        userCookie: action.user,
        groupExists: true,
      })
    default:
      return state;
  }
}

// subscribe
const mapStateToProps = state => {
  return {
    fakeAuth: state.fakeAuth
  };
}

// dispatch actions
const mapDispatchToProps = dispatch => {
  return {
    logInEvent: (user) => {
      dispatch(logInEvent(user));
    },
    logOutEvent: () => {
      dispatch(logOutEvent());
    },
    groupExists: () => {
      dispatch(groupExists());
    },
    hasCookie: (user) => {
      dispatch(hasCookie(user));
    }
  };
}

// export default LoginModal;
// export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
LoginModal = connect(mapStateToProps, mapDispatchToProps)(LoginModal);
module.exports = {
  LoginModal,
  fakeAuth,
  logOutEvent,
  logInEvent,
  groupExists,
  hasCookie
};
