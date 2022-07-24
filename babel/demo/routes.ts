import Books from "app/pages/Book";
import SystemConfig from "app/pages/SystemConfig";
import {
  BOOKS,
  SYSTEM_CONFIG,
} from "./path.config";

export interface RouterItem {
  page: any;
  path: string;
}
export const devRouterList: RouterItem[] = [
  {
    page: Books,
    path: BOOKS 
  },
  {
    page: SystemConfig,
    path: SYSTEM_CONFIG
  },
];
