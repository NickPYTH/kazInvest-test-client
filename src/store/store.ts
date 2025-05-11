import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {messageAPI} from "service/MessageService";

const rootReducer = combineReducers({
    [messageAPI.reducerPath]: messageAPI.reducer,
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .concat(messageAPI.middleware)
    })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
