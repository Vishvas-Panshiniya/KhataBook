const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;

    if (req.originalUrl.startsWith('/api')) {
        res.status(status).json({
            error: err.message || 'Internal Server Error',
        });
    } else {
        // Basic error page rendering
        res.status(status).send(`
      <h1>Error ${status}</h1>
      <p>${err.message || 'Internal Server Error'}</p>
      <a href="/">Go Home</a>
    `);
    }
};

module.exports = errorHandler;
