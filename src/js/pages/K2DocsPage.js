import React from "react";
import Icon from "../components/Icon";
import FieldInput from "#SRC/js/components/form/FieldInput";
import ReactMarkdown from "react-markdown"
import fetch from 'isomorphic-fetch'
import Page from "../components/Page";

class K2DocsPage extends React.Component {

  constructor() {
    super()
    this.state = {
      content: "loading..."
    }
  }

  getContent() {
    var checkStatus = response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
      }
    }
    fetch("http://192.168.131.3:31080/DCOS-Manuals.markdown", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(checkStatus)
      .then(result => {
        return result.text()
      })
      .then(text => {
        this.setState({
          content: text
        })
      })
      .catch(error=>{
        console.error(error);
        this.setState({
          content: "error loading doc http://192.168.131.3:31080/DCOS-Manuals.markdown"
        })
      })
  }

  componentDidMount() {
    this.getContent()
  }

  render() {
    return (
      <Page>
        {/*<div style={{flex: 1}}>*/}
          <div className="panel-grid row">
            {/*<div className="column-12 column-small-6 column-large-4">*/}
              <ReactMarkdown source={this.state.content}/>
            {/*</div>*/}
          </div>
        {/*</div>*/}
      </Page>
    )

  }
}

K2DocsPage.routeConfig = {
  label: "Docs",
  icon: <Icon id="gear-inverse" size="small" family="product" />,
  matches: /^\/k2docs/
};

module.exports = K2DocsPage;
