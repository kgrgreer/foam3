/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var CHOICES = [
  [ '10', "Narco" ],
  [ '11', "Bombasto" ],
  [ '12', "Celeritas" ],
  [ '13', "Magneta" ],
  [ '14', "RubberMan" ],
  [ '15', "StrongMan" ],
  [ '16', "Dynama" ],
  [ '17', "Dr. IQ" ],
  [ '18', "Dr. Bad" ],
  [ '19', "Magma" ]
];

foam.CLASS({
  name: 'AutoComplete',

  requires: [ 'foam.dao.EasyDAO' ],

  properties: [
    {
      class: 'String',
      name: 'plain',
      units: 'units'
    },
    {
      class: 'String',
      name: 'choices',
      units: 'units',
      view: function(_, x) { return { class: 'foam.u2.TextField', choices: CHOICES } }
    },
    {
      class: 'String',
      name: 'choiceViewDAO',
      units: 'units',
      view: function(_, x) { return { class: 'foam.u2.view.ChoiceView', dao: x.data.dao } }
    },
    {
      class: 'String',
      name: 'choiceView',
      units: 'units',
      view: function(_, x) { return { class: 'foam.u2.view.ChoiceView', choices: CHOICES } }
    },
    {
      class: 'String',
      name: 'viewTextField',
      view: 'foam.u2.view.TextField',
      units: 'units'
    },
    {
      class: 'String',
      name: 'autoComplete',
      view: function(_, x) { return { class: 'foam.u2.TextField', autocompleter: x.data }; },
      units: 'units'
    },
    {
      class: 'String',
      name: 'viewTextFieldAutoComplete',
      view: function(_, x) { return { class: 'foam.u2.view.TextField', autocompleter: x.data }; },
      units: 'units'
    },
//    foam.demos.heroes.Controller.HERO_DAO,
    {
      name: 'dao',
      hidden: true,
      factory: foam.demos.heroes.Controller.HERO_DAO.factory
    }
  ]
});
