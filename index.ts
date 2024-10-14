import Catalog from "./lib/Catalog";
import HttpClientAction from "./lib/nodes/HttpClientAction";

export default new Catalog(
    "example name",
    "example description",
    "https://app.helmut.cloud/img/logo_white.webp",
    "1.0.0",
    HttpClientAction
);
