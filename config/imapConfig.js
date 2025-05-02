module.exports = {
    user:       process.env.IMAP_USER,
    password:   process.env.IMAP_PASSWORD,
    host:       process.env.IMAP_HOST,
    port:       +process.env.IMAP_PORT,
    tls:        true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout:3000,
  };
  