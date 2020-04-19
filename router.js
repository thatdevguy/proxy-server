const config = require('./config');
const utils = require('./utils');

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

const loadBalancer = async (request, links) => {
    if (config['cookie-method']) {
        return new Response('hello world1', {
            headers: {
                "content-type" : "text/html"
            }
        });
    } else {
        const link = links[utils.getRandomInteger(0, links.length - 1)]; //random select a link
        console.debug(link);
        const response = await utils.fetchLink(link);
        const content = await response.text();
        return new Response(content, {
            headers: {
                "content-type" : "text/html"
            }
        });
    }
};

const requestHandler = async request => {
    try {
        //check cookie already has a link, if not proceed heavy duty
        const endpoint = config.endpoint || "https://cfw-takehome.developers.workers.dev/api/variants";
        const links = await getLinks(endpoint);
        //TODO: distribute requests on cookies
        return  loadBalancer(request, links);
    } catch (e) {
        //send error message and developer contact
    }

};

module.exports = {
    requestHandler
}