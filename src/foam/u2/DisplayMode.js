/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
   package: 'foam.u2',
   name: 'DisplayMode',

   documentation: 'View display mode; how or if a view is displayed.',

   properties: [
     {
       name: 'restrictDisplayMode',
       value: function(mode) { return mode === foam.u2.DisplayMode.RW ? this : mode; }
     }
   ],

   values: [
     { name: 'RW', label: 'Read-Write' },
     { name: 'DISABLED' },
     { name: 'RO', label: 'Read-Only' },
     { name: 'HIDDEN', restrictDisplayMode: function() { return foam.u2.DisplayMode.HIDDEN; } }
   ]
 });
