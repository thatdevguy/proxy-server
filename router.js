const config = require('./config');
const utils = require('./utils');

const getGroupFromCache = (request, links) => {
    if (config['cookie-method']) { //enabled cookie store
        const cookies = utils.getCookieMap(request);
        if (cookies[config['cookie-name']]) {
            const group = parseInt(cookies[config['cookie-name']]);
            // check if old group is still valid
            if (group && group > 0 && group <= links.length) {
                return group;
            }               
        }
    }
    return null;
};

const getLinks = async endpoint => {
    try {
        const response = await utils.fetchLink(endpoint);
        const json = await response.json();
        
        const links = json[config['variants-field']];
        if (!Array.isArray(links) || links.length < config['variants-min-length']) {
            throw new Error(`links from ${endpoint} are invalid`);
        }
        console.debug(links);
        return links;
    } catch (e) {
        console.error(e.message);
        throw new Error(`getLinks failure \n ${e.message}`); 
    }
};

const loadBalancer = async request => {
    const endpoint = config.endpoint || "https://cfw-takehome.developers.workers.dev/api/variants";
    const links = await getLinks(endpoint);
    const group = getGroupFromCache(request, links) || utils.getRandomInteger(1, links.length); //randomly select a link
    const link = links[group - 1];
    console.debug(link);
    const response = await utils.fetchLink(link);
    const modified_content = await utils.rewriter(group, response).text();

    //not setting max-age as per requirement
    return new Response(modified_content, {
        headers: {
            "content-type" : "text/html",
            "set-cookie": `${config['cookie-name']}=${group}; SameSite=Strict; Path=/`
        }
    });
};

const requestHandler = async request => {
    try {
        return loadBalancer(request);
    } catch (e) {
        //TODO: send error message and developer contact info
        console.error(e.message);
        //TODO: delete previous cookies to resolve issue
        return new Response(`${e.message} \nOh Oh! Kindly contact ${config['developer']}`, {
            headers: {
                "content-type" : "text"
            }
        });
    }
};

module.exports = {
    requestHandler
}