parsefbp
========

Simple parser for .fbp notation written in JavaScript, generating JSON 

Definition
---

For information about the grammar supported by ParseFBP, see `http:\\www.jpaulmorrison.com\fbp\CppFBP.shtml#freespec`.

As of now, I believe this parser handles correct .fbp files correctly.  Error handling has to be improved - this will happen gradually over the next little while.

Technology
---

This parser uses the "Babel" technology which I have been using since the 1960s, and have ported to every language I've ever worked with (except maybe PL/I).  There is a description of it in `docs/BabelParser.txt`.  

`babelparser.js` contains a number of functions, such as a test for alpha (`ta`), a test for white space (`tb`), and a test for characters allowed in process names (`tv`).  In the code I have not used the term "universal comparator", but the IMO more natural `copy` and `skip`. 

The generated JSON follows the convention established for NoFlo.

Running Parser
---

Run `html\ParseFBP.html` using your favorite browser (it's been tested under Firefox).

This will display a text area, and a button.  Copy the .fbp text into the text area, and hit the button.

The generated JSON will be displayed as a document - it can be copy/pasted to any destination you wish. If someone knows how to write to an actual file, perhaps they could let me know, or sign on as a collaborator.
