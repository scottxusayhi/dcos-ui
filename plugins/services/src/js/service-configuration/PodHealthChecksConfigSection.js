import React from 'react';

import ConfigurationMapTable from '../components/ConfigurationMapTable';
import DurationValue from '../components/ConfigurationMapDurationValue';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import ValueWithDefault from '../components/ConfigurationMapValueWithDefault';

const COMMON_COLUMNS = [
  {
    heading: 'Grace Period',
    prop: 'gracePeriod',
    render(prop, row) {
      return (
        <DurationValue
          units="sec"
          value={row[prop]} />
      );
    }
  },
  {
    heading: 'Interval',
    prop: 'interval',
    render(prop, row) {
      return (
        <DurationValue
          units="sec"
          value={row[prop]} />
      );
    }
  },
  {
    heading: 'Timeout',
    prop: 'timeout',
    render(prop, row) {
      return (
        <DurationValue
          units="sec"
          value={row[prop]} />
      );
    }
  },
  {
    heading: 'Max Failures',
    prop: 'maxFailures'
  },
  {
    heading: 'Container',
    prop: 'container'
  }
];

class PodHealthChecksConfigSection extends React.Component {
  getCommandColumns() {
    return [
      {
        heading: 'Command',
        prop: 'command'
      }
    ].concat(COMMON_COLUMNS);
  }

  getDefaultEndpointsColumns() {
    return {
      hideIfEmpty: true,
      render(prop, row) {
        // We use a default <Value/> renderer in order to render
        // all elements as <Div/>s. Otherwise the booleans look
        // funny.
        return <ValueWithDefault value={row[prop]} />;
      }
    };
  }

  getEndpointsColumns() {
    return [
      {
        heading: 'Service Endpoint',
        prop: 'endpoint'
      },
      {
        heading: 'Proto',
        prop: 'protocol'
      },
      {
        heading: 'Path',
        prop: 'path'
      }
    ].concat(COMMON_COLUMNS);
  }

  render() {
    let {containers=[]} = this.props.appConfig;
    let healthChecks = containers.reduce((memo, container) => {
      let {healthCheck} = container;

      if (!healthCheck) {
        return memo;
      }

      let spec = {
        interval: healthCheck.intervalSeconds,
        gracePeriod: healthCheck.gracePeriodSeconds,
        maxFailures: healthCheck.maxConsecutiveFailures,
        timeout: healthCheck.timeoutSeconds,
        container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container)
      };

      if (healthCheck.exec != null) {
        spec.command = healthCheck.exec.command;
        memo.command.push(spec);
      }

      if (healthCheck.http != null) {
        spec.endpoint = healthCheck.http.endpoint;
        spec.path = healthCheck.http.path;
        spec.protocol = healthCheck.http.scheme || 'http';
        memo.endpoints.push(spec);
      }

      if (healthCheck.tcp != null) {
        spec.endpoint = healthCheck.tcp.endpoint;
        spec.protocol = 'tcp';
        memo.endpoints.push(spec);
      }

      return memo;
    }, {endpoints: [], command: []});

    if (!healthChecks.endpoints.length && !healthChecks.command.length) {
      return null;
    }

    return (
      <div>
        <Heading level={1}>Health Checks</Heading>

        {(healthChecks.endpoints.length !== 0) && (
          <div>
            <Heading level={2}>Service Endpoint Health Checks</Heading>
            <Section key="pod-general-section">
              <ConfigurationMapTable
                className="table table-simple table-break-word flush-bottom"
                columnDefaults={this.getDefaultEndpointsColumns()}
                columns={this.getEndpointsColumns()}
                data={healthChecks.endpoints} />
            </Section>
          </div>
        )}

        {(healthChecks.command.length !== 0) && (
          <div>
            <Heading level={2}>Command Health Checks</Heading>
            <Section key="pod-general-section">
              <ConfigurationMapTable
                className="table table-simple table-break-word flush-bottom"
                columnDefaults={{
                  hideIfEmpty: true
                }}
                columns={this.getCommandColumns()}
                data={healthChecks.command} />
            </Section>
          </div>
        )}

      </div>
    );
  }
};

PodHealthChecksConfigSection.defaultProps = {
  appConfig: {}
};

PodHealthChecksConfigSection.propTypes = {
  appConfig: React.PropTypes.object
};

module.exports = PodHealthChecksConfigSection;
