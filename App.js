const express = require('express')
const config = require('config')
const cors = require('cors')
const mongoose = require('mongoose')
const {connect: connect1} = require('mongoose') //strange way to fix an even stranger mistake

const app = express()

app.use(express.json({extended: true}))
app.use(cors())
app.use('/api/auth', require('./routes/auth.routes'))

const PORT = config.get('port') || 5000

async function start() {
  try{
    mongoose.set('strictQuery', false);
    await connect1(config.get('mongoUri'), {
      useNewUrlParser: true
    }) // === mongoose.connect('',{})
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
  } catch (e){
    console.log('Server error', e.message)
    process.exit(1)
  }
}

start()

