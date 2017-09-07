import React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import Service from "../../structs/Service";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";
import { getDisplayValue } from "../../utils/ServiceConfigDisplayUtil";

const METHODS_TO_BIND = [];

class ServiceConnectionContainer extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getProtocolValue(portDefinition) {
    let protocol = portDefinition.protocol || "";
    protocol = protocol.replace(/,\s*/g, ", ");

    return (
      <ConfigurationMapValue>{getDisplayValue(protocol)}</ConfigurationMapValue>
    );
  }

  getHostPortValue(portDefinition) {
    const service = this.props.service;
    const hostPort = service.requirePorts
      ? getDisplayValue(portDefinition.hostPort)
      : "Auto Assigned";

    return <ConfigurationMapValue>{hostPort}</ConfigurationMapValue>;
  }

  getLoadBalancedAddressValue(portDefinition) {
    const { port, labels } = portDefinition;
    const vipLabel = ServiceConfigUtil.findVIPLabel(labels);

    if (vipLabel) {
      return (
        <ConfigurationMapValue>
          {ServiceConfigUtil.buildHostNameFromVipLabel(labels[vipLabel], port)}
        </ConfigurationMapValue>
      );
    }

    return <ConfigurationMapValue><em>Not Enabled</em></ConfigurationMapValue>;
  }

  getPortDefinitionDetails(portDefinition) {
    return (
      <div>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Protocol
          </ConfigurationMapLabel>
          {this.getProtocolValue(portDefinition)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Container Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getDisplayValue(portDefinition.containerPort)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Host Port
          </ConfigurationMapLabel>
          {this.getHostPortValue(portDefinition)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Service Port
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getDisplayValue(portDefinition.servicePort)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Load Balanced Address
          </ConfigurationMapLabel>
          {this.getLoadBalancedAddressValue(portDefinition)}
        </ConfigurationMapRow>
      </div>
    );
  }

  getPortDefinitions(portDefinitions) {
    return portDefinitions.map(portDefinition => {
      return (
        <ConfigurationMapSection>
          <ConfigurationMapHeading>
            {portDefinition.name}
          </ConfigurationMapHeading>
          {this.getPortDefinitionDetails(portDefinition)}
        </ConfigurationMapSection>
      );
    });
  }

  render() {
    const portDefinitions =
      this.props.service.portDefinitions ||
      this.props.service.container.portMappings;

    if (!portDefinitions || portDefinitions.length === 0) {
      return (
        <AlertPanel>
          <AlertPanelHeader>No endpoints detected</AlertPanelHeader>
          <p className="flush-bottom">
            There a currently no endpoints found for your service.
          </p>
        </AlertPanel>
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getPortDefinitions(portDefinitions)}
        </ConfigurationMap>
      </div>
    );
  }
}

ServiceConnectionContainer.propTypes = {
  onEditClick: React.PropTypes.func,
  errors: React.PropTypes.array,
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceConnectionContainer;
