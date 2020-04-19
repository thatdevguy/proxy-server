// scalable naive balancer
const getRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1) ) + min;

// A/B split
const getGroup =  Math.random() < 0.5 ? 1 : 2;

//Link fetcher
const fetchLink = async link => {
    const response = await fetch(link);
    if (!response.ok) throw new Error(`${link} fetch failed`);
    return response;
};

module.exports = {
    getRandomInteger,
    fetchLink
}