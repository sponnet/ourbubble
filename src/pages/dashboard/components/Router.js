import React from "react";
import { Route } from "react-router-dom";
import Dashboard from "./Dashboard";

const Comp = ({ rootpath, parentpath }) => {

    return (
        <>
            <Route exact path={`${rootpath}`}
                render={props => (
                    <Dashboard rootpath={`${rootpath}`} parentpath={`${parentpath}`} />
                )} />
        </>
    );
};

export default Comp;
