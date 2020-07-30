import config from "../config";
import axios from "axios";
import { sign } from "bitcoinjs-message";
import { getBtcWallet, getPubKey, formatSatsBalance } from "./bitcoinutils";

const getAvailableCurrencies = () => {
    return new Promise((resolve, reject) => {
        axios
            .get(config.apiGateway.URL + "/v2/currencies")
            .then(res => {
                const allowedCurrencies = res.data.currencies.reduce((accum, currency) => {
                    if ((["CHF", "EUR", "BTC"]).includes(currency.code)) {
                        accum.push(currency);
                    }
                    return accum;
                }, []);
                return resolve(allowedCurrencies);
            })
            .catch(error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            return reject(new Error("We cannot contact new orders due to an error. Try again later."));

                        default:
                            return reject(new Error("We cannot contact new orders due to an error. Try again later."));
                    }
                } else {
                    return reject(new Error("You seem to be offline. Try again later. (" + error + ")"));
                }
            });
    });
};


const getOrders = (sessionid) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${config.relaiApi.URL}/v2/orders`, {
                headers: {
                    "sessionid": sessionid
                }
            })
            .then(res => {
                return resolve(res.data);
            })
            .catch(error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            return reject(error.response.data.response);
                        default:
                            return reject(new Error("The server cannot process your order right now. Try again later."));
                    }
                } else {
                    return reject(new Error("The server cannot be reached right now. Try again later."));
                }
            });
    })
}


const getOrderDetails = (orderUrl, sessionid) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${config.relaiApi.URL}${orderUrl}`, {
                headers: {
                    "sessionid": sessionid
                }
            })
            .then(res => {
                return resolve(res.data);
            })
            .catch(error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            return reject(error.response.data.response);
                        default:
                            return reject(new Error("The server cannot process your order right now. Try again later."));
                    }
                } else {
                    return reject(new Error("The server cannot be reached right now. Try again later."));
                }
            });
    })
}

const getOrderSignature = (orderDetails, wallets) => {
    return new Promise((resolve, reject) => {
        if (!orderDetails.message_to_sign) {
            return reject(new Error(`Signature request not present - cannot create the order`));
        }
        const message = orderDetails.message_to_sign.body;
        console.log(`Signing this message: ${message} with ${orderDetails.output.currency} wallet`);
        switch (orderDetails.output.currency) {
            case "BTC":
                var btcWallet = getBtcWallet(wallets.btcwallet);
                var signature = sign(message, btcWallet.privateKey, btcWallet.compressed);
                var pubkey = getPubKey(btcWallet);
                // payments.p2pkh({ pubkey: keyPair.publicKey }).address
                const sres = signature.toString('base64');
                return resolve({ signer: pubkey, signature: sres });
            // case "ETH":
            // case "REP":
            //     wallets.eth.signMessage(message).then(signature => {
            //         return resolve({ signer: wallets.eth_pubkey, signature: signature });
            //     });
            //     break;
            default:
                return reject(new Error(`Unknown crypto currency ${orderDetails.output.currency}`));
        }
    });

};

const makeSellOrderFor = (selldetails, wallets) => {

    let pubkey;
    switch (selldetails.cryptocurrency) {
        case "BTC":
            var btcWallet = getBtcWallet(wallets.btcwallet);
            pubkey = getPubKey(btcWallet);
            break;
        default:
            throw new Error(`Unknown crypto currency ${selldetails.cryptocurrency}`);
    }

    const order = {
        "input": {
            "amount": formatSatsBalance(selldetails.amount),
            "currency": selldetails.cryptocurrency,
            "type": "crypto_address",
            "crypto_address": pubkey
        },
        "output": {
            "currency": selldetails.fiatcurrency,
            "type": "bank_account",
            "iban": selldetails.iban,
            "owner": {
                "name": selldetails.name,
                "address": selldetails.address,
                "zip": selldetails.zip,
                "city": selldetails.city,
                "country": selldetails.country
            }
        }
    };
    // debugger;
    console.log("Placing crypto->fiat order", order);
    return postAndSignOrder(order, wallets);
};

const currencyMap = [
    { code: "BTC", name: "Bitcoin" },
    { code: "ETH", name: "Ethereum" },
    { code: "REP", name: "Augur" },
    { code: "CHF", name: "Swiss Francs" },
    { code: "EUR", name: "Euro" },
]

