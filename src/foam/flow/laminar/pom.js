/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "foam-flow-laminar",
  version: 1,
  files: [
    // core
    { name: 'AbstractDoclet',       flags: 'web' },
    { name: 'Document',             flags: 'web' },
    { name: 'DocumentView',         flags: 'web' },

    // doclets
    { name: 'AutoDefinitionDoclet', flags: 'web' },
    { name: 'MarkdownDoclet',       flags: 'web' },
    { name: 'PrintDoclet',          flags: 'web' },
  ]
});
