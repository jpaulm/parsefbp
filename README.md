parsefbp
========

Simple parser for .fbp notation written in JavaScript, generating JSON 

General
---

As of now, I believe this parser handles correct .fbp files correctly.  Error handling has been improved, but will be subject to further improvement as time goes on. 

Definition
---

The free-form alternative notation, an early form of which is described briefly in Chapter 23 of the 1st edition of "Flow-Based Programming" (Chap. 22 of the 2nd), basically follows a "flow" style, where connections can be chained together until a process is encountered that has no output ports connected.  This constitutes the end of a "clause", and is indicated by a comma or end-of-line. 

Here is an (partial) example:

    'data.fil'->OPT Reader(THFILERD) OUT -> IN Selector(THSPLIT) MATCH -> ... ,
      Selector NOMATCH -> ...

The general syntax for free-form network definitions is quite simple, and can be shown as follows (using a variant of the notation which has started to become popular for defining syntax):  
  
![SyntaxDiagram](https://github.com/jpaulm/parsefbp/blob/master/docs/Threads.gif "Syntax Diagram")

"EOL" ("end of line") indicates the alternative NoFlo convention for "end of clause". The mark above "EOL" is meant to be a comma.

Other symbols:

- "Proc-name" represents a process name, optionally followed by the component name (in round brackets), optionally followed by a question mark to indicate that tracing is desired.  The component name can be specified on any occurrence of the process name. 
- "Conn" represent an arrow, with optional capacity (in round brackets), e.g. `(30)`
- "IIP" represents a quoted string (using single quotes) - any internal quotes must be escaped
- "Up-port" and "down-port" are from the point of view of the connection - they could also be called "output port" and "input port", respectively.

Note: Neither the question mark nor the capacity value are currently being used to generate code in the JSON output.
 
The main network may be followed by one or more subnets, which have basically the same notation (each one starting with a label and
finishing with a semi-colon). However, subnets have to have additional notation describing how their external port names relate to their internal ones. Since this association is like an equivalence, we use the symbol `=>` to indicate
this relationship. Thus, 

    port-name-1 => port-name-2 process-A port-name-3,
    
indicates that `port-name-1` is an external input port of the subnet, while `port-name-2` is the corresponding input port of process-A. Similarly,

    port-name-1 process-A port-name-2 => port-name-3,
    
indicates that `port-name-3` is an external output port of the subnet, while `>port-name-2` is the corresponding output port of process-A. 

The NoFlo `INPORT=` and `OUTPORT=` symbols are currently ignored.

Technology
---

This parser uses the "Babel" technology which I have been using since the 1960s, and have ported to every language I've ever worked with (except maybe PL/I).  There is a description of it in https://github.com/jpaulm/parsefbp/blob/master/docs/BabelParser.md .  

`babelparser.js` contains a number of functions, such as a test for alpha (`ta`), a test for white space (`tb`), and a test for characters allowed in process names (`tv`).  In the code I have not used the term "universal comparator", but the IMO more natural `copy` and `skip`. 

The generated JSON follows the convention established for NoFlo.

Running Parser
---

Run `html\ParseFBP.html` using your favorite browser (it's been tested under Firefox).

This will display a text area, and a button.  Copy the .fbp text into the text area, and hit the button.

The generated JSON will be displayed as a document - it can be copy/pasted to any destination you wish. If someone knows how to write to an actual file, perhaps they could let me know, or sign on as a collaborator.
