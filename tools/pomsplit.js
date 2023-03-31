require('../src/foam_node.c');

const path_ = require('path');
const fs_ = require('fs').promises;

var [argv, X, flags] = require('./processArgs.c')(
  '',
  { pom: 'pom' },
  { debug: true, java: false, web: true }
);

foam.require(X.pom, false, true);

foam.CLASS({
    package: 'foam.tools',
    name: 'PomSplit',

    constants: [
        {
            name: 'FILES_TOP_REGEX',
            value: /^\s*files:\s*\[\s*$/
        },
        {
            name: 'FILES_END_REGEX',
            value: /^\s*\],?\s*$/
        }
    ],

    properties: [
        {
            class: 'String',
            name: 'packagePrefix',
            adapt: function (_, n) {
                return n.replace(/\./g, '/');
            }
        },
        {
            class: 'String',
            name: 'sourcePom',
            adapt: function (_, n) {
                return path_.resolve(n);
            }
        },
        {
            class: 'String',
            name: 'targetPom',
            adapt: function (_, n) {
                return path_.resolve(n);
            }
        }
    ],

    methods: [
        async function execute () {
            const lines = (await fs_.readFile(this.sourcePom)).toString().split('\n');

            const { keptLines, movedLines } = this.splitEntries_(lines);

            await fs_.writeFile(this.sourcePom, keptLines.join('\n'));
            await fs_.writeFile(this.targetPom, movedLines.join('\n'));
        },
        function splitEntries_(lines) {
            const keptLines = [];
            const movedLines = [];

            this.addHeader_(movedLines);

            const STATE_SCAN = 0;
            const STATE_FILES = 1;

            let state = STATE_SCAN;

            for ( const line of lines ) {
                if ( state == STATE_SCAN ) {
                    keptLines.push(line);
                    if ( line.match(this.FILES_TOP_REGEX) ) {
                        state = STATE_FILES;
                    }
                    continue;
                }
                if ( state == STATE_FILES ) {
                    if ( line.match(this.FILES_END_REGEX) ) {
                        state = STATE_SCAN;
                        keptLines.push(line);
                        continue;
                    }

                    // We will parse this line as FOAM cON
                    let obj = line;
                    if ( line.match(/,\s*$/) ) {
                        obj = line.slice(0, line.lastIndexOf(','));
                    }
                    obj = foam.con.parseString(obj);

                    if ( obj.name.startsWith(this.packagePrefix) ) {
                        const lineNoPrefix = line.replace(this.packagePrefix + '/', '');
                        movedLines.push(lineNoPrefix);
                        continue;
                    }

                    keptLines.push(line);
                }
            }

            const lastLine = movedLines[movedLines.length - 1];
            if ( lastLine.match(/,\s*$/) ) {
                movedLines[movedLines.length - 1] =
                    lastLine.slice(0, lastLine.lastIndexOf(','));
            }

            this.addFooter_(movedLines);

            return { keptLines, movedLines };
        },
        function addHeader_(lines) {
            lines.push(
                'foam.POM({',
                `  name: "${this.packagePrefix.replace(/\//g, '-')}",`,
                '  version: 1,',
                '  files: [',
            );
        },
        function addFooter_(lines) {
            lines.push(
                '  ]',
                '});',
            );
        }
    ]
});

const PROPS = foam.tools.PomSplit.getAxiomsByClass(foam.core.Property);

const prop = str => `\x1B[36;1m<${foam.String.labelize(str)}>\x1B[0m`;
const DOC_ARGS = PROPS.map(p => '<' + foam.String.labelize(p.name) + '>').join(' ');
const DOCUMENTATION = `pom.c file splitter

\x1B[31;1musage: node pomsplit.c ${DOC_ARGS}\x1B[0m

This tool will move entries from ${prop('sourcePom')} that begin with
${prop('packagePrefix')} into a new file called ${prop('targetPom')}.

Note: this tool uses a line-by-line analysis instead of cON parsing or
javascript execution so that the format of the original file may be
preserved.`

if ( argv.length < 3 ) {
    console.log(DOCUMENTATION);
    process.exit(1);
}

const args = {};
for ( let i = 0 ; i < PROPS.length ; i++ ) args[PROPS[i].name] = argv[i];
const tool = foam.tools.PomSplit.create(args);

tool.execute();
