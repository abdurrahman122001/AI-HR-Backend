const { simpleParser } = require('mailparser');

function parseEmail(stream) {
  return new Promise((resolve, reject) => {
    simpleParser(stream, (err, parsed) => {
      if (err) reject(err);
      else     resolve(parsed);
    });
  });
}

module.exports = { parseEmail };
