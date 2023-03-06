'use strict'

require('dotenv').config()

const deluooderFactory = require('./deluscriber/deluscriberFactory')

const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || '80'

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.post('/correct', async (req, res) => {

  res.send({ "correction": "phrase corrigée!" })
})

app.listen(port, hostname, () => {
  console.log(`Le serveur tourne à l'adresse https://${hostname}:${port}/`)
})
