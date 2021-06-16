import express, { request, response } from 'express'
import bcrypt from 'bcryptjs'


const router = express.Router()

router.route('/').get((req, res, next) => {
    res.send('activities endpoint')
  })

router.get('/add/:x/:y?', async (req, res) => {
    const { x, y } = req.params

    if (!x || !y) {
        res.send('Either one or both numbers have not been provided.')
    }

    const numX = parseInt(x)
    const numY = parseInt(y)

    const total = numX + numY



    res.json({sum: total })
    
  })

  router.get('/hello/:name?', async (request, response) => {
      const { name } = request.params

      if (!name) {
          response.send('Error: no name provided')
      }

      response.json({ message: `Hello ${name}`})
  })

  router.get('/teapot', async (request, response) => {
      response.status(418).json(true)
  })

  router.post('/teapot', async (request, response) => {
      const { areYouATeapot } = request.body
      console.log(request.body)
      if (areYouATeapot === true) {
          response.status(418).json({ amIATeapot: 'yes'})
      } else {
        response.status(200).json({ amIATeapot: 'no'})
      }
  })

  module.exports = router