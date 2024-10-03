/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.theme',
  name: 'StandaloneTheme',

  documentation: `
    A barebones theme object that can be used to theme non-nanos apps
    Currently provides: 
      - id for cssTokenOverrides
      - name
      - glyphs
      - logos
  `,


  requires: [
    'foam.u2.theme.ThemeGlyphs'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Image',
      name: 'logo',
      documentation: 'The logo to display in the application.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.theme.ThemeGlyphs',
      name: 'glyphs',
      documentation: 'Glyphs are simple vectors which can be used as menu items or indicators.',
      factory: function() {
        return foam.u2.theme.ThemeGlyphs.create({}, this);
      }
    }
  ]
});
