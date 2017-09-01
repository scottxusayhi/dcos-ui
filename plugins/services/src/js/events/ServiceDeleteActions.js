import { RequestUtil } from "mesosphere-shared-reactjs";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import CosmosPackagesActions from "#SRC/js/events/CosmosPackagesActions";
import {
  REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS
} from "#SRC/js/constants/ActionTypes";

import {
  REQUEST_MARATHON_SERVICE_DELETE_ERROR
} from "../constants/ActionTypes";
import MarathonActions from "./MarathonActions";
import Framework from "../structs/Framework";

const onFrameworkDelete = function(action, subscriptionId, resolve, reject) {
  if (action.type === REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS) {
    AppDispatcher.unregister(subscriptionId);
    resolve();

    return;
  }

  if (action.type === REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR) {
    AppDispatcher.unregister(subscriptionId);
    reject(RequestUtil.getErrorFromXHR(action.xhr));

    return;
  }
};

function uninstallFramework(framework) {
  return new Promise(function(resolve, reject) {
    const subscriptionId = AppDispatcher.register(payload => {
      const { action } = payload;
      if (
        action.packageName === framework.getPackageName() &&
        action.appId === framework.getId()
      ) {
        onFrameworkDelete(action, subscriptionId, resolve, reject);
      }
    });
    CosmosPackagesActions.uninstallPackage(
      framework.getPackageName(),
      framework.getId()
    );
  });
}

function deleteFramework(framework) {
  uninstallFramework(framework)
    .then(function() {
      MarathonActions.deleteService(framework);
    })
    .catch(function(error) {
      AppDispatcher.handleServerAction({
        type: REQUEST_MARATHON_SERVICE_DELETE_ERROR,
        data: error
      });
    });
}

const ServiceDeleteActions = {
  // This part is responsible for uninstalling the frameworks before deleting
  // the group. It is disabled for now.
  // deleteGroup(group, force) {
  //   const groupId = group.getId();
  //   const groupFrameworks = "getFrameworks" in group
  //     ? group.getFrameworks()
  //     : [];

  //   if (!groupFrameworks || groupFrameworks.length === 0) {
  //     MarathonActions.deleteGroup(groupId, force);

  //     return;
  //   }

  // const deleteFrameworkPromises = groupFrameworks.map(function(framework) {
  //   return uninstallFramework(framework);
  // });

  // Promise.all(deleteFrameworkPromises)
  //   .then(function() {
  //     MarathonActions.deleteGroup(groupId, force);
  //   })
  //   .catch(function(error) {
  //     AppDispatcher.handleServerAction({
  //       type: REQUEST_MARATHON_GROUP_DELETE_ERROR,
  //       data: error
  //     });
  //   });
  // },
  deleteGroup(group, force) {
    const groupId = group.getId();
    MarathonActions.deleteGroup(groupId, force);
  },
  deleteService(service) {
    if (service instanceof Framework) {
      deleteFramework(service);

      return;
    }
    MarathonActions.deleteService(service);
  }
};

module.exports = ServiceDeleteActions;
