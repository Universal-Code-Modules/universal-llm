const path = require('path')
const fs = require('fs')
const openAI = require('./OpenAI/openai-connector')

const fastify = require('fastify')({
    logger: true,
    http2: true,
    https: {
        allowHTTP1: true, // fallback support for HTTP1
        key: fs.readFileSync(path.join(__dirname, '.cert', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '.cert', 'cert.pem'))
    }
  })
//   fastify.register(require('@fastify/cookie'));
//   fastify.register(require('@fastify/session'), {secret: 'a secret with minimum length of 32 characters'});
  
  // Register CORS plugin (if your frontend is served from a different origin)
//   fastify.register(require('@fastify/cors@7.0.0'), { 
//     // origin: "*",
//     // Configure CORS if necessary
//   });
  fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
    // constraints: { host: 'example.com' } // optional: default {}
})
  
  // Route to handle POST requests
  fastify.post('/sendMessage', async (request, reply) => {
    const userMessage = request.body.message;
    const response = await openAI.language.generate({text:userMessage});
  
    return { reply: response.message };
  });
  
  // Run the server!
  fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    // Server is now listening on ${address}
  })
  