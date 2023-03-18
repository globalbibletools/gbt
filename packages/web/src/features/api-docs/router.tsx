import { RouteObject } from "react-router-dom"
import ApiDocsView from "./ApiDocsView"

const routes: RouteObject[] = [{
  path: 'api-docs',
  element: <ApiDocsView />
}]

export default routes
