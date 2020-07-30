import React from "react";
import { Route, Link } from "react-router-dom";
import Start from "./Start";

const Comp = ({ rootpath, parentpath }) => {
    return (
        <>
            <Route exact path={`${rootpath}`}
                render={props => (
                    <Start rootpath={`${rootpath}`} parentpath={`${parentpath}`} />
                )} />

            {/* <Route exact
                path={`${rootpath}stats/:poolkey?`}
                render={props => (
                    <>
                        <p class="title">Contributions to each pool - in percent</p>
                        <Stats rootpath={`${rootpath}`} parentpath={`${parentpath}`} poolkey="tornadocash_relayer" {...props} />
                        <Stats rootpath={`${rootpath}`} parentpath={`${parentpath}`} poolkey="ipfs_gateway" {...props} />
                        <Stats rootpath={`${rootpath}`} parentpath={`${parentpath}`} poolkey="kusama_polkadot_pool" {...props} />
                        <Stats rootpath={`${rootpath}`} parentpath={`${parentpath}`} poolkey="eth_rpc_pool" {...props} />
                    </>
                )} /> */}
            {/* <Route
                path={`${rootpath}pool/eth`}
                render={props => <ETHPool rootpath={`${rootpath}`} parentpath={`${parentpath}`} {...props} />}
                exact
            />

            <Route path={`${rootpath}pool/tornadocash`}
                render={props => (<TornadocashPool rootpath={`${rootpath}`} parentpath={`${parentpath}`}  {...props} />
                )} /> */}
        </>
    );
};

export default Comp;
