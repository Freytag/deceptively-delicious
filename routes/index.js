const express = require('express');
const router = express.Router();

// Do work here
// req object full of information coming in
// request has all of the information
// request.query | gets all of the query parameters
// request.body | will have posted parameters
// request.params | are items in the URL
// response has the methods for sending data back.
// response.json |
// response.render | render out a template
//

router.get('/', (req, res) => {
  // console.log(req.query); //object of query strings
  // const wes = {name: 'wes', age: 100, cool: true}
  // res.json(wes);
  // res.send('Hey! It works!');
  res.render('hello', {
    name:'wes',
    // dog: 'sinckers'
    dog: req.query.dog,
    title: 'i love food'
  })
});

//
router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
})

module.exports = router;
