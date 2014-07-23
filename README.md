goboard
=======

Web front end for boardgame setup app

## Testing
0. Start [meeple_mover](https://github.com/rkbodenner/meeple_mover) with a test database.
1. Make sure `App.MEEPLE_MOVER_URL` points to your meeple_mover service.
2. Uncomment the `<script src="tests/runner.js"></script>` line at the bottom of `index.html`.
3. Open the root URL with an added `test` parameter, for example, [http://localhost:8000/index.html?test](http://localhost:8000/index.html?test)