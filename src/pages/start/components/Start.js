import React from "react";
// import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
// import Tree from 'react-d3-tree';
// import "./Dashboard.css";
// import ReactModal from 'react-modal';
// import BlockNumber from '../../../components/BlockNumber';
// import ETHPool from "./ETHPool";
// import IPFSPool from "./IPFSPool";
// import TornadocashPool from "./TornadocashPool";
// import GenericPool from "./GenericPool";
// import IPFS from "./IPFS";
// import ETH from "./ETH";
// import Kusama from "./Kusama";
// import TornadoCash from "./TornadoCash";
import { Redirect } from "react-router-dom";

const Comp = ({ parentPath, myidentity, bubble, createBubble }) => {

    if (!myidentity) {
        return (<div>Loading</div>);
    }

    if (bubble && bubble.id) {
        return (
            <Redirect to={`/dashboard`} />
        )
    }

    return (
        <div className="ryo-container">
            <button onClick={() => { createBubble() }} class="button is-medium">nieuwe gezinsbubbel</button>
            <button class="button is-medium">toetreden tot een gezinsbubbel</button>
        </div>
    )
};

const mapStateToProps = state => {
    return {
        myidentity: state.main.myidentity,
        bubble: state.main.bubble,
    };
};

const mapDispachToProps = dispatch => {
    return {
        createBubble: () => dispatch({ type: "CREATEBUBBLE" }),
        // joinBubble: (index, item) => dispatch({ type: "CHANGECLOSE", index: index, item: item }),
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(Comp);
