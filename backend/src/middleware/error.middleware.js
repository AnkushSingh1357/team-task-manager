const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

module.exports = { errorHandler };
