if (window.location.search.indexOf("?test") !== -1) {
  document.write(
    '<div id="qunit"></div>' +
    '<div id="qunit-fixture"></div>' +
    '<div id="ember-testing-container">' +
    '  <div id="ember-testing"></div>' +
    '</div>' +
    '<link rel="stylesheet" href="tests/runner.css">' +
    '<link rel="stylesheet" href="bower_components/qunit/qunit/qunit.css">' +
    '<script src="bower_components/jquery-mockjax/jquery.mockjax.js"></script>' +
    '<script src="bower_components/qunit/qunit/qunit.js"></script>' +
    '<script src="tests/vendor/ember-qunit-main.js"></script>' +
    '<script src="tests/tests.js"></script>'
  )
}
