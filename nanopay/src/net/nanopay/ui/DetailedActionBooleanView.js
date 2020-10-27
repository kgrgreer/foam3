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
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'DetailedActionBooleanView',
  extends: 'foam.u2.View',

  documentation: `
    Displays two labels and description that are visible based on the state of the boolean value.
    Along with the dynamics labels, an action is provided to put the provided data object
    into the targetDAO provided.
  `,

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'notify'
  ],

  css: `
    ^ {
      display: flex;
      align-items: center;
    }
    ^ .foam-u2-DetailedActionBooleanView-text{
      width: 50%;
      white-space: pre-wrap;
    }
    ^show-action {
      justify-content: space-between;
    }
    ^ input {
      margin-right: 15px;
    }
  `,

  properties: [
    ['showAction', true],
    ['autoSave', true],
    'trueLabel',
    'falseLabel',
    'trueActionLabel',
    'falseActionLabel',
    'targetDAOKey',
    'property',
    {
      class: 'String',
      name: 'dynamicLabel',
      expression: function(data) {
        return data ? this.trueLabel : this.falseLabel;
      }
    },
    {
      class: 'String',
      name: 'dynamicActionLabel',
      expression: function(data) {
        return data ? this.trueActionLabel : this.falseActionLabel;
      }
    }
  ],

  messages: [
    { name: 'BOOLEAN_ERROR', message: 'There was an issue updating' },
    { name: 'BOOLEAN_SUCCESS', message: 'was successfully updated' }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass()).enableClass(this.myClass('show-action'), this.showAction$)
        .start('input').hide(this.showAction$).setAttribute('type', 'checkbox')
          .attrs({ 'checked': this.data$, 'disabled': this.mode !== foam.u2.DisplayMode.RW })
          .on('click', (e) => {
            if ( this.mode === foam.u2.DisplayMode.RO ) return e.preventDefault();
            this.data = ! this.data;
          })
        .end()
        .start().addClass(this.myClass('text'))
          .add(this.dynamicLabel$)
        .end()
        .startContext({ data: this })
          .start().show(this.showAction$).addClass(this.myClass('btn-box'))
            .tag(this.UPDATE_OBJECT, {
              label$: this.dynamicActionLabel$,
              buttonStyle: 'SECONDARY'
            })
          .end()
        .endContext()
      .end();
    },
    function fromProperty(property) {
      this.SUPER(property);
      this.property = property;
    }
  ],

  actions: [
    {
      name: 'updateObject',
      isEnabled: function(mode) {
        return mode === foam.u2.DisplayMode.RW;
      },
      code: async function(X) {
        var dao = X[this.targetDAOKey];
        this.data = ! this.data;
        if ( ! this.autoSave ) return;
        try {
          dao.put(this.__context__.data);
        } catch (e) {
          console.error(`${ this.BOOLEAN_ERROR } ${ this.property.label } of ${ this.__context__.cls_.name }`);
          this.notify(`${ this.BOOLEAN_ERROR } ${ this.property.label }`, '', this.LogLevel.ERROR, true);
          return;
        }
        this.notify(`${ this.property.label } ${ this.BOOLEAN_SUCCESS }`, '', this.LogLevel.INFO, true);
      }
    }
  ]
});
