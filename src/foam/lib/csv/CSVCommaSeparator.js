/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.lib.csv',
  name: 'CSVCommaSeparator',
  documentation: `
  Comma separators for CSV parsing.
 
  This is defined as an enum to prevent arbitrarily parsing CSVs.
  (CSV parsers directly put the comma separator into their PStreams,
  it is not a good idea if we allow arbitrary input there.)
  `,
  values: [
    { name: 'COMMA',     type: 'String', label: 'Comma' },
    { name: 'SEMICOLON', type: 'String', label: 'Semicolon' },
  ]
});
