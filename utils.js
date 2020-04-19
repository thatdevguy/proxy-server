const config = require('./config');

// scalable naive balancer for now
const getRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1) ) + min;

// A/B split
const getGroup =  Math.random() < 0.5 ? 1 : 2;

//Link fetcher
const fetchLink = async link => {
    const response = await fetch(link);
    if (!response.ok) throw new Error(`${link} fetch failed`);
    return response;
};

//modify html
const rewriter = (group, content) => {
    return new HTMLRewriter()
        .on("title", {
            element(element) {
                element.setInnerContent(`Variant ${group}`);
            }
        })
        .on("h1#title", {
            element(element) {
                element.setInnerContent(`Vaibhav Bandikatla`);
            }
        })
        .on("p#description", {
            element(element) {
                element.setInnerContent(
                `Thank you`
                );
            }
        })
        .on("a#url", new AttributeHandler("href"))
        .transform(content);
}

class AttributeHandler {
    constructor(attributeName) {
        this.attributeName = attributeName;
    }

    element(element) {
        const attribute = element.getAttribute(this.attributeName);
        if (attribute) {
            element.setAttribute(
                this.attributeName,
                attribute.replace(
                "https://cloudflare.com",
                config['resume']
                )
            );
            element.setInnerContent("Resume");
            element.setAttribute("target", "_blank");
        }
    }
}

const getCookieMap = request => {
    const cookie = request.headers.get('cookie');
    const mapper = {};
    if (cookie) {
        const cookies = cookie.split(';');
        cookies.forEach(c => {
            const [key, val] = c.split('=');
            mapper[key.trim()] = val;
        });
    }
    return mapper;
}


module.exports = {
    getRandomInteger,
    fetchLink,
    rewriter,
    getCookieMap
}