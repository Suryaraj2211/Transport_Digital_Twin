module.exports = (req, res) => {
  res.writeHead(302, { Location: '/admin/' });
  res.end();
};

