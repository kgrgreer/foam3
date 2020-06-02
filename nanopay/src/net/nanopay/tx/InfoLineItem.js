/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InfoLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
  {
    name: 'id',
    class: 'String',
    visibility: 'HIDDEN'
  },
  {
    name: 'group',
    class: 'String',
    visibility: 'HIDDEN'
  },
  {
    name: 'sourceAccount',
    visibility: 'HIDDEN'
  },
  {
    name: 'destinationAccount',
    visibility: 'HIDDEN'
  },
  {
    documentation: 'By default, show Transaction Line Item class name - to distinguish sub-classes.',
    name: 'name',
    gridColumns: 3,
    label: '',
    class: 'String',
    visibility: 'RO',
  },
  {
    name: 'note',
    gridColumns: 9,
    label: '',
    class: 'String',
    updateVisibility: 'RW',
    createVisibility: 'RW',
    readVisibility: 'RO'
  },
  {
    visibility: 'HIDDEN',
    name: 'type'
  },
  {
    name: 'amount',
    class: 'UnitValue',
    visibility: 'HIDDEN'
  },
  {
    name: 'currency',
    visibility: 'HIDDEN'
  },
  {
    name: 'reversable',
    visibility: 'HIDDEN',
  },
  {
    name: 'transaction',
    visibility: 'HIDDEN',
  }
  ],
  methods: [
    function toSummary() {
      return this.name+ " : "+this.note;
    },
  ]
});
