import { ECPair } from "bitcoinjs-lib";
import { payments } from "bitcoinjs-lib";
import { Psbt } from "bitcoinjs-lib/src/psbt";
import { getUTXOs, getBitcoinFee, getRawTx } from "./relaiapi";
import coinSelect from "coinselect";
import BN from 'bn.js';

export const formatSatsBalance = (sats) => {
    if (!sats || sats === 0 || sats === "0") return "0";
    return (sats / 1e8).toFixed(8);
}

export const formatBTCToSats = (btc) => {
    if (!btc || btc === 0 || btc === "0") return "0";
    return Math.floor(btc * 1e8);
}

export const getBtcWallet = (privateKey) => {
    const mkNew = () => {
        const randomWallet = ECPair.makeRandom();
        return randomWallet;
    }
    if (privateKey) {
        try {
            return ECPair.fromPrivateKey(new Buffer(privateKey, "hex"), { compressed: true });
        } catch (e) {
            return mkNew();
        }
    } else {
        return mkNew();
    }
};

export const createWithdrawTX = async (btcWallet, to, amount) => {
    return new Promise((resolve, reject) => {

        const pubKey = getPubKey(btcWallet);
        console.log(`create TX for sending ${amount} from ${pubKey} to ${to}`);
        Promise.all([getUTXOs(pubKey), getBitcoinFee()])
            .then(([utxos, feePerKb]) => {
                Promise.all(utxos.map((u) => {
                    return new Promise((resolve, reject) => {
                        getRawTx(u.tx_hash_big_endian).then((rawTx) => {
                            return resolve({ ...u, rawTx: rawTx });
                        }).catch(reject);
                    })
                })).then((txes) => {

                    // debugger;
                    console.log(`feePerKb=${feePerKb.medium_fee_per_kb}`);

                    try {

                        // const pstb_class = Psbt;

                        // now create TX
                        const psbt = new Psbt();

                        let sources = utxos.map((u, i) => {
                            return {
                                txId: u.tx_hash_big_endian,
                                value: new BN(u.value),
                            }

                        });

                        let targets = [
                            {
                                address: to,
                                value: new BN(amount)
                            }
                        ];

                        // coinselect expects values to be in BN format
                        let { inputs, outputs, fee } = coinSelect(sources, targets, new BN(Math.ceil(feePerKb.medium_fee_per_kb / 1024)))

                        if (!inputs || !outputs) {
                            return reject("no solution found");
                        }

                        if (outputs.length < 2) {
                            return reject("Only received 1 output - expected 2");
                        }

                        if (inputs.length < 1) {
                            return reject("No input - received. Expected at least 1");
                        }

                        inputs.forEach(input => {
                            const enrichedInput = txes.find((utxo) => {
                                return (utxo.tx_hash_big_endian === input.txId);
                            });
                            if (!enrichedInput) {
                                throw new Error("No input found");
                            }

                            psbt.addInput({
                                hash: enrichedInput.tx_hash_big_endian,
                                index: enrichedInput.tx_output_n,
                                nonWitnessUtxo: Buffer.from(enrichedInput.rawTx, 'hex')
                            });
                        });

                        outputs.forEach(output => {
                            // outputs may have been added that you need to provide
                            // an output address ( change address )
                            if (!output.address) {
                                output.address = pubKey
                            }

                            // psbt expects values to be in Number format
                            psbt.addOutput({
                                address: output.address,
                                value: output.value.toNumber(),
                            })

                        })

                        psbt.signAllInputs(btcWallet);
                        psbt.finalizeAllInputs();

                        // build and hex encode TX
                        const tx = psbt.extractTransaction().toHex();

                        console.log("fee=", fee);
                        console.log("tx size=", tx.length, tx.length / 1024, "K");

                        resolve(tx);
                    } catch (e) {
                        console.log(e);
                        reject(e);
                    }
                })
            }).catch((e) => {
                reject(e);
                // could not get utxo's
            })

    });
}


export const getPubKey = (btcWallet) => {
    return payments.p2pkh({ pubkey: btcWallet.publicKey }).address;
}

export const isAddress = (address) => {
    // debugger;
    try {
        address.toOutputScript(address)
        return true;
    } catch (e) {
        return false;
    }
}


