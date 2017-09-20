import React from "react";
import Icon from "../components/Icon";
import Page from "../components/Page";

var FileServer = React.createClass({
  render() {
    return (
      <Page>
        {/*<div className="iframe-page-container" style={{flex: 1}}>*/}
        <div className="iframe-page-container">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            id="fileserver-iframe"
            src="http://192.168.131.3:31080/"
          />
        </div>
      </Page>
    );
  }
});

FileServer.routeConfig = {
  label: "File Manager",
  icon: <Icon id="services-inverse" size="small" family="product" />,
  matches: /^\/fileserver/
};

module.exports = FileServer;
