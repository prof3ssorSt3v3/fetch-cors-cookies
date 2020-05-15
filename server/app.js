const express = require('express');
const app = express();
//const cors = require('cors');
const cookieParser = require('cookie-parser');
const port = process.env.API_PORT || 5555;
const path = require('path');

//handle json body request
app.use(express.json());
app.use(cookieParser());
//app.use(cors());

app.get('/', (req, res) => {
  //if nothing requested, redirect to '/index.html'
  res.redirect('/index.html');
});

app.get('/set', (req, res) => {
  //fetch call to add a new cookie called 'token'
  //create the token
  let key = 'token';
  let value = [...new Array(30)]
    .map((item) => ((Math.random() * 36) | 0).toString(36))
    .join('');
  console.log('TOKEN', value);
  //set to expire in 30 days
  let thirtyDays = 1000 * 60 * 60 * 24 * 30; //30 days worth of milliseconds
  res.cookie(key, value, {
    maxAge: thirtyDays,
    path: '/',
    sameSite: 'None',
  });
  //secure needs to be set along with sameSite: 'None'. 'Lax' (default) will be there but unusable

  //CORS requires access-control-allow-origin... for fetch this needs an exact host match
  // CORS also needs access-control-allow-credentials if it is a fetch call with credentials: 'include'
  res.set('Access-Control-Allow-Origin', req.headers.origin); //req.headers.origin
  res.set('Access-Control-Allow-Credentials', 'true');
  // access-control-expose-headers allows JS in the browser to see headers other than the default 7
  res.set(
    'Access-Control-Expose-Headers',
    'date, etag, access-control-allow-origin, access-control-allow-credentials'
  );

  res.send({
    message: 'set-cookie header sent with maxAge of 30 days',
  });
});

app.get('/delete/:key', (req, res) => {
  //fetch call to delete a specific cookie
  console.log(req.params.key);
  let key = req.params.key;
  //CORS requires access-control-allow-origin... for fetch this needs an exact host match
  // CORS also needs access-control-allow-credentials if it is a fetch call with credentials: 'include'
  res.set('Access-Control-Allow-Origin', req.headers.origin);
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Expose-Headers', 'date, etag');
  res.cookie(key, '', { maxAge: 0, path: '/', sameSite: 'None' });
  res.send({
    message: `${key} cookie set to expire immediately`,
  });
});

app.get('/:name', (req, res) => {
  //index.html and other static files  route
  console.log('fetching a static file', req.params.name);
  let options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      'x-from-my-public-folder': true,
    },
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log('Sent:', fileName);
    }
  });
});

app.listen(port, function (err) {
  if (err) {
    console.error('Failure to launch server');
    return;
  }
  console.log(`Listening on port ${port}`);
});
