/**
 * @fileoverview space between statements
 * @author Shrey
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/exploded-statements');
const RuleTester = require('eslint').RuleTester;
RuleTester.setDefaultConfig({
    parserOptions:
    {
        ecmaVersion: 2015
    }
});

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run('space-around-if-condition', rule, {

    valid: [
        {
            code: 'if ( test == "test" ) { }'
        },
        {
            code: 'while ( test == "test" ) { }'
        },
        {
          code: 'for ( i = 0; i < 10; i++ ) { }'
        },
        {
          code: 'switch ( i ) { }'
        },
        {
          code: 'do { } while ( i )'
        },
        {
          code: 'for ( i in a ) { }'
        },
        {
          code: 'for ( i of a ) { }'
        }
    ],

    invalid: [
        {
            code: 'if (test=="test" ) { }',
            errors: [{
                message: 'One space required after "if ("',
                type: 'IfStatement'
            }]
        },
        {
            code: 'if ( test=="test") { }',
            errors: [{
                message: 'One space required before closing "if ( )',
                type: 'IfStatement'
            }]
        },
        {
            code: 'while ( test=="test") { }',
            errors: [{
                message: 'One space required before closing "while ( )"',
                type: 'WhileStatement'
            }]
        },
        {
            code: 'while (test=="test" ) { }',
            errors: [{
                message: 'One space required after "while ("',
                type: 'WhileStatement'
            }]
        },
        {
          code: 'for (i = 0; i < 10; i++ ) { }',
          errors: [{
              message: 'One space required after "for ("',
              type: 'ForStatement'
          }]
        },
        {
          code: 'for ( i = 0; i < 10; i++) { }',
          errors: [{
              message: 'One space required before closing "for ( )"',
              type: 'ForStatement'
          }]
        },
        {
          code: 'switch ( i) { }',
          errors: [{
              message: 'One space required before closing "switch ( )"',
              type: 'SwitchStatement'
          }]
        },
        {
          code: 'switch (i ) { }',
          errors: [{
              message: 'One space required after "switch ("',
              type: 'SwitchStatement'
          }]
        },
        {
          code: 'do { } while (test ) { }',
          errors: [{
              message: 'One space required after "do { } while ("',
              type: 'DoWhileStatement'
          }]
        },
        {
            code: 'do { } while ( test) { }',
            errors: [{
                message: 'One space required before closing "do { } while ( )"',
                type: 'DoWhileStatement'
            }]
        },
        {
          code: 'for (i in a ) { }',
          errors: [{
              message: 'One space required after "for ("',
              type: 'ForInStatement'
          }]
        },
        {
          code: 'for ( i in a) { }',
          errors: [{
              message: 'One space required before closing "for ( )"',
              type: 'ForInStatement'
          }]
        },
        {
          code: 'for (i of a ) { }',
          errors: [{
              message: 'One space required after "for ("',
              type: 'ForOfStatement'
          }]
        },
        {
          code: 'for ( i of a) { }',
          errors: [{
              message: 'One space required before closing "for ( )"',
              type: 'ForOfStatement'
          }]
        },
    ]
});
