import {RouteProps} from "react-router-dom";
import React from "react";
import {MainPage} from "pages/MainPage";

export enum AppRoutes {
    MAIN = 'MAIN',
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.MAIN]: '/',
}

export const routeConfig: Record<AppRoutes, RouteProps> = {
    [AppRoutes.MAIN]: {
        path: RoutePath.MAIN,
        element: <MainPage/>
    },
}