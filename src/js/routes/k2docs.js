import { Route } from "react-router";

import K2DocsPage from "../pages/K2DocsPage";

const k2docsRoutes = {
  category: "root",
  type: Route,
  path: "k2docs",
  component: K2DocsPage,
  isInSidebar: true
};

module.exports = k2docsRoutes;
