// XXX Since Blaze doesn't have a clean high component API, component API are
// also tweaky to use. I guess React would be a solution.
// https://github.com/meteortemplates/tabs
import { ReactiveTabs } from 'meteor/templates:tabs';


const template = 'basicTabs';
ReactiveTabs.createInterface({ template });
