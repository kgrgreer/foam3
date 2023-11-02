/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// git log --since="2021-01-01" --until="2022-01-01" --no-merges -p > src/foam/demos/gitlog/data2021.log

foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'Commit',

  properties: [
    { class: 'String',      name: 'id' },
    { class: 'String',      name: 'author' },
    { class: 'DateTime',    name: 'date' },
    { class: 'String',      name: 'subject' },
    { class: 'String',      name: 'body' },
    { class: 'StringArray', name: 'files' },
    { class: 'String',      name: 'diff' }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'DiffView',
  extends: 'foam.u2.View',

  methods: [
    function render() {
      this.
        style({'white-space': 'pre'}).
        forEach(this.data.split('\n'), l => {
          if ( l.startsWith('+++') ) {
            this.start('b').add(l, '\n').end();
          } else if ( l.startsWith('+') ) {
            this.start('span').style({color: 'green'}).add(l, '\n').end();
          } else if ( l.startsWith('-') && ! l.startsWith('---') ) {
            this.start('b').style({color: 'red'}).add(l, '\n').end();
          } else {
            this.add(l, '\n');
          }
        });
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'CommitMessageView',
  extends: 'foam.u2.View',

  constants: {
    REGEX: /(\[[A-Za-z]{2,}-\d{4,}\]|\(#\d+\))/
  },

  methods: [
    function render() {
      this.
        addClass(this.myClass()).
        forEach(this.data.split(this.REGEX), l => {
          if ( l.startsWith('(#') ) {
            // Pull Request
            // TODO: make this configurable
            this.start('a').attrs({href: 'https://github.com/foam-framework/foam2/pull/' + l.substring(1,l.length-1)}).add(l).end();
          } else if ( l.match(this.REGEX) ) {
            // Jira Ticket
            // TODO: make this configurable
            this.start('a').attrs({href: 'https://nanopay.atlassian.net/browse/' + l.substring(1,l.length-1)}).add(l).end();
          } else {
            this.add(l);
          }
        });
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'CommitDetailView',
  extends: 'foam.u2.View',

  imports: [ 'file' ],

  methods: [
    function render() {
      var self = this;
      this.add(self.dynamic(function(data) {
        // this.add('data: ', data);
        if ( ! data ) return;
        this.
        start('b').add(data.subject).end().br().
        start('p').style({'white-space': 'pre'}).add(data.body).end().
        start('b').add('Files: ').end().br().br().forEach(data.files,
          function(f) {
            this.start('a').attrs({href:'#'}).on('click', () => self.file = f).add(f).end().br();
          }
        ).br().
        start('b').add('Diff:  ').end().tag({class: 'foam.demos.gitlog.DiffView'}, {data: data.diff});
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'UserMonthView',
  extends: 'foam.u2.View',

  css: `
    ^ table { font-size: smaller; }
    ^ th { text-align: right; }
    ^ th:first-child { text-align: left; }
    ^ td { align: rigth; }
    ^ .selected { background: lightskyblue; }
  `,

  properties: [
    { class: 'Boolean', name: 'isHardSelection' },
    { name: 'selection' }
  ],

  methods: [
    function render() {
      var self            = this;
      var allCommits      = this.data.commits;
      var commits         = this.data.filteredCommits;
      var allCounts       = [0,0,0,0,0,0,0,0,0,0,0,0];
      var counts          = [0,0,0,0,0,0,0,0,0,0,0,0];
      var authorCounts    = {};
      var allAuthorCounts = {};

      commits.forEach(c => {
        var month   = c.date.getMonth();
        var author  = c.author;
        var aCounts = authorCounts[author] || ( authorCounts[author] = [0,0,0,0,0,0,0,0,0,0,0,0] );
        counts[month]++;
        aCounts[month]++;
      });

      allCommits.forEach(c => {
        var month   = c.date.getMonth();
        var author  = c.author;
        var aCounts = allAuthorCounts[author] || ( allAuthorCounts[author] = [0,0,0,0,0,0,0,0,0,0,0,0] );
        allCounts[month]++;
        aCounts[month]++;
      });

      this.
        addClass(this.myClass()).
        start('table')
        .attrs({cellpadding: 4, cellspacing: 0, border: 1}).
        start('tr').forEach('Author Jan Feb Mar Apr May Jun July Aug Sept Oct Nov Dec Total'.split(' '), function(h) {
          this.start('th').add(h).end();
        }).end().
        forEach(this.data.authors, function(a) {
          var total = 0, allTotal = 0;
          if ( ! authorCounts[a[0]] ) return;
          this.start('tr').
            enableClass('selected', self.selection$.map(s => s === a[0])).
            start('th').
              start('href').
                on('click', () => {
                  if ( self.selection == a[0] ) {
                    self.isHardSelection = ! self.isHardSelection;
                  } else {
                    self.selection = a[0];
                  }
                }).
                on('mouseover', () => { if ( ! self.isHardSelection ) self.selection = a[0]; }).
                add(a[0]).
              end().
            end().
            forEach(authorCounts[a[0]], function(c, i) {
              total += c;
              allTotal += allAuthorCounts[a[0]][i];
              this.start('td').add(c || '-').call(function() {
                if ( ! self.data.showPercentages ) return;
                if ( c )
                  this.add(' / ', (100*c/allAuthorCounts[a[0]][i]).toFixed(0) + '%');
              }).end();
            }).
            start('th').
              add(total).
              call(function() {
                if ( ! self.data.showPercentages ) return;
                if ( total )
                  this.add(' / ', (100*total/allTotal).toFixed(0) + '%');
              }).
            end().
          end();
        }).
        start('tr').
          start('th').on('click', () => self.selection = '-- All --').add('All:').end().
          forEach(counts, function(c, i) {
            this.start('th').add(c).call(function() {
              if ( ! self.data.showPercentages ) return;
              if ( c )
                this.add(' / ', (100*c/allCounts[i]).toFixed(0) + '%');
            }).end();
          }).
          start('th').add(this.data.filteredCommits.length).call(function() {
            if ( ! self.data.showPercentages ) return;
            this.add(' / ', (100*self.data.filteredCommits.length/self.data.commits.length).toFixed(0) + '%');
          }).end().
        end().
      end();
    }
  ],

  listeners: [
    {
      name: 'updateSelection',
      isIdled: true,
      delay: 160,
      on: [ 'this.propertyChange.selection' ],
      code: function() { this.data.author = this.selection; }
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.gitlog.Commit',
    'foam.demos.gitlog.UserMonthView'
  ],

  exports: [ 'file' ],

  css: `
    ^ th { text-align: left; }
    ^ .selected { background: lightskyblue; }
    .foam-u2-TextField { margin-bottom: 14px }
  `,

  constants: {
    IGNORE_CONTAINS: [
      'Add test',
      'broken build',
      'Cleanup',
      'fix build',
      'Fix build',
      'fix spacing',
      'Fix spacing',
      'fix syntax error',
      'foam peg',
      'Foam peg',
      'FOAM peg',
      'FOAM Peg',
      'Merge release',
      'merge',
      'Peg  foam',
      'peg -foam',
      'peg dev',
      'peg foam',
      'peg FOAM',
      'Peg foam',
      'Peg FOAM',
      'peg master',
      'peg nwe foam',
      'peg to foam',
      'Peg to foam',
      'peg to matching foam',
      'peg to',
      'pege foam',
      'peged',
      'pegFoam',
      'Pegged to dev foam',
      'pegged',
      'Pegged',
      'pegging',
      'Pegging',
      'pegMaster',
      'Release-',
      'remove peg',
      'Repeg  foam',
      'REPEG foam',
      'Repeg master',
      'repeg',
      'Repeg',
      'revert',
      'Revert',
      'Small fix',
      'spacing fixes',
      'typo',
      ' -> ',
      'v4.',
      '4.',
      'v2.',
    ],
    IGNORE_EQUALS: [
      'foam',
      'Merged dev',
      'faom',
      'foam again',
      'foam2',
      'formatting',
      'master foam',
      'update version',
      'Add comment.',
      'Add space',
      'added space',
      'adding spaces',
      'cleanup',
      'Cleanup',
      'Fix indentation.',
      'fix space',
      'fix spaces',
      'fixing pr',
      'format',
      'Formatting.',
      'Formatting',
      'Indentation.',
      'Peg to foam',
      'Peg to mcv foam',
      'peg',
      'remove extra space',
      'Remove extra space',
      'Remove space.',
      'remove space',
      'Remove unused code.',
      'removed a space',
      'Sort exports.',
      'space',
      'Spacing.',
      'syntax error',
      'Updating FOAM',
      'Updating version numbers',
      'Update FOAM peg',
      'Update FOAM Peg',
      'Updated.',
      'spacing',
    ],
    AUTHOR_MAP: {
      'dependabot[bot]': 'dependabot[bot]',
      'Mritunjay Chauhan': 'Mritunjay Chauhan',
      'Mritunjay': 'Mritunjay Chauhan',
      'mritunjay51': 'Mritunjay Chauhan',
      'kiana-nanopay': 'Kiana Omoerah',
      'Kiana Omoerah': 'Kiana Omoerah',
      'Bipin': 'Bipinjot Kaur',
      'BipinjotKaur': 'Bipinjot Kaur',
      'Bipinjot Kaur': 'Bipinjot Kaur',
      'Adam Fox': 'Adam Fox',
      'Alexey Greer': 'Alexey Greer',
      'AlexeyGreer': 'Alexey Greer',
      'Anna Doulatshahi': 'Anna Doulatshahi',
      'Anna': 'Anna Doulatshahi',
      'Arthur Pavlovs': 'Arthur Pavlovs',
      'Artur Linnik': 'Artur Linnik',
      'Blake Green': 'Blake Green',
      'blakegreen': 'Blake Green',
      'Carl Chen': 'Carl Chen',
      'carl-zzz': 'Carl Chen',
      'Chanmann Lim': 'Chanmann Lim',
      'Christine Lee': 'Christine Lee',
      'Christine': 'Christine Lee',
      'Danny Tharma': 'Danny Tharma',
      'Eric Dube': 'Eric Dube',
      'Eric': 'Eric Dube',
      'garfield jian': 'Garfiled Jian',
      'Garfield Jian': 'Garfiled Jian',
      'Garfiled Jian': 'Garfiled Jian',
      'Hassene Choura': 'Hassene Choura',
      'hchoura': 'Hassene Choura',
      'Jin Jung': 'Jin Jung',
      'Jin': 'Jin Jung',
      'JIn': 'Jin Jung',
      'jinn9': 'Jin Jung',
      'Joel Hughes': 'Joel Hughes',
      'Kenny Qi Yen Kan': 'Kenny Qi Yen Kan',
      'KernelDeimos': 'Eric Dube',
      'Kevin Glen Roy Greer': 'Kevin Greer',
      'Kevin Greer': 'Kevin Greer',
      'Kristina Smirnova': 'Kristina Smirnova',
      'kristina': 'Kristina Smirnova',
      'Lenore Chen': 'Lenore Chen',
      'LenoreChen': 'Lenore Chen',
      'Mahimaa Jayaprakash': 'Mahimaa Jayaprakash',
      'Mahimaa': 'Mahimaa Jayaprakash',
      'Mayowa Olurin': 'Mayowa Olurin',
      'mayowa': 'Mayowa Olurin',
      'mcarcaso': 'Mike Carcasole',
      'Michael Magahey': 'Michael Magahey',
      'Michal Pasternak': 'Michal Pasternak',
      'Michal': 'Michal Pasternak',
      'microArtur': 'Artur Linnik',
      'Mike Carcasole': 'Mike Carcasole',
      'Mike': 'Michael Magahey',
      'Minsun Kim': 'Minsun Kim',
      'MINSUN KIM': 'Minsun Kim',
      'Minsun': 'Minsun Kim',
      'Moorthy Rathinasamy': 'Moorthy Rathinasamy',
      'moorthy': 'Moorthy Rathinasamy',
      'Moorthy': 'Moorthy Rathinasamy',
      'Mykola Kolombet': 'Mykola Kolombet',
      'Mykola97': 'Mykola Kolombet',
      'nanoArtur': 'Artur Linnik',
      'nanokristina': 'Kristina Smirnova',
      'nanoMichal': 'Michal Pasternak',
      'nanoNeel': 'Neel Patel',
      'nanopay-arthur': 'Arthur Pavlovs',
      'nanopay-moorthy': 'Moorthy Rathinasamy',
      'Nauna': 'Anna Doulatshahi',
      'Neel Patel': 'Neel Patel',
      'Neelkanth Patel': 'Neel Patel',
      'Nicholas Prat': 'Nick Prat',
      'Nick Prat': 'Nick Prat',
      'noodlemoodle': 'Ruby Zhang',
      'Olha Bahatiuk': 'Olha Bahatiuk',
      'olhabn': 'Olha Bahatiuk',
      'Patrick Zanowski': 'Patrick Zanowski',
      'penzital': 'Kristina Smirnova',
      'Pete Conway': 'Pete Conway',
      'petenanopay': 'Pete Conway',
      'Rachael Ding': 'Rachael Ding',
      'RachaelDing': 'Rachael Ding',
      'Ruby Zhang': 'Ruby Zhang',
      'Ruby': 'Ruby Zhang',
      'Sarthak Marwaha': 'Sarthak Marwaha',
      'sarthakmarwaha55': 'Sarthak Marwaha',
      'sarthak-marwaha': 'Sarthak Marwaha',
      'sarthak': 'Sarthak Marwaha',
      'Scott Head': 'Scott Head',
      'Tala Abu Adas': 'Tala Abu Adas',
      'tala': 'Tala Abu Adas',
      'Tala': 'Tala Abu Adas',
      'Xuerong Wu': 'Xuerong Wu',
      'Xuerong': 'Xuerong Wu',
      'xuerongNanopay': 'Xuerong Wu',
      'yij793': 'Garfiled Jian'
    },
    PROJECT_RULES: [
      {
        name: 'Hybrid-Blockchain',
        keywords: [ 'saf', 'storeandforward', 'replay', 'crypt', 'medusa', 'socket', 'compact' ],
        paths: [ 'cluster' ]
      },
      {
        name: 'NANOS',
        keywords: [ 'genjava', 'genjs', 'pomsplit', 'memento', 'graphbuilder', 'wizardlet' ],
        paths: [ 'analytic', 'xsd', 'src/foam/xsd', 'foam/graph', 'foam/foobar' ]
      },
      {
//        name: 'Core',
        name: 'NANOS',
        keywords: [ 'fscript' ],
        paths: [ ]
      },
      {
        name: 'Application',
        keywords: [ 'afex' ],
        paths: [ 'rbc', 'afex', 'invoice', 'android', 'deployment', 'nanopay/auth', 'nanopay/admin', 'ticket', 'dashboard', 'bepay', 'billing', 'i18n', 'exchange', 'creditengine', 'compliance', 'treviso', 'bmo', 'flinks', 'onboarding', 'intuit', 'marqeta', 'cards', 'transfer', 'partner', 'interac', 'scotiabank', 'payroll', 'bank', 'reporting' ]
      },
      {
//        name: 'U2/U3',
name: 'NANOS',
        keywords: [ 'initE' ],
        paths: [ 'u2', 'xsd', 'comics', 'foamdev' /* ??? for 2022 only */ ]
      },
      {
        name: 'Hybrid-Blockchain',
        keywords: [ 'medusa', 'dao', 'json', 'mlang' ],
        paths: [ 'medusa', 'dao', 'box', 'foam/net', 'mlang', 'formatter', 'json', 'Linked', 'util', 'SMF' ]
      },
      {
//        name: 'Core',
        name: 'NANOS',
        keywords: [ ],
        paths: [ 'core', 'pattern' ]
      },
      {
        name: 'Application',
//         name: 'Approval',
        keywords: [ 'approval' ],
        paths: [ ]
      },
      {
//        name: 'Performance ',
        name: 'Hybrid-Blockchain',
        keywords: [ 'pm', 'performance', 'bench' ],
        paths: [ 'pm', 'concurrent' ]
      },
      {
//        name: 'CRUNCH',
        name: 'NANOS',
        keywords: [ 'crunch', 'capab' ],
        paths: [ 'crunch' ]
      },
      {
        name: 'NANOS',
        keywords: [ 'nanos' ],
        paths: [ 'nanos', 'dashboard', 'parse', 'Email', 'foam/java', 'src/cronjobs', 'src/regions', 'src/services', 'doc/guides' ]
      },
      {
//        name: 'U2/U3',
        name: 'NANOS',
        keywords: [ 'view', 'u3', 'u2', 'demo', 'example' ],
        paths: [ 'u2', 'demo', 'layout', 'google/flow', 'phonecat' ]
      }
    ]
  },

  properties: [
    {
      class: 'Array',
      name: 'authors',
      factory: function() {
        var authors = { '-- All --': this.commits.length };
        this.commits.forEach(c => this.incr(authors, c.author));
        return Object.keys(authors).sort().map(a => [a, a + ' ' + authors[a]]);
      }
    },
    {
      class: 'Int',
      name: 'year',
      value: '2021',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: [
          [0, '-- All --'], [ 2021, '2021' ], [ 2022, '2022' ], [ 2023, '2023' ]
        ]}, X);
      }
    },
    {
      class: 'String',
      name: 'author',
      value: '-- All --',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.authors}, X);
      }
    },
    {
      class: 'Array',
      name: 'projects',
      factory: function() {
        var projects = { '-- All --': this.commits.length };
        this.commits.forEach(c => this.incr(projects, c.project || '-- Unknown --'));
        return Object.keys(projects).sort().map(a => [a, a + ' ' + projects[a]]);
      }
    },
    {
      class: 'String',
      name: 'project',
      value: '-- All --',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.projects}, X);
      }
    },
    {
      class: 'Array',
      name: 'files',
      factory: function() {
        var files = { '/': this.commits.length };
        this.commits.forEach(c => c.files.forEach(f => this.incr(files, f)));
        return Object.keys(files).sort().map(a => [a, a + '      ' + files[a]]);
      }
    },
    {
      class: 'String',
      name: 'file',
      value: '/',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.files}, X);
      }
    },
    {
      class: 'Array',
      name: 'paths',
      factory: function() {
        var files = { '/': this.commits.length };
        this.commits.forEach(c => c.files.forEach(f => this.incr(files, this.fileToPath(f))));
        return Object.keys(files).sort().map(a => [a, a + '      ' + files[a]]);
      }
    },
    {
      class: 'String',
      name: 'path',
      value: '/',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.paths}, X);
      }
    },
    {
      class: 'String',
      name: 'query',
      // view: 'foam.u2.SearchField',
      preSet: function(o, n) { return n.toLowerCase(); },
      onKey: true
    },
    {
      class: 'Boolean',
      name: 'showPercentages'
    },
    {
      class: 'Boolean',
      name: 'embedFiles'
    },
    {
      name: 'data',
      factory: function() { return []; }
    },
    { class: 'Boolean', name: 'isHardSelection' },
    {
      class: 'FObjectProperty',
      of: 'foam.demos.gitlog.Commit',
      name: 'selection',
      view: 'foam.demos.gitlog.CommitDetailView'
    },
    {
      name: 'commits',
      expression: function(data) {
        var d2 = data.
          filter(c => {
            for ( var i = 0 ; i < this.IGNORE_CONTAINS.length ; i++ ) {
              if ( c.subject.indexOf(this.IGNORE_CONTAINS[i]) != -1 ) return false;
            }
            return true;
          }).
          filter(c => {
            for ( var i = 0 ; i < this.IGNORE_EQUALS.length ; i++ ) {
              if ( c.subject === this.IGNORE_EQUALS[i] ) return false;
            }
            return true;
          }).
          map(c => { c.files = c.files.map(s => s.trim()); return c; }).
          map(c => { c.author = this.AUTHOR_MAP[c.author] || 'UNKNOWN: "' + c.author + '"'; return c; }).
          map(c => {
            var subject = c.subjectLC = c.subject.toLowerCase();
            this.PROJECT_RULES.forEach(r => {
              if ( c.project ) return;
//              if ( r.name === 'NANOS' || r.name === 'Hybrid-Blockchain' ) r.name = 'SR&ED';
              for ( var i = 0 ; i < r.keywords.length ; i++ ) {
                var keyword = r.keywords[i];
                if ( subject.indexOf(keyword) != -1 ) {
                  c.project = r.name;
                  return;
                }
              }
              for ( var i = 0 ; i < r.paths.length ; i++ ) {
                var path = r.paths[i];
                for ( var j = 0 ; j < c.files.length ; j++ ) {
                  var file = c.files[j];
                  if ( file.indexOf(path) != -1 ) {
                    c.project = r.name;
                    return;
                  }
                }
              }
            });

            return c;
          });

          d2.sort((a, b) => foam.Date.compare(a.date, b.date));

          return d2;
      }
    },
    {
      name: 'filteredCommits',
      expression: function(commits, query, file, path, project) {
        return commits.filter(c => this.match(c, query, '-- All --', file, path, project));
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      // TODO: make this configurable
      this.loadYear(2023);
    },

    function loadYear(year) {
      this.loadData(`data/data${year}.log`);
      this.loadData(`data/np${year}.log`);
    },

    function loadData(f) {
      fetch(f)
      .then(r => r.text())
      .then(t => this.parseLog(t));
    },

    function parseLog(t) {
      var data  = [];
      var state = 0;
      var lines = t.split('\n');
      var commit;
      t = null;
      for ( var i = 0 ; i < lines.length ; i++ ) {
        var line = lines[i];
        if ( state == 0 ) {
          if ( line.startsWith('commit ') ) {
            commit = this.Commit.create({id: line.substring(7)});
            data.push(commit);
          } else if ( line.startsWith('Author: ') ) {
            commit.author = line.substring(8, line.indexOf('<')).trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          } else if ( line.startsWith('Date: ') ) {
            commit.date = new Date(line.substring(6).trim());
            i++;
            state = 1;
          }
        } else if ( state == 1 ) {
          if ( line.startsWith('diff') ) {
            state = 2;
          } else if ( line.startsWith('commit') ) {
            state = 0;
            i--;
          } else {
            if ( ! commit.subject ) {
              commit.subject = line.trim();
            } else {
              commit.body += (commit.body.length ? '\n' : '') + line.trim();
            }
          }
        } else if ( state == 2 ) {
          if ( line.startsWith('commit') ) {
            state = 0;
            i--;
          } else {
            if ( line.startsWith('+++ b/') && ! line.startsWith('+++ b/.') ) {
              commit.files.push(line.substring(6));
            }
            commit.diff += (line.length ? '\n' : '') + line.trim();
          }
        }
      }
      this.data    = this.data.concat(data);
      this.authors = this.files = this.projects = undefined;
    },

    function match(commit, query, author, file, path, project) {
      if ( project === '-- Unknown --' ) project = undefined;

      return ( author === '-- All --' || author === commit.author ) &&
        ( query === '' || commit.subjectLC.indexOf(query) != -1 ) &&
        ( file === '/' || commit.files.some(f => f === file) ) &&
        ( path === '/' || commit.files.some(f => f.startsWith(path)) ) &&
        ( project === '-- All --' || commit.project === project )
        ;
    },

    function fileToPath(file) {
      var i = file.lastIndexOf('/');
      if ( i == -1 ) return '/';
      return file.substring(0, i);
    },

    function incr(map, key) {
      /** Increment counter for key in map of keys->counts. **/
      map[key] = (map[key] || 0) + 1;
    },

    function render() {
      var self = this;
      this.commits$.sub(function() {
        self.projects = self.files = self.paths = self.authors = undefined;
        self.removeAllChildren();
        self.render_();
      });
      this.commits;
    },

    function render_() {
      var self = this;

      this.
        addClass(this.myClass()).
        start('h2').add('GitLog').end().

        start().
          style({display: 'flex'}).
          start().
            style({width: '25%', 'padding-right': '60px'}).
            call(function() { self.searchPane.call(this, self); }).
          end().
          start().
            style({width: '75%', 'padding-left': '60px'}).
            add(this.slot(function (filteredCommits, showPercentages) {
              return self.UserMonthView.create({data: self}, self);
            })).
          end().
        end().

        br().
        tag('hr').

        start().
          style({display: 'flex'}).
          start().
            style({width: self.embedFiles$.map(e => e ? '80%' :'50%'), height: '100vh', padding: '10px', 'overflow-y': 'scroll'}).
            call(function() { self.commitTable.call(this, self); }).
          end().
          start().
//            hide(self.embedFiles$).
            style({width: self.embedFiles$.map(e => e ? '20%' :'50%'), height: '100vh', padding: '10px', 'overflow-y': 'scroll'}).
            start(this.SELECTION).end().
          end().
        end();
      ;
    },

    function searchPane(self) {
      this.start('').
//        add('Year: ',             self.YEAR).br().
        add('Keyword: ',          self.QUERY).br().
        add('Project: ',          self.PROJECT).br().
        add('File: ',             self.FILE).br().
        add('Path: ',             self.PATH).br().
        add('Show Percentages: ', self.SHOW_PERCENTAGES).br().
        add('Embed Files: ',      self.EMBED_FILES).br().
      end();
    },

    function commitTable(self) {
      this.start('table').attrs({cellpadding: '4px'}).style({'width': '100%'}).
        start('tr').
          start('th').add('Commit').end().
          start('th').add('Date').end().
          start('th').add('Author').end().
          start('th').add('Project').end().
          start('th').add('Subject').end().
          start('th').show(self.embedFiles$).add('Files').end().
        end().forEach(self.commits, function(d) {
          var href = 'https://github.com/kgrgreer/foam3/commit/' + d.id;
          this.start('tr').
            enableClass('selected', self.selection$.map(s => { return s && s === d; })).
            on('click', () => {
              if ( d == self.selection ) {
                self.isHardSelection = ! self.isHardSelection;
              } else {
                self.selection = d;
              }
            }).
            on('mouseover', () => { if ( ! self.isHardSelection ) self.selection = d; }).
            show(self.slot(function(query, author, file, path, project) {
              return self.match(d, query, author, file, path, project);
            })).
            start('td').start('a').attrs({href: href}).add(d.id.substring(0,8)).end().end().
            start('td').style({'white-space': 'nowrap'}).add(d.date.toISOString().substring(0,10)).end().
            start('td').style({'white-space': 'nowrap'}).
              start('a').attrs({href:'#'}).on('click', () => self.author = d.author).add(d.author).
              end().
            end().
            start('td').style({'white-space': 'nowrap'}).
              start('a').attrs({href:'#'}).on('click', () => self.project = d.project).add(d.project).
              end().
            end().
            start('td').tag({class: 'foam.demos.gitlog.CommitMessageView', data: d.subject}).end().
            start('td').show(self.embedFiles$).forEach(d.files, function(f) { this.add(f).br(); }).end().
          end();
        }).
      end();
    }
  ]
});
