import { utils } from "ethers";

export function isAddress(address) {
    try {
        utils.getAddress(address);
    } catch (e) { return false; }
    return true;
};

export function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};


