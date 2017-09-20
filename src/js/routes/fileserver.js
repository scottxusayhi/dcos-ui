import { Route } from "react-router";

import FileServer from "../pages/FileServer";

const fileserverRoutes = {
  category: "root",
  type: Route,
  path: "fileserver",
  component: FileServer,
  isInSidebar: true
};

module.exports = fileserverRoutes;
