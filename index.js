const router = require('./router');
const config = require('./config');

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if (!config['allowed-methods'].includes(request.method)) return new Response(`No handler for ${request.method} call`)
  return router.requestHandler(request);
}