const makeOrderFor = (investment, wallets) => {

    let pubkey;
    switch (investment.output.currency) {
        case "BTC":
            var btcWallet = getBtcWallet(wallets.btcwallet);
            pubkey = getPubKey(btcWallet);
            break;
        default:
            throw new Error(`Unknown crypto currency ${investment.output.currency}`);
    }


    let order = {
        input: {
            type: "bank_account",
            currency: investment.input.currency,
            amount: investment.input.amount.toString(),
            iban: investment.input.iban,
            // bic_swift: "",
            // aba_number: "",
            // sort_code: "",
            owner: {
                name: "",
                address: "",
                address_complement: "",
                zip: "",
                city: "",
                state: "",
                country: "CH"
            }
        },
        output: {
            type: "crypto_address",
            currency: investment.output.currency,
            crypto_address: pubkey
        }
    };

    console.log("Placing Fiat-> crypto order", order);
    return postAndSignOrder(order, wallets);

}
const postAndSignOrder = (order, wallets) => {
    return new Promise((resolve, reject) => {
        axios
            .post(`${config.relaiApi.URL}/v2/orders`, order)
            .then(res => {
                const orderDetailsUrl = `${res.headers.location}`;
                const sessionid = res.headers.sessionid;
                getOrderDetails(orderDetailsUrl, sessionid).then((orderDetails) => {
                    // fill the orders list with a first order
                    if (!orderDetails.message_to_sign || !orderDetails.message_to_sign.body) {
                        return resolve(orderDetails);
                    } else {
                        getOrderSignature(orderDetails, wallets).then((sig) => {
                            axios
                                .post(`${config.apiGateway.URL}${orderDetails.message_to_sign.signature_submission_url}`, sig.signature)
                                .then(res => {
                                    console.log(`Signature posting resulted: Res=${res.status}`);
                                    if (res.status !== 204) {
                                        reject(new Error("Signature rejected"));
                                    }
                                    getOrderDetails(orderDetailsUrl, sessionid).then((orderDetails) => {
                                        orderDetails.sessionid = sessionid;
                                        axios
                                            .post(`${config.relaiApi.URL}/event`, { source: sig.signer, category: "createinvestment", message: orderDetails })
                                            .then(res => {
                                                return resolve(orderDetails);
                                            }).catch(error => {
                                                return reject(error);
                                            });
                                    });
                                }).catch(error => {
                                    return reject(error);
                                });
                        }).catch(error => {
                            return reject(error);
                        });
                    };
                }).catch(error => {
                    return reject(error);
                });
            })
            .catch(error => {

                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            try {
                                switch (error.response.data.errors[0].code) {
                                    case "exceeds_quota":
                                        return reject(new Error("Your quota would be exceeded when doing this transaction."));
                                    default:
                                        return reject(new Error(`Cannot place order with error code ${error.response.data.errors[0].code}`));

                                }
                            } catch (e) {
                                return reject(new Error("Cannot create order. Unknown error"));
                            }
                        case 503:
                            return reject(new Error("Service temporary unavailable"));
                        default:
                            return reject(new Error("The server cannot process your order right now. Try again later."));
                    }
                } else {
                    return reject(new Error("The server cannot be reached right now. Try again later."));
                }
            });
    })
};


const getBitcoinFee = () => {
    return new Promise((resolve) => {
        axios
            .get(`${config.relaiApi.URL}/bitcoin/main`)
            .then(res => {
                resolve(res.data);
            });
    });
}

/**
* Retrieve BTC price from API
*
* @returns
*/
const getBitcoinPrice = () => {
    return new Promise((resolve) => {
        axios
            .get(`${config.relaiApi.URL}/bitcoin/price`)
            .then(res => {
                resolve(res.data);
            });
    });
}


const getUTXOs = (address) => {
    if (!address) {
        return Promise.reject(new Error("no address specified to receive UTXOs from"));
    }
    return new Promise((resolve, reject) => {
        axios.get(`${config.relaiApi.URL}/bitcoin/unspent/${address}`)
            .then((res) => {
                switch (res.status) {
                    case 200:
                        if (res.data) {
                            return resolve(res.data);
                        } else {
                            return resolve([]);
                        }
                    default:
                        return resolve([]);
                }
            }).catch((e) => {
                return resolve([]);
            });
    });
}

const getRawTx = (hash) => {
    if (!hash) {
        return Promise.reject(new Error("no hash specified"));
    }
    return new Promise((resolve, reject) => {
        axios.get(`${config.relaiApi.URL}/bitcoin/rawtx/${hash}`)
            .then((res) => {
                switch (res.status) {
                    case 200:
                        if (res.data) {
                            return resolve(res.data);
                        } else {
                            return resolve(null);
                        }
                    default:
                        return resolve(null);
                }
            }).catch((e) => {
                return resolve(null);
            });
    });
}

const sendRawTx = (tx) => {
    if (!tx) {
        return Promise.reject(new Error("no tx specified"));
    }

    // return new Promise((resolve, reject) => {
    //     setTimeout(() => { resolve("ok") }, 2000);
    // });

    return new Promise((resolve, reject) => {
        axios.post(`${config.relaiApi.URL}/bitcoin/push`, { tx: tx })
            .then((res) => {
                switch (res.status) {
                    case 200:
                        if (res.data) {
                            return resolve(res.data);
                        } else {
                            return resolve(null);
                        }
                    default:
                        return resolve(null);
                }
            }).catch((e) => {
                return reject(e);
            });
    });
}


// balance in SATS
const getBalance = (btcaddress) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${config.relaiApi.URL}/bitcoin/balance/${btcaddress}`)
            .then(res => {
                return resolve(res.data);
            })
            .catch(error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            return reject(error.response.data.response);
                        default:
                            return reject(new Error("The server cannot process your order right now. Try again later."));
                    }
                } else {
                    return reject(new Error("The server cannot be reached right now. Try again later."));
                }
            });
    })
}




export {
    makeOrderFor,
    makeSellOrderFor,
    getOrderDetails,
    getOrders,
    getAvailableCurrencies,
    currencyMap,
    getBitcoinPrice,
    getBitcoinFee,
    getUTXOs,
    getRawTx,
    sendRawTx,
    getBalance,
};
