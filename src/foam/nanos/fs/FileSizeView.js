/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileSizeView',
  extends: 'foam.u2.View',

  documentation: 'View for displaying file size with units eg. byte(B), kilobytes (KB), megabytes (MB) or gigabytes (GB).',

  constants: [
    {
      name: 'UNITS',
      value: [
        ' B',
        ' KB',
        ' MB',
        ' GB'
      ]
    }
  ],

  methods: [
    function render() {
      this.SUPER();

      this.add(this.format(this.data));
    },

    function format(filesize) {
      for ( var i = 0; i < this.UNITS.length; i++ ) {
        if ( filesize < 1024 ) break;

        filesize = filesize / 1024;
      }
      return Math.round(filesize) + this.UNITS[i];
    }
  ]
});
