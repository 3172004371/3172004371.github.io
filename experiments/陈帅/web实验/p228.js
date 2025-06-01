// 定义3个变量：字符串型、数值型、布尔型
var stringVar = "Hello, World!";
var numberVar = 42;
var booleanVar = true;

// 使用document.write()输出变量的值
document.write("String Variable: " + stringVar + "<br>");
document.write("Number Variable: " + numberVar + "<br>");
document.write("Boolean Variable: " + booleanVar + "<br>");

// 定义两个数值型变量并计算它们相加和相乘的结果
var num1 = 5;
var num2 = 10;
var sum = num1 + num2;
var product = num1 * num2;

document.write("Sum of " + num1 + " and " + num2 + ": " + sum + "<br>");
document.write("Product of " + num1 + " and " + num2 + ": " + product + "<br>");

// 定义两个数值型变量x和y，并使用if语句判断x是否大于y
var x = 100;
var y = 90;

if (x > y) {
    alert("true");
}

// 使用for循环语句循环输出20以内的奇数
document.write("Odd numbers less than 20: ");
for (var i = 1; i < 20; i += 2) {
    document.write(i + " ");
}
