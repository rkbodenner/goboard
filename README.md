goboard
=======

Web front end for boardgame setup app

## Testing
0. Install Bower (http://bower.io).
1. Install dependencies via Bower: `bower install`
2. Make sure, in `js\app.js`, that `App.MEEPLE_MOVER_URL` points to http://localhost:8080. (This is where the tests' HTTP mocks go.)
3. Uncomment the script tags after "to activate the test runner" at the bottom of `index.html`.
4. Serve the app, for example using the built-in Python web server: `python -m SimpleHTTPServer 8000`
5. Open the root URL with an added `test` parameter, for example, [http://localhost:8000/index.html?test](http://localhost:8000/index.html?test)