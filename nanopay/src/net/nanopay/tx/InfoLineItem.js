/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    visibility: 'HIDDEN',
    transient: true
  },
  {
    name: 'sourceAccount',
    visibility: 'HIDDEN',
    transient: true
  },
  {
    name: 'destinationAccount',
    visibility: 'HIDDEN',
    transient: true
  },
  {
    documentation: 'By default, show Transaction Line Item class name - to distinguish sub-classes.',
    name: 'name',
    gridColumns: 3,
    //label: '',
    class: 'String',
    updateVisibility: 'RO',
    createVisibility: 'RO',
    readVisibility: 'RO',
    factory: function() {
      return this.cls_.name;
    },
    javaFactory: 'return getClass().getSimpleName();'
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
    name: 'type',
    transient: true
  },
  {
    name: 'amount',
    class: 'UnitValue',
    visibility: 'HIDDEN',
    transient: true
  },
  {
    name: 'currency',
    visibility: 'HIDDEN',
    transient: true
  },
  {
    name: 'transaction',
    visibility: 'HIDDEN',
  }
  ],
  methods: [
    function toSummary() {
      return this.name+ " : "+ this.note;
    },
  ]
});
