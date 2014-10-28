var fbpscan = require('./fbpscan');

var t = "Diagram: A1(xxx/aaa) OUT-> (20) IN B\*3(yyy/bbb)  OUT ->  IN[2] C_A(ccc),\n";
t += "'xxxxxxxxxxxxyyyyy' -> IN B\*3 OUT -> in[3]  C_A  \n";
t += "'23' -> PARAM A1 #comment...\n";
t += " #another comment xxx yyy \n";
t += "A1 OUT[2] -> IN X(www);";

fbpscan(t);
