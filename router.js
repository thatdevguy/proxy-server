const requestHandler = async request => {
    return new Response('Hello workers!', {
        headers: { 'content-type': 'text/plain' },
      });
};

module.exports = {
    requestHandler
}