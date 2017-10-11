import React from "react";

import CompositeState from "#SRC/js/structs/CompositeState";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import Units from "#SRC/js/utils/Units";

import MarathonTaskDetailsList from "../../components/MarathonTaskDetailsList";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";
import TaskEndpointsList from "../../components/TaskEndpointsList";

import fetch from 'isomorphic-fetch'

class TaskDetailsTab extends React.Component {

  constructor() {
    super();
    this.webDockerUrl = "http://web-docker.ops.marathon.slave.mesos:9000";
    this.dockerPort = "4243";
    this.state = {
      node: null,
      container: null,
      pty: null
    }
  }

  componentDidMount() {
    console.log("docker api mount");
    const {task} = this.props;
    // get container id
    const node = CompositeState.getNodesList()
      .filter({ ids: [task.slave_id] })
      .last();
    if (node != null) {
      let dockerHost = node.getHostName()+":"+this.dockerPort;
      let filters = {
        label: ["MESOS_TASK_ID=" + task.id]
      };
      let url = "http://" + dockerHost + "/v1.24/containers/json?filters=" + JSON.stringify(filters);
      console.log("docker api url ", url);

    let checkStatus = response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
      }
    };

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(checkStatus)
      .then(result => {
        return result.json()
      })
      .then(json => {
        console.log("bash-in-docker: get docker container ", json);
        this.setState({
          node: dockerHost,
          container: json[0].Id
        });
        createPtySession(dockerHost, json[0].Id)
      })
      .catch(error=>{
        console.error("bash-in-docker: get docker container error");
      })
    }

    let createPtySession = (dockerHost, containerId) => {
        // create pty session in web-docker
      let url = this.webDockerUrl+"/api/v1/cmds/bash-in-docker";
      let bashInDockerBody = {
        dockerHost: dockerHost,
        containerId: containerId
      };

      let checkStatus = response => {
        if (response.status === 201) {
          return response
        } else {
          var error = new Error(response.statusText);
          error.response = response;
          throw error
        }
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bashInDockerBody)
      })
        .then(checkStatus)
        .then(result => {
          return result.json()
        })
        .then(json => {
          console.log("bash-in-docker: create pty", json);
          this.setState({
            pty: json.pid
          })
        })
        .catch(error=>{
          console.error("bash-in-docker: create pty error ");
        })
    }
  }

  getContainerInfo(task) {
    if (task == null || !task.container) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Container Configuration
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <pre className="flex-item-grow-1 mute prettyprint flush-bottom">
            {JSON.stringify(task.container, null, 4)}
          </pre>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getMesosTaskDetails(mesosTask) {
    if (mesosTask == null) {
      return null;
    }

    const services = CompositeState.getServiceList();
    const service = services.filter({ ids: [mesosTask.framework_id] }).last();
    const node = CompositeState.getNodesList()
      .filter({ ids: [mesosTask.slave_id] })
      .last();
    const sandBoxPath = TaskDirectoryStore.get("sandBoxPath");

    let serviceRow = null;
    let nodeRow = null;
    let sandBoxRow = null;
    let resourceRows = null;
    let containerRow = null;

    if (mesosTask.resources != null) {
      const resourceLabels = ResourcesUtil.getResourceLabels();

      resourceRows = ResourcesUtil.getDefaultResources().map(function(
        resource,
        index
      ) {
        return (
          <ConfigurationMapRow key={index}>
            <ConfigurationMapLabel>
              {resourceLabels[resource]}
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {Units.formatResource(resource, mesosTask.resources[resource])}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        );
      });
    }

    if (service != null) {
      serviceRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Service
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {service.name} ({service.id})
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    if (node != null) {
      nodeRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Node
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {node.getHostName()} ({node.getID()})
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    function openInNewWindow(url) {
      var win = window.open(url, 'newwin', 'height=900px,width=700px');
      if (win!=null) {
        win.focus();
      }
    }

    if (this.state.container) {
      let containerId = this.state.container.substring(0, 12);
      if (this.state.pty) {
        containerId = (
          <a onClick={()=>{openInNewWindow(this.webDockerUrl+"/"+this.state.pty+"/pty")}}>{containerId}</a>
        )
      }
      containerRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Container
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {containerId}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        )
    }

    if (sandBoxPath) {
      sandBoxRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Sandbox Path
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {sandBoxPath}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Configuration
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Task ID
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {mesosTask.id}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        {serviceRow}
        {nodeRow}
        {containerRow}
        {sandBoxRow}
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Endpoints
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            <TaskEndpointsList task={mesosTask} node={node} />
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        {resourceRows}
      </ConfigurationMapSection>
    );
  }

  getMesosTaskLabels(mesosTask) {
    if (mesosTask == null) {
      return null;
    }

    let labelRows = null;

    if (mesosTask.labels) {
      labelRows = mesosTask.labels.map(function({ key, value }) {
        return (
          <ConfigurationMapRow key={key}>
            <ConfigurationMapLabel>
              {key}
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {value}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        );
      });
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Labels
        </ConfigurationMapHeading>
        {labelRows}
      </ConfigurationMapSection>
    );
  }

  render() {
    const { task } = this.props;

    if (!MesosSummaryStore.get("statesProcessed")) {
      return <Loader />;
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getMesosTaskDetails(task)}
          {this.getMesosTaskLabels(task)}
          <MarathonTaskDetailsList taskID={task.id} />
          {this.getContainerInfo(task)}
        </ConfigurationMap>
      </div>
    );
  }
}

TaskDetailsTab.propTypes = {
  task: React.PropTypes.object
};

TaskDetailsTab.defaultProps = {
  task: {}
};

module.exports = TaskDetailsTab;
