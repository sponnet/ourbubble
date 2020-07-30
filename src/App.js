import React, { useEffect } from "react";
import "./sass/style.sass";

import { BrowserRouter, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import pages from "./pages";
import CatchAll from "./pages/CatchAll";


function App({ bootstrap, connect, disconnect, onMessage }) {

    useEffect(() => {
        bootstrap();

    }, [bootstrap]);


    return (
        <div className="App">
            <BrowserRouter>
                <Switch>
                    {Object.values(pages).map(({ RootComponent, parentPath, rootPath }) => (
                        <Route
                            key={rootPath}
                            path={rootPath}
                            exact={rootPath === "/"}
                            render={props => (
                                <section>
                                    <RootComponent parentpath={parentPath} rootpath={rootPath} {...props} />
                                </section>
                            )}
                        />
                    ))}
                    <Route component={CatchAll} />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

const mapStateToProps = state => {
    return {
        ...state.wallets
    };
};

const mapDispachToProps = dispatch => {
    return {
        bootstrap: () => dispatch({ type: "BOOTSTRAP" }),
        connect: () => dispatch({ type: "CONNECTED" }),
        disconnect: () => dispatch({ type: "DISCONNECTED" }),
        onMessage: (message) => dispatch({ type: "MESSAGE", message: message }),
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(App);
