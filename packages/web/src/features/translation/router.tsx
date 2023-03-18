import { RouteObject } from "react-router-dom"
import TranslationView from "./TranslationView"

const routes: RouteObject[] = [{
  path: 'translation',
  element: <TranslationView />
}]

export default routes