
// Copy 'E' out of root context for convenience.
var E = foam.__context__.E.bind(foam.__context__);


var tabs = Tabs.create().
  start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
  start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
  start(Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end();

tabs.write();

E('br').write();
E('br').write();


Card.create().add('content').tag('br').add('more content').tag('br').add('even more conent').write();


E('br').write();
E('br').write();

var sb = SampleBorder.create({title: 'Title', footer: 'Footer'});
sb.add('content');
sb.write();

E('br').write();
E('br').write();


var sb = LabelledSection.create({title: 'Title'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();


var sb = SideLabelledSection.create({title: 'Title'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();


var sb = FoldingSection.create({title: 'Title'}).style({width: '500px'});
sb.add('content').br().add('more content');
sb.write();



E('br').write();
E('br').write();

var sb = MDFoldingSection.create({title: 'Title'}).style({width: '500px'});
sb.add('MD FoldingSection content').br().add('more content');
sb.write();



E('br').write();
E('br').write();


var split = SampleSplitContainer.create();
split.write();
split.leftPanel.add('leftContent');
split.rightPanel.add('rightContent');



E('br').write();
E('br').write();
E('br').write();

var blink = Blink.create();
blink.add('blinking');
blink.write();



E('br').write();
E('br').write();


var cols = E().
  start(Columns).
    start(Column).add('column 1 contents').end().
    start(Column).add('column 2 contents').br().add('and more content').end().
  end().
  start(Columns).
    start(Column).add('column 1 contents').end().
    start(Column).add('column 2 contents').br().add('and more content').end().
    start(Column).add('column 3 contents').br().add('and more content').end().
  end().
  start(Tabs).
    start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
    start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
    start(Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end().
  end().
  start(foam.u2.Tabs).
    start(foam.u2.Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
    start(foam.u2.Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
    start(foam.u2.Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end().
  end().
  start(Tabs).
    start(Tab, {label: 'Tab 1'}).add('tab 1 contents').end().
    start(Tab, {label: 'Tab 2'}).add('tab 2 contents').end().
    start(Tab, {label: 'Tab 3'}).add('Even more contents in tab 3').end().
  end();
cols.write();
