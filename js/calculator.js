// calculator.js
document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('calculator-display');
    const buttons = document.querySelectorAll('.calc-btn');
    const specialChars = ['%', '*', '/', '-', '+', '=', 'AC', 'DEL'];
    let output = '';

    // 计算函数
    const calculate = (btnValue) => {
        display.focus();

        if (btnValue === "=" && output !== "") {
            // 计算结果，处理百分比
            try {
                output = eval(output.replace("%", "/100")).toString();
            } catch (error) {
                output = "错误";
            }
        } else if (btnValue === "AC") {
            // 清除所有
            output = "";
        } else if (btnValue === "DEL") {
            // 删除最后一个字符
            output = output.toString().slice(0, -1);
            if (output === "") output = "0";
        } else {
            // 普通数字和运算符处理
            // 允许在空输入框时添加数字
            if (output === "" && !specialChars.includes(btnValue)) {
                output = btnValue;
            } else if (output !== "" || specialChars.includes(btnValue)) {
                output += btnValue;
            }
        }

        // 确保显示不为空
        display.value = output || "0";
    };

    // 按钮点击事件
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const btnValue = e.target.dataset.value || e.target.parentElement.dataset.value;
            calculate(btnValue);
        });
    });

    // 支持键盘输入 - 仅在输入框聚焦时生效
    const handleKeydown = (e) => {
        if (document.activeElement !== display) return; // 焦点不在输入框时不处理

        const key = e.key;
        if (/[0-9+\-*/.%=]/.test(key) || key === 'Backspace' || key === 'Escape') {
            e.preventDefault();
            if (key === 'Backspace') {
                calculate('DEL');
            } else if (key === 'Escape') {
                calculate('AC');
            } else if (key === '=') {
                calculate('=');
            } else if (key === '.') {
                // 处理小数点
                if (!output.includes('.') || specialChars.includes(output.slice(-1))) {
                    calculate(key);
                }
            } else {
                calculate(key);
            }
        } else if (key === 'Enter') {
            // 支持Enter键作为等号
            e.preventDefault();
            calculate('=');
        }
    };

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeydown);

    // 限制输入框只能输入数字和小数点
    window.restrictInput = function() {
        // 保留现有逻辑或根据需要修改
        let value = display.value;
        // 只允许数字、运算符和小数点
        value = value.replace(/[^0-9+\-*/.%]/g, '');
        // 确保不会以运算符开头，除了减号（作为负号）
        if (/^[+\-*/.%]/.test(value) && value[0] !== '-') {
            value = value.substring(1);
        }
        display.value = value;
        output = value;
    };
});