/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MarkdownView',
  extends: 'foam.u2.View',

  classes: [
    {
      name: 'Heading',
      properties: [
        'level',
        'text'
      ],
      methods: [
        function render(el) {
          el.start('h' + this.level)
            .add(this.text).end();
        }
      ]
    },
    {
      name: 'Bold',
      properties: ['text'],
      methods: [
        function render(el) {
          el.start('b').add(this.text).end().add(' ');
        }
      ]
    },
    {
      name: 'Italic',
      properties: ['text'],
      methods: [
        function render(el) {
          el.start('i').add(this.text).end().add(' ');
        }
      ]
    },
    {
      name: 'Text',
      properties: ['text'],
      methods: [
        function render(el) {
          el.add(this.text).add(' ');
        }
      ]
    },
    {
      name: 'Link',
      properties: ['title', 'url'],
      methods: [
        function render(el) {
          el.start('a')
            .attrs({ href: this.url })
            .add(this.title)
            .end().add(' ');
        }
      ]
    },
    {
      name: 'InlineCode',
      properties: ['text'],
      methods: [
        function render(el) {
          el.start('code').add(this.text).end();
        }
      ]
    },
    {
      name: 'BlockCode',
      properties: ['text'],
      methods: [
        function render(el) {
          el.start('pre').start('code').add(this.text).end().end();
        }
      ]
    },
    {
      name: 'LineBreak',
      methods: [
        function render(el) {
          el.tag('p');
        }
      ]
    },
    {
      name: 'Null',
      methods: [
        function render(el) { }
      ]
    }
  ],

  methods: [
    function render() {
      const self = this;

      const data$ = this.data$.map(str => this.dedent_(str));
      this.add(data$.map(function (data) {
        const el = self.E();
        self.renderMarkdown(data, el);
        return el;
      }));
    },

    function renderMarkdown(markup, el) {
      for (const token of this.lexMarkdown(markup)) {
        token.render(el);
      }
    },

    function* lexMarkdown(markup) {
      markup = '\n' + markup;
      const rules = [
        {
          pattern: /^\n *(#{1,6}) *([^\n]*)/,
          create: m => {
            return this.Heading.create({
              level: m[1].length,
              text: m[2]
            });
          }
        },
        {
          pattern: /^\`\`\`((?:[^\`\`\`]|\\\`)+)(?:\`\`\`)/,
          create: m => this.BlockCode.create({ text: m[1] })
        },
        {
          pattern: /^\n\n/,
          create: m => {
            return this.LineBreak.create();
          }
        },
        {
          pattern: /^\n/,
          create: m => {
            return this.Null.create();
          }
        },
        {
          pattern: /^(?:\*\*|__)([^\*_]+)(?:\*\*|__)/,
          create: m => this.Bold.create({ text: m[1] })
        },
        {
          pattern: /^(?:\*|_)([^\*_]+)(?:\*|_)/,
          create: m => this.Italic.create({ text: m[1] })
        },
        {
          pattern: /^\`((?:[^\`\n]|\\\`)+)(?:\`)/,
          create: m => this.InlineCode.create({ text: m[1] })
        },
        {
          pattern: /^ *\[([^\]]+)\]\(([^<"]+)\)/,
          create: m => this.Link.create({ title: m[1], url: m[2] })
        },
        {
          pattern: /^ *[^\*_\`\n]*/,
          create: m => this.Text.create({ text: m[0] })
        }
      ];

      let pos = 0;
      while (pos < markup.length) {
        const str = markup.slice(pos);

        let ruleMatched = false;
        for (rule of rules) {
          const m = str.match(rule.pattern);
          if (!m) continue;
          ruleMatched = true;
          pos += m[0].length;

          console.log(rule.create.toString(), m);
          yield rule.create(m);
          break;
        }

        if (!ruleMatched) {
          console.error('could not find any matches', str);
          break;
        }
      }
    },
    function dedent_ (str) {
      console.log('dedent on ', str)
      const lines = str.split('\n');
      let mindent;
      let checkIndent = line => {
        const match = line.match(/^(\s+)\S+/);
        if ( ! match ) return;
        const indent = match[1].length;
        mindent = indent;
        checkIndent = line => {
          const match = line.match(/^(\s+)\S+/);
          if ( ! match ) return;
          const indent = match[1].length;
          if ( indent >= mindent ) return;
          mindent = indent;
        };
      };
      for ( const line of lines ) {
        checkIndent(line);
      }

      // No lines? No contents!
      if ( mindent === undefined ) return '';

      return lines.map(l => l.slice(mindent)).join('\n').trim();
    }
  ]
});
