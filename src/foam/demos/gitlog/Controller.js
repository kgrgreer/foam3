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
    {
      name: 'id'
    },
    {
      class: 'String',
      name: 'author'
    },
    {
      class: 'Date',
      name: 'date'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'body'
    },
    {
      class: 'StringArray',
      name: 'files'
    },
    {
      class: 'String',
      name: 'diff'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'CommitDetailView',
  extends: 'foam.u2.View',

  css: `
  `,

  methods: [
    function render() {
      this.recall(function(data) {
        // this.add('data: ', data);
        if ( ! data ) return;
        this.
//        add('Hash: ', data.id).br().br().
        start('b').add(data.subject).end().br().br().
        start('p').add(data.body).end().br().br().
        add('Files: ').br().forEach(data.files,
          function(f) {
            this.start('a').attrs({href:'#'}).on('click', () => self.file = f).add(f).end().br();
          }
        ).br().br().
        add('Diff:  ').br().start('div').style({'white-space': 'pre'}).add(data.diff).end();
      });
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
    ^ .selected { color: red; }
  `,

  methods: [
    function render() {
      var self         = this;
      var commits      = this.data.filteredCommits;
      var counts       = [0,0,0,0,0,0,0,0,0,0,0,0];
      var authorCounts = {};

      commits.forEach(c => {
        var month   = c.date.getMonth();
        var author  = c.author;
        var aCounts = authorCounts[author] || ( authorCounts[author] = [0,0,0,0,0,0,0,0,0,0,0,0] );
        counts[month]++;
        aCounts[month]++;
      });

      this.addClass(this.myClass()).start('table')
        .attrs({cellpadding: 4, cellspacing: 0, border: 1}).
        start('tr').
          start('th').add('Author').end().
          start('th').add('Jan').end().
          start('th').add('Feb').end().
          start('th').add('Mar').end().
          start('th').add('Apr').end().
          start('th').add('May').end().
          start('th').add('Jun').end().
          start('th').add('July').end().
          start('th').add('Aug').end().
          start('th').add('Sept').end().
          start('th').add('Oct').end().
          start('th').add('Nov').end().
          start('th').add('Dec').end().
          start('th').add('').end().
        end().
        forEach(this.data.authors, function(a) {
          var total = 0;
          if ( ! authorCounts[a[0]] ) return;
          this.start('tr').
            enableClass('selected', self.data.author$.map(auth => auth == a[0])).
            start('th').
              start('href').on('click', () => self.data.author = a[0]).add(a[0]).end().
            end().
            forEach(authorCounts[a[0]], function(c) {
              total += c;
              this.start('td').add(c || '-').end();
            }).
            start('th').add(total).end().
          end();
        }).
        start('tr').
          start('th').on('click', () => self.data.author = '-- All --').add('All:').end().
          forEach(counts, function(c) {
            this.start('th').add(c).end();
          }).
          start('th').add(this.data.filteredCommits.length).end().
        end().
      end();
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.gitlog.UserMonthView'
  ],

  exports: [
  ],

  css: `
    tr:hover { background: lightskyblue; }
    .foam-u2-TextField { margin-bottom: 14px }
  `,

  constants: {
    IGNORE_CONTAINS: [
      'merge',
      'Revert',
      'fix syntax error',
      'Cleanup',
      "Small fix",
      'Add test',
      'broken build',
      'fix build',
      'Fix build',
      'typo',
      'Fix spacing',
      'spacing fixes',
      'fix spacing',
      'Merge release',
      'Release-',
      'revert'
    ],
    IGNORE_EQUALS: [
      'space',
      'fix spaces',
      'fix space',
      'remove space',
      'removed a space',
      'Remove space.',
      'Remove extra space',
      'Add space',
      'added space',
      'adding spaces',
      'Updated.',
      'Formatting',
      'Formatting.',
      'Cleanup',
      'cleanup',
      'remove extra space',
      'Add comment.',
      'Spacing.',
      'Sort exports.',
      'Fix indentation.',
      'fixing pr',
      'syntax error',
      'format',
      'Remove unused code.',
      'Indentation.'
    ],
    AUTHOR_MAP: {
      'Adam Fox': 'Adam Fox',
      'Arthur Pavlovs': 'Arthur Pavlovs',
      'Blake Green': 'Blake Green',
      'Carl Chen': 'Carl Chen',
      'Chanmann Lim': 'Chanmann Lim',
      'Christine Lee': 'Christine Lee',
      'Danny Tharma': 'Danny Tharma',
      'Jin Jung': 'Jin Jung',
      'Joel Hughes': 'Joel Hughes',
      'Kenny Qi Yen Kan': 'Kenny Qi Yen Kan',
      'Kristina Smirnova': 'Kristina Smirnova',
      'Mayowa Olurin': 'Mayowa Olurin',
      'Mykola Kolombet': 'Mykola Kolombet',
      'Nick Prat': 'Nick Prat',
      'Olha Bahatiuk': 'Olha Bahatiuk',
      'Patrick Zanowski': 'Patrick Zanowski',
      'Scott Head': 'Scott Head',
      "Kevin Greer": "Kevin Greer",

      'Anna': 'Anna Doulatshahi',
      'blakegreen': 'Blake Green',
      'carl-zzz': 'Carl Chen',
      'Christine': 'Christine Lee',
      'Eric Dube': 'Eric Dube',
      'Eric': 'Eric Dube',
      'garfield jian': 'Garfiled Jian',
      'hchoura': 'Hassene Choura',
      'Jin': 'Jin Jung',
      'JIn': 'Jin Jung',
      'jinn9': 'Jin Jung',
      'kristina': 'Kristina Smirnova',
      'mcarcaso': 'Mike Carcasole',
      'Michal': 'Michal Pasternak',
      'microArtur': 'Artur Linnik',
      'MINSUN KIM': 'Minsun Kim',
      'Minsun': 'Minsun Kim',
      'Mykola97': 'Mykola Kolombet',
      'nanoArtur': 'Artur Linnik',
      'nanokristina': 'Kristina Smirnova',
      'nanoMichal': 'Michal Pasternak',
      'nanoNeel': 'Neel Patel',
      'Nauna': 'Anna Doulatshahi',
      'Neelkanth Patel': 'Neel Patel',
      'Nicholas Prat': 'Nick Prat',
      'noodlemoodle': 'Ruby Zhang',
      'RachaelDing': 'Rachael Ding',
      'Ruby': 'Ruby Zhang',
      'sarthak-marwaha': 'Sarthak Marwaha',
      'sarthak': 'Sarthak Marwaha',
      'tala': 'Tala Abu Adas',
      'Tala': 'Tala Abu Adas',
      'xuerongNanopay': 'Xuerong Wu',
      'yij793': 'Garfiled Jian',
      "Kevin Glen Roy Greer": "Kevin Greer",
      "nanopay-arthur": 'Arthur Pavlovs',
      "olhabn": 'Olha Bahatiuk',
    },
    PROJECT_RULES: [
      {
        name: 'Hybrid-Blockchain',
        keywords: [ 'medusa', 'dao', 'json', 'mlang' ],
        paths: [ 'medusa', 'dao', 'box', 'net', 'mlang', 'formatter', 'json', 'Linked', 'util' ]
      },
      {
        name: 'Core',
        keywords: [ ],
        paths: [ 'core', 'pattern' ]
      },
      {
        name: 'Approval',
        keywords: [ 'approval' ],
        paths: [ ]
      },
      {
        name: 'Performance ',
        keywords: [ 'pm', 'performance', 'bench' ],
        paths: [ 'pm', 'concurrent' ]
      },
      {
        name: 'CRUNCH',
        keywords: [ 'crunch', 'capab' ],
        paths: [ 'crunch' ]
      },
      {
        name: 'NANOS',
        keywords: [ 'nanos' ],
        paths: [ 'nanos', 'dashboard', 'parse', 'Email', '.jrl', 'java', 'src/cronjobs', 'src/regions', 'src/services', 'doc/guides' ]
      },
      {
        name: 'U2/U3',
        keywords: [ 'view', 'u3', 'u2', 'demo', 'example' ],
        paths: [ 'u2', 'demo', 'layout', 'comics', 'google/flow', 'phonecat' ]
      },
      /*
      {
        name: '',
        keywords: [ ],
        paths: [ ]
      },
      */
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
          [0, '-- All --'], [ 2021, '2021' ], [ 2022, '2022' ]
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
      },
      view: 'foam.u2.view.ChoiceView',
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
value: 'kgr',
      // view: 'foam.u2.SearchField',
      preSet: function(o, n) { return n.toLowerCase(); },
      onKey: true
    },
    {
      name: 'data',
      factory: function() { return []; }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.demos.gitlog.Commit',
      name: 'selected',
      view: 'foam.demos.gitlog.CommitDetailView',
      postSet: function(_, c) { console.log('selected: ', c); }
    },
    {
      name: 'commits',
      expression: function(data) {
        return data.
          reverse().
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
          map(c => { c.author = this.AUTHOR_MAP[c.author] || 'UNKNOWN: ' + c.author; return c; }).
          map(c => {
            var subject = c.subjectLC = c.subject.toLowerCase();
            this.PROJECT_RULES.forEach(r => {
              if ( c.project ) return;
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
            /*
            {
              name: '',
              keywords: [ ],
              paths: [ ]
            },
            */
            return c;
          });
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
      this.loadData('data2021.log');
      /*
      this.loadData('foam2021.log');
      this.loadData('np2021.log');
      */
    },
    function loadData(f) {
      fetch(f)
      .then(r => r.text())
      .then(t => this.parseLog(t));
    },
    function parseLog(t) {
      var data = [];
      var state  = 0;
      var lines  = t.split('\n');
      var commit;
      t = null;
      for ( var i = 0 ; i < lines.length ; i++ ) {
        var line = lines[i];
        if ( state == 0 ) {
          if ( line.startsWith('commit ') ) {
            commit = { id: line.substring(7), subject: '', body: '', diff: '', files: [] };
            data.push(commit);
          } else if ( line.startsWith('Author: ') ) {
            commit.author = line.substring(8, line.indexOf('<')).trim();
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
            if ( line.startsWith('+++ ') ) {
              commit.files.push(line.substring(6));
            }
            commit.diff += (line.length ? '\n' : '') + line.trim();
          }
        }
      }
      this.data = this.data.concat(data);
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
        start('h2').add('GitLog').end().
        start('span').
          style({float: 'left', 'padding-right': '40px', 'max-width': '50%'}).
          add('Year: ', this.YEAR).
          br().
          add('Keyword: ', this.QUERY).
          br().
          add('Project: ', this.PROJECT).
          br().
          add('File: ', this.FILE).
          br().
          add('Path: ', this.PATH).
        end().
        add(this.slot(function (filteredCommits) {
          return self.UserMonthView.create({data: self}, self);
        })).
        br().
        call(this.commitTable.bind(this)).
        tag('hr').
        br().br().
        add(this.SELECTED).br().br().tag('hr');
      ;
    },

    function commitTable() {
      var self = this;
      this.start('table').attrs({cellpadding: '4px'}).style({'width': '100%', 'padding-top': '40px'}).
        start('tr').
          start('th').add('Commit').end().
          start('th').add('Date').end().
          start('th').add('Author').end().
          start('th').add('Project').end().
          start('th').add('Subject').end().
        end().forEach(this.commits, function(d) {
          var href = 'https://github.com/kgrgreer/foam3/commit/' + d.id;
          this.start('tr').
            on('mouseover', () => self.selected = d).
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
            start('td').add(d.subject).end().
          end();
        }).
      end();
    }
  ],

  actions: [
  ]
});
