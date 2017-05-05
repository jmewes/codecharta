"use strict";

import "./data/data.js";
import "./settings/settings.js";
import "./url/url.js";
import "./treemap/treemap.js";
import "./scenario/scenario.js";

angular.module("app.codeCharta.core",["app.codeCharta.core.data", "app.codeCharta.core.settings", "app.codeCharta.core.url", "app.codeCharta.core.treemap","app.codeCharta.core.scenario"]);
