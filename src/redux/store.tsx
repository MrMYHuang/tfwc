import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

//import { logger } from "redux-logger"
//import thunk from "redux-thunk"
//import promise from "redux-promise-middleware"

import reducer from "./reducers";
import Globals from "../Globals";

//const middleware = applyMiddleware(promise(), thunk, logger)

var savedStore: EnhancedStore;

export default function getSavedStore() {
    var savedSettingsStr = localStorage.getItem(Globals.storeFile);
    if (savedSettingsStr != null) {
        savedStore = configureStore({
            reducer,
            preloadedState: JSON.parse(savedSettingsStr)
        });//, middleware)
    }
    else {
        savedStore = configureStore({ reducer });//, middleware)
    }

    return savedStore;
}
