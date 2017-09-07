import React from "react";

import Loader from "#SRC/js/components/Loader";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Icon from "#SRC/js/components/Icon";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

import SDKEndpointActions from "../../events/SDKEndpointActions";
import SDKEndpointStore from "../../stores/SDKEndpointStore";

const METHODS_TO_BIND = [];

class SDKServiceConnectionContainer extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SDKEndpointActions.fetchEndpoints(this.props.service.getId());
  }

  getEndpointAddress(endpoint) {
    return (
      <ConfigurationMapValue> {endpoint.getAddress()} </ConfigurationMapValue>
    );
  }

  getEndpointDNS(endpoint) {
    return <ConfigurationMapValue> {endpoint.getDns()} </ConfigurationMapValue>;
  }

  getEndpointVIP(endpoint) {
    return <ConfigurationMapValue> {endpoint.getVip()} </ConfigurationMapValue>;
  }

  getEndpoint(endpoint) {
    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          {endpoint.getEndpointName()}
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Address
          </ConfigurationMapLabel>
          {this.getEndpointAddress(endpoint)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            DNS
          </ConfigurationMapLabel>
          {this.getEndpointDNS(endpoint)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            VIP
          </ConfigurationMapLabel>
          {this.getEndpointVIP(endpoint)}
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getFileEndpoint(endpoint) {
    return (
      <ConfigurationMapRow>
        <ConfigurationMapLabel>
          {endpoint.getEndpointName()}
        </ConfigurationMapLabel>
        <ConfigurationMapValue>
          <a
            className="active endpoint-download"
            download={endpoint.getEndpointName()}
            href={`data:text/plain;content-disposition=attachment;filename=${endpoint.getEndpointName()};charset=utf-8,${encodeURIComponent(endpoint.getEndpointData())}`}
          >
            <span>
              <Icon
                id="download"
                className="endpoint-download-icon"
                size="mini"
              />
              {" "}
              Download
            </span>
          </a>
        </ConfigurationMapValue>
      </ConfigurationMapRow>
    );
  }

  getJSONEndpoints(endpoints) {
    const jsonEndpoints = endpoints.filter(endpoint => {
      return endpoint.isJSON();
    });

    if (!jsonEndpoints || jsonEndpoints.length === 0) {
      return null;
    }

    return jsonEndpoints.map(endpoint => {
      return this.getEndpoint(endpoint);
    });
  }

  getFileEndpoints(endpoints) {
    const fileEndpoints = endpoints.filter(endpoint => {
      return !endpoint.isJSON();
    });

    if (!fileEndpoints || fileEndpoints.length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Files
        </ConfigurationMapHeading>
        {endpoints.map(endpoint => {
          return this.getFileEndpoint(endpoint);
        })}
      </ConfigurationMapSection>
    );
  }

  render() {
    const sdkEndpointService = SDKEndpointStore.getSDKEndpointService(
      this.props.service.getId()
    );

    if (!sdkEndpointService) {
      return <Loader />;
    }

    if (sdkEndpointService.error) {
      return (
        <AlertPanel>
          <AlertPanelHeader>
            Endpoints not found
          </AlertPanelHeader>
          <p className="flush-bottom">
            {sdkEndpointService.error}
          </p>
        </AlertPanel>
      );
    }

    if (
      sdkEndpointService.totalLoadingEndpointsCount === -1 ||
      sdkEndpointService.totalLoadingEndpointsCount !==
        sdkEndpointService.endpoints.length
    ) {
      return <Loader />;
    }

    if (
      !sdkEndpointService.endpoints ||
      sdkEndpointService.endpoints.length === 0
    ) {
      return (
        <AlertPanel>
          <AlertPanelHeader>No endpoints detected</AlertPanelHeader>
          <p className="flush-bottom">
            There are currently no endpoints found for your service.
          </p>
        </AlertPanel>
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getJSONEndpoints(sdkEndpointService.endpoints)}
          {this.getFileEndpoints(sdkEndpointService.endpoints)}
        </ConfigurationMap>
      </div>
    );
  }
}

module.exports = SDKServiceConnectionContainer;
