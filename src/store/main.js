
import { PromiseBlackBox, ReduxBlackBox } from '@oqton/redux-black-box';
import axios from 'axios';
import config from '../config';
import { ethers } from "ethers";
import { v4 as uuidv4 } from 'uuid';

export const initialState = {
    socketconnected: false,
    wallet: null,
    myidentity: null,
    mysigningkey: null,
    bubble: {
        id: null,
        version: "0.0.1",
        close: [{}, {}, {}, {}, {}],
        numclose: 5,
        extended: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        numextended: 10,
    }
}

const reducer = (state = initialState, action) => {
    // console.log(`reducer ${action.type}`);
    // console.log(state);
    switch (action.type) {
        case "BOOTSTRAP":
            if (!state.mysigningkey) {
                const wallet = ethers.Wallet.createRandom();
                state.mysigningkey = wallet.privateKey;
            }

            return {
                ...state,
                myidentity: new ethers.Wallet(state.mysigningkey).address
            };


        case "CREATEBUBBLE":
            return {
                ...state,
                bubble: {
                    ...state.bubble,
                    id: uuidv4()
                }
            }

        case "ADDCLOSE":
            const newItem = {}
            state.bubble.close = [...state.bubble.close, newItem];
            return {
                ...state
            };

        case "CHANGECLOSE":
            return {
                ...state,
                bubble: {
                    ...state.bubble,
                    close: state.bubble.close.map((existingItem, currentIndex) => action.index === currentIndex ? { ...existingItem, ...action.changes } : existingItem)
                }
            };

        case "DELETECLOSE":
            return {
                ...state,
                bubble: {
                    ...state.bubble,
                    close: state.bubble.close.filter((item, index) => index !== action.index)
                }
            };

        case "ADDEXTENDED":
            state.bubble.close = [...state.bubble.close, {}];
            return {
                ...state
            };


        case "CHANGEEXTENDED":
            return {
                ...state,
                bubble: {
                    ...state.bubble,
                    extended: state.bubble.extended.map((existingItem, currentIndex) => action.index === currentIndex ? { ...existingItem, ...action.changes } : existingItem)
                }
            };

        case "DELETEEXTENDED":
            return {
                ...state,
                bubble: {
                    ...state.bubble,
                    extended: state.bubble.extended.filter((item, index) => index !== action.index)
                }
            };
        case "DISCONNECT":
            return {
                socketconnected: false,
                ...state,
            };

        // case "SETADMINTOKEN":
        //     return {
        //         ...state,
        //         admintoken: action.admintoken,
        //     }

        // case "MESSAGE":
        //     const m = JSON.parse(action.message);
        //     let newState = {};
        //     switch (m.command) {
        //         case "members":

        //             // const pools_u = m.data.poolmembers.map((m) => {
        //             //     return m.servicegroup;
        //             // });
        //             // const pools = [...new Set(pools_u)];

        //             state.pools = m.data.pools; //pools;
        //             state.poolmembers = m.data.poolmembers.reduce((accum, pm) => {
        //                 const memberdata = m.data.members.find((item) => {
        //                     return item.memberid === pm.memberid
        //                 })
        //                 // TODO: this only applies to eth_rpc nodes
        //                 const idle = (pm.lastkeepalive + 2 * 60) < (Date.now() / 1000);
        //                 if (pm.status === 2) {
        //                     pm.memberdata = memberdata;
        //                     pm.idle = idle;
        //                     accum.push(pm);
        //                 }
        //                 return accum;
        //             }, []);
        //             break;
        //         case "newpins":
        //             newState = {
        //                 ...newState,
        //                 bb_refreshpins: new ReduxBlackBox(
        //                     { type: "LOADPINQUEUE" },
        //                 )
        //             };
        //             break;
        //         default:
        //             console.log(`unknown command ${m.command}`);
        //             break;
        //     }

        //     return {
        //         ...state,
        //         ...newState,
        //     };

        // case "LOADPINQUEUE":
        //     return {
        //         ...state,
        //         bb_refreshpins: new PromiseBlackBox(
        //             () =>
        //                 axios
        //                     .get(config.api.HTTPURL + "/pinsqueue")
        //                     .then((res) => ({ type: "SETPINQUEUE", data: res.data }))                    // .catch((e) => ({ type: "ADD_INVESTMENT_FAILED", e }))
        //                     .catch((e) => ({ type: "LOADPINQUEUE_FAILED", e }))
        //         )
        //     };
        // case "LOADPINQUEUE_FAILED":
        //     delete state.bb_refreshpins;
        //     return {
        //         ...state
        //     }
        // case "SETPINQUEUE":
        //     console.log(`Set PIN queue. Length=${action.data ? action.data.length : 0}`);
        //     delete state.bb_refreshpins;
        //     return {
        //         ...state,
        //         pinsqueue: action.data
        //     }
        // case "SUBMITHASH":
        //     console.log("submitting", action.data);
        //     return {
        //         ...state,
        //         bb_submithash: new PromiseBlackBox(
        //             () =>
        //                 submitHash(action.data)
        //                     .then(() => ({ type: "SUBMITHASH_SUCCESS", cb: action.callback }))                    // .catch((e) => ({ type: "ADD_INVESTMENT_FAILED", e }))
        //                     .catch(() => ({ type: "SUBMITHASH_FAILED", cb: action.callback }))                    // .catch((e) => ({ type: "ADD_INVESTMENT_FAILED", e }))
        //         )
        //     };

        // case "SUBMITHASH_SUCCESS":
        //     if (action.cb) action.cb(true);
        //     delete state.bb_submithash;
        //     return {
        //         ...state
        //     }

        // case "SUBMITHASH_FAILED":
        //     if (action.cb) action.cb(false);
        //     delete state.bb_submithash;
        //     return {
        //         ...state
        //     }
        // case "SETPINSTATUS":

        //     return {
        //         ...state,
        //         bb_submithash: new PromiseBlackBox(
        //             () =>
        //                 setPinStatus(action.id, action.status, state.admintoken)
        //                     .then(() => ({ type: "SETPINSTATUS_SUCCESS" }))                    // .catch((e) => ({ type: "ADD_INVESTMENT_FAILED", e }))
        //                     .catch(() => ({ type: "SETPINSTATUS_FAILED" }))                    // .catch((e) => ({ type: "ADD_INVESTMENT_FAILED", e }))
        //         )
        //     };
        // case "SETPINSTATUS_SUCCESS":
        // case "SETPINSTATUS_FAILED":
        //     delete state.bb_submithash;
        //     return {
        //         ...state,
        //     }


        // case "LOADPOOLSTATS":
        //     return {
        //         ...state,
        //         bb_LOADPOOLSTATS: new PromiseBlackBox(
        //             () =>
        //                 axios
        //                     .get(`${config.api.HTTPURL}/stats/${action.poolkey}`)
        //                     .then((res) => ({ type: "LOADPOOLSTATS_SUCCESS", data: res.data }))                    // .catch((e) => ({ type: "ADD_INVESTMENT_FAILED", e }))
        //                     .catch((e) => ({ type: "LOADPOOLSTATS_FAILED", e }))
        //         )
        //     };
        // case "LOADPOOLSTATS_SUCCESS":
        //     delete state.bb_LOADPOOLSTATS;
        //     return {
        //         ...state,
        //         poolstats: action.data
        //     }
        default:
            return state;
    }
}

export default reducer;
