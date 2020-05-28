#!/bin/sh +x
#java -jar MutAPK-0.0.1.jar /calendula.apk es.usc.citius.servando.calendula mutants/ extra/ . true 1
cd MutAPK
rm -Rf operators.properties
rm -Rf operators

touch operators
echo $4 >> operators

touch operators.properties
sed s/,/\\n/g operators >> operators.properties

rm -Rf mutants
mkdir mutants
java -jar MutAPK-0.0.1.jar /$1 $2 mutants/ extra/ . true $3
