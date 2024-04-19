/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Lib',

  flags: [ 'web' ],

  axioms: [
    foam.u2.JsLib.create({src: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js'})
  ]
});
