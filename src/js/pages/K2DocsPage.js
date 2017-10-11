import React from "react";
import Icon from "../components/Icon";
import FieldInput from "#SRC/js/components/form/FieldInput";
import ReactMarkdown from "react-markdown"
import Markdown from "react-remarkable"
import fetch from 'isomorphic-fetch'
import Page from "../components/Page";

var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

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
        <div className="iframe-page-container">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            id="fileserver-iframe"
            src="http://192.168.131.3:31080/k2docspage.html"
          />
        </div>
        {/*<div className="panel-grid row">*/}
          {/*<Markdown options={{html: true}} source={this.state.content}/>*/}
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
