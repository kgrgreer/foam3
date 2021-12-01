/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.onTest',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  reactions: [
    ['', 'propertyChange', 'reactionTestListener']
  ],

  css: `
    h1 { color: #aaa; }
    body, input[text] { color: #888; }
  `,

  properties: [
    {
      class: 'String',
      name: 'yourName',
      value: 'Jane Doe',
      view: {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please'
      }
    }
  ],

  methods: [
    function render() {
      this.start('div').add('Name:').end().start('div').add(this.YOUR_NAME).end().
        start('h1').add('Hello ').add(this.yourName$).add('!').end();
    }
  ],

  listeners: [
    {
      name: 'onTestListener',
      on: [
        //obj.topic
        'this.propertyChange',
        'this.test'
        // we can use also :
        //   'yourName.propertyChange',
        //   'data.propertyChange'
      ],
      code: function(evt) {
        console.log('Test Listener code')//TODO print this.yourName
      }
    },
    {
      name: 'reactionTestListener',
      code: function() {
        console.log('Reaction Test Listener '+this.yourName)
      }
    }
  ]
});
