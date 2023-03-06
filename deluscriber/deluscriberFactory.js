'use strict'

const Deluscriber = require('./deluscriber')

class DeluscriberFactory {
  create () {
    return new Deluscriber()
  }
}

module.exports = new DeluscriberFactory()
