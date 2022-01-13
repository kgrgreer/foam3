/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ndiff',
  name: 'NDiff',
  documentation: `Tracks changes to nSpecs. Used for debugging`,
  requires: [
    'foam.u2.dialog.Popup',
  ],
  tableColumns: [
    'nSpecName',
    'objectId',
    'delta',
    'deletedAtRuntime'
  ],
  ids: ['nSpecName', 'objectId'],
  properties: [
    {
      name: 'nSpecName',
      class: 'String',
    },
    {
      name: 'objectId',
      class: 'String',
    },
    {
      name: 'delta',
      class: 'Boolean',
      documentation: `
        Set to true if a difference was detected.
        `,
      storageTransient: false,
    },
    {
      name: 'deletedAtRuntime',
      class: 'Boolean',
      documentation: `
        Set to true if a repo entry was deleted at runtime.
        `,
      storageTransient: false,
    },
    {
      name: 'initialFObject',
      class: 'FObjectProperty',
      visibility: 'HIDDEN',
      documentation: `
        The object as it was loaded from the repo journals (".0 file")
        `,
    },
    {
      name: 'runtimeFObject',
      class: 'FObjectProperty',
      visibility: 'HIDDEN',
      documentation: `
        The object as it was loaded from the runtime journals
        `,
    },
    {
      name: 'applyOriginal',
      class: 'Boolean',
      documentation: `
        Client-side will set this true when they want to store
        the initialFObject to its respective DAO.
        `,
      storageTransient: false,
    },
  ],

  actions: [
    {
      name: 'apply',
      label: 'Apply Original',
      confirmationRequired: function() {
        return true;
      },
      isEnabled: function(delta) {
        return ! delta;
      },
      code: function(X) {
        this.applyOriginal = true;
        X.dao.put(this);
      },
    },
    {
      name: 'compare',
      label: 'Compare changes',
      isEnabled: function(delta) {
        return delta;
      },
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.StyledModal.create({ title: 'Comparison' }, this)
          .tag({class: 'foam.u2.view.ComparisonView', left: this.initialFObject, right: this.runtimeFObject})
        );
      }
    },
  ],
});
