parsefbp
========

Simple parser for .fbp notation written in JavaScript, generating JSON 

Technology
---

This parser uses the "Babel" technology which I have been using since the 1960s, and have ported to every language I've ever worked with (except maybe PL/I).  There is a description of it in `docs/BabelParser.txt`.  

`babelparser.js` contains a number of functions, such as test for alpha (`ta`), test for white space (`tb`), test for characters allowed in process names (`tv`).  In have not used the term "universal comparator", but the IMO more natural `copy` and `skip`. 

Also, end-of-line does not trigger a callback - this application did not need it.

Running Parser
---

Run `html\ParseFBP.html` using your favorite browser (it's been tested under Firefox).

This will display a text area, and a button.  Copy the .fbp text into the text area, and hit the button.

The generated JSON will be displayed as a document - it can be copy/pasted to any destination you wish.
