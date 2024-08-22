/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.INTERFACE({
  package: 'foam.nanos.crunch.lite',
  name: 'ReferencePayloadData',
  documentation: `Interface used by capability data models that have a reference 
  property called data so capableDAO can populate dataObj with contents of data 
  on the way to the client`,


  properties: [
    {
      // class: 'Reference',
      name: 'data'
    },
    // TODO: add this in the capablePayload select
    // {
    //   name: 'dataObj'
    // }
  ]
});
