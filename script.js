document.addEventListener('DOMContentLoaded', () => {
    // Calculator state
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let operationSymbol = '';
    let resetInput = false;
    const calculationHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

    // DOM elements
    const currentInputDisplay = document.getElementById('currentInput');
    const currentOperationDisplay = document.getElementById('currentOperation');
    const historyPanel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');
    const overlay = document.getElementById('overlay');
    const errorMessage = document.getElementById('errorMessage');
    const historyBtn = document.getElementById('history');

    // Button elements
    const numberButtons = document.querySelectorAll('.btn-number');
    const operatorButtons = document.querySelectorAll('.btn-operator');
    const clearButton = document.getElementById('clear');
    const backspaceButton = document.getElementById('backspace');
    const equalsButton = document.getElementById('equals');
    const decimalButton = document.getElementById('decimal');
    const closeHistoryButton = document.getElementById('closeHistory');
    const clearHistoryButton = document.getElementById('clearHistory');
    const closeErrorButton = document.getElementById('closeError');

    // Initialize display
    updateDisplay();

    // Number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.textContent;
            if (currentInput === '0' || resetInput) {
                currentInput = number;
                resetInput = false;
            } else {
                currentInput += number;
            }
            updateDisplay();
        });
    });

    // Operator buttons
    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newOperation = button.id;
            operationSymbol = getOperationSymbol(newOperation);

            if (operation && !resetInput) {
                compute(false);
            } else if (!operation) {
                previousInput = currentInput;
            }

            operation = newOperation;
            resetInput = true;
            updateDisplay();
        });
    });

    // Decimal button
    decimalButton.addEventListener('click', () => {
        if (resetInput) {
            currentInput = '0.';
            resetInput = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    });

    // Clear button
    clearButton.addEventListener('click', () => {
        currentInput = '0';
        previousInput = '';
        operation = null;
        operationSymbol = '';
        updateDisplay();
    });

    // Backspace button
    backspaceButton.addEventListener('click', () => {
        if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }
        updateDisplay();
    });

    // Equals button
    equalsButton.addEventListener('click', () => {
        if (operation) {
            compute(true);
        }
    });

    // History button
    historyBtn.addEventListener('click', () => {
        showHistoryPanel();
    });

    // Close history panel
    closeHistoryButton.addEventListener('click', () => {
        hideHistoryPanel();
    });

    // Clear history
    clearHistoryButton.addEventListener('click', () => {
        calculationHistory.length = 0;
        localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));
        renderHistory();
    });

    // Close error message
    closeErrorButton.addEventListener('click', () => {
        errorMessage.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Compute function
    function compute(showResult) {
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

        if (isNaN(prev)) return;

        switch (operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    showError();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        if (showResult) {
            const historyEntry = `${previousInput} ${operationSymbol} ${currentInput} = ${computation}`;
            calculationHistory.unshift(historyEntry);

            if (calculationHistory.length > 10) {
                calculationHistory.pop();
            }

            localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));

            currentOperationDisplay.textContent = historyEntry;
            currentInput = computation.toString();
            previousInput = '';
            operation = null;
            operationSymbol = '';
            resetInput = true;

            renderHistory();
        } else {
            previousInput = computation.toString();
            currentInput = '0';
            resetInput = true;
        }

        updateDisplay();
    }

    // Update display
    function updateDisplay() {
        currentInputDisplay.textContent = currentInput;

        if (operation) {
            currentOperationDisplay.textContent = `${previousInput} ${operationSymbol}`;
        } else if (!previousInput) {
            currentOperationDisplay.textContent = '';
        }
    }

    // Show history panel
    function showHistoryPanel() {
        historyPanel.style.display = 'block';
        overlay.style.display = 'block';
        renderHistory();
    }

    // Hide history panel
    function hideHistoryPanel() {
        historyPanel.style.display = 'none';
        overlay.style.display = 'none';
    }

    // Render history list
    function renderHistory() {
        historyList.innerHTML = '';

        if (calculationHistory.length === 0) {
            historyList.innerHTML = '<div class="history-item">No history yet</div>';
            return;
        }

        calculationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item;
            historyList.appendChild(historyItem);
        });
    }

    // Show error message
    function showError() {
        errorMessage.style.display = 'block';
        overlay.style.display = 'block';
        currentInput = '0';
        previousInput = '';
        operation = null;
        operationSymbol = '';
        updateDisplay();
    }

    // Get operation symbol
    function getOperationSymbol(op) {
        switch (op) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }
document.addEventListener('keydown', (e) => {
  // Prevent default for calculator keys to avoid unintended behavior
  if (/[0-9+\-*/.=]|Enter|Escape|Backspace/.test(e.key)) {
    e.preventDefault();
  }

  // Map keys to button IDs
  const keyMap = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide',
    '.': 'decimal', '=': 'equals', 'Enter': 'equals',
    'Escape': 'clear', 'Backspace': 'backspace'
  };

  const buttonId = keyMap[e.key];
  if (buttonId) {
    document.getElementById(buttonId).click(); // Trigger the button click
  }
});

clearButton.addEventListener('click', () => {
  currentInputDisplay.textContent = "Cleared!";
  setTimeout(() => {
    currentInput = '0';
    previousInput = '';
    operation = null;
    updateDisplay();
  }, 1000);
});

});