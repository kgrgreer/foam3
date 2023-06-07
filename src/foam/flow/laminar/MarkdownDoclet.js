/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.laminar',
  name: 'MarkdownDoclet',
  extends: 'foam.flow.laminar.AbstractDoclet',

  requires: [
    'foam.u2.view.MarkdownView'
  ],

  properties: [
    'markdownView_',
    {
      class: 'String',
      name: 'text'
    }
  ],

  methods: [
    async function execute_ (x) {
      this.markdownView_ = this.MarkdownView.create({ data$: this.text$ });
      const tokens = this.markdownView_.lexMarkdown(this.text);
      x = x.createSubContext({
        definitionWords: []
      })
      for ( const token of tokens ) {
        if ( token.cls_ === this.MarkdownView.Bold ) {
          const term = token.text.trim();
          console.log('adding term!!', term);
          x.definitionWords.push(term);
        }
      }
      return x;
    },
    function toE (args, x) {
      return this.markdownView_$.map(view => {
        console.log('the markdown view updated');
        return view;
      });
    }
  ]
})
