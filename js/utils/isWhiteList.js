'use strict';

const { getGlobalConfigField } = require('./../config.js');
const parseDomain = require('parse-domain');
const isEqual = require('lodash.isequal');

/**
 * Loops through the list of whitelist urls
 * @param url {String} - url the electron is navigated to
 * @returns {Promise}
 */
function isWhiteList(url) {

    return new Promise((resolve, reject) => {
        getGlobalConfigField('whiteListURL').then((whiteList) => {

            if (checkWhiteList(url, whiteList)) {
                return resolve();
            }

            return reject(new Error('URL does not match with the whiteList'));

        }).catch((err) => {
            reject(err);
        });
    });
}

/**
 * Method that compares url against a list of whitelist
 * returns true if hostName or domain present in the whitelist
 * @param url {String} - url the electron is navigated to
 * @param whiteList {String} - coma separated whitelists
 * @returns {boolean}
 */
function checkWhiteList(url, whiteList) {
    let whiteLists = whiteList.split(',');
    const parsedURL = parseDomain(url);

    if (!parsedURL) {
        return false;
    }

    if (!whiteList) {
        return false;
    }

    if (!whiteLists.length || whiteLists.indexOf('*') !== -1) {
        return true;
    }

    return whiteLists.some((whiteListHost) => {
        let parsedWhiteList = parseDomain(whiteListHost);

        if (!parsedWhiteList) {
            return false;
        }

        return matchDomains(parsedURL, parsedWhiteList);
    });
}

/**
 * Matches the respective hostName
 * @param parsedURL {Object} - parsed url
 * @param parsedWhiteList {Object} - parsed whitelist
 *
 * example:
 * matchDomain({ subdomain: www, domain: example, tld: com }, { subdomain: app, domain: example, tld: com })
 *
 * @returns {*}
 */
function matchDomains(parsedURL, parsedWhiteList) {

    if (isEqual(parsedURL, parsedWhiteList)) {
        return true;
    }

    const hostNameFromURL = parsedURL.domain + parsedURL.tld;
    const hostNameFromWhiteList = parsedWhiteList.domain + parsedWhiteList.tld;

    if (!parsedWhiteList.subdomain) {
        return hostNameFromURL === hostNameFromWhiteList
    }

    return hostNameFromURL === hostNameFromWhiteList && matchSubDomains(parsedURL.subdomain, parsedWhiteList.subdomain);

}

/**
 * Matches the last occurrence in the sub-domain
 * @param subDomainURL {String} - sub-domain from url
 * @param subDomainWhiteList {String} - sub-domain from whitelist
 *
 * example: matchSubDomains('www', 'app')
 *
 * @returns {boolean}
 */
function matchSubDomains(subDomainURL, subDomainWhiteList) {

    if (subDomainURL === subDomainWhiteList) {
        return true;
    }

    const subDomainURLArray = subDomainURL.split('.');
    const lastCharSubDomainURL = subDomainURLArray[subDomainURLArray.length - 1];

    const subDomainWhiteListArray = subDomainWhiteList.split('.');
    const lastCharWhiteList = subDomainWhiteListArray[subDomainWhiteListArray.length - 1];

    return lastCharSubDomainURL === lastCharWhiteList;
}

module.exports = {
    isWhiteList,

    // items below here are only exported for testing, do NOT use!
    checkWhiteList

};
