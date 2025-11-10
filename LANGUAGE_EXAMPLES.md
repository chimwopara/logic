# 🌐 Multi-Language Challenge Examples

This document demonstrates how the AI generates challenges for different programming languages, each with language-specific syntax, conventions, and distractors.

## Example: "Create a function to calculate factorial"

### 🔷 C Language Challenge
```json
{
  "goal": "Create a function to calculate factorial of a number",
  "language": "C",
  "sequence": [
    {
      "correct": "#include <stdio.h>",
      "distractors": [
        {"text": "#include <math.h>", "reason": "math.h not needed for basic factorial"},
        {"text": "#import <stdio.h>", "reason": "C uses #include, not #import"}
      ],
      "explanation": "Include standard I/O for printf"
    },
    {
      "correct": "int factorial(int n) {",
      "distractors": [
        {"text": "void factorial(int n) {", "reason": "Should return the factorial value"},
        {"text": "factorial(int n) {", "reason": "Missing return type"}
      ],
      "explanation": "Function declaration returning int"
    }
  ]
}
```

### 🐍 Python Language Challenge
```json
{
  "goal": "Create a function to calculate factorial of a number",
  "language": "Python",
  "sequence": [
    {
      "correct": "def factorial(n):",
      "distractors": [
        {"text": "function factorial(n):", "reason": "Python uses 'def', not 'function'"},
        {"text": "def factorial(n)", "reason": "Missing colon after function declaration"}
      ],
      "explanation": "Define function using def keyword"
    },
    {
      "correct": "    if n <= 1:",
      "distractors": [
        {"text": "if n <= 1:", "reason": "Missing indentation in Python"},
        {"text": "    if (n <= 1):", "reason": "Parentheses not needed in Python if statements"}
      ],
      "explanation": "Base case with proper indentation"
    },
    {
      "correct": "        return 1",
      "distractors": [
        {"text": "    return 1", "reason": "Incorrect indentation level"},
        {"text": "        return 1;", "reason": "Python doesn't use semicolons"}
      ],
      "explanation": "Return base case value"
    }
  ]
}
```

### ☕ Java Language Challenge
```json
{
  "goal": "Create a function to calculate factorial of a number",
  "language": "Java",
  "sequence": [
    {
      "correct": "public class Factorial {",
      "distractors": [
        {"text": "class Factorial {", "reason": "Public classes should be declared public"},
        {"text": "public Factorial {", "reason": "Missing 'class' keyword"}
      ],
      "explanation": "Declare public class"
    },
    {
      "correct": "    public static int factorial(int n) {",
      "distractors": [
        {"text": "    public int factorial(int n) {", "reason": "Should be static for utility method"},
        {"text": "    static factorial(int n) {", "reason": "Missing return type"}
      ],
      "explanation": "Static method declaration"
    },
    {
      "correct": "        if (n <= 1) {",
      "distractors": [
        {"text": "        if n <= 1 {", "reason": "Java requires parentheses for conditions"},
        {"text": "        if (n <= 1)", "reason": "Missing opening brace"}
      ],
      "explanation": "Conditional statement with braces"
    }
  ]
}
```

### 🟨 JavaScript Challenge
```json
{
  "goal": "Create a function to calculate factorial of a number",
  "language": "JavaScript",
  "sequence": [
    {
      "correct": "function factorial(n) {",
      "distractors": [
        {"text": "def factorial(n) {", "reason": "JavaScript uses 'function', not 'def'"},
        {"text": "factorial(n) => {", "reason": "Arrow function syntax would be 'const factorial = (n) => {'"}
      ],
      "explanation": "Function declaration"
    },
    {
      "correct": "    if (n <= 1) {",
      "distractors": [
        {"text": "    if n <= 1 {", "reason": "JavaScript requires parentheses for conditions"},
        {"text": "    if (n <= 1):", "reason": "JavaScript uses braces, not colons"}
      ],
      "explanation": "Conditional statement"
    },
    {
      "correct": "        return 1;",
      "distractors": [
        {"text": "        return 1", "reason": "JavaScript best practice includes semicolons"},
        {"text": "        return;", "reason": "Must return a value"}
      ],
      "explanation": "Return base case"
    }
  ]
}
```

### ➕ C++ Challenge
```json
{
  "goal": "Create a function to calculate factorial of a number",
  "language": "C++",
  "sequence": [
    {
      "correct": "#include <iostream>",
      "distractors": [
        {"text": "#include <stdio.h>", "reason": "iostream is preferred in C++"},
        {"text": "import iostream", "reason": "C++ uses #include"}
      ],
      "explanation": "Include iostream for C++ I/O"
    },
    {
      "correct": "using namespace std;",
      "distractors": [
        {"text": "using std;", "reason": "Must specify 'namespace' keyword"},
        {"text": "namespace std;", "reason": "Missing 'using' keyword"}
      ],
      "explanation": "Use standard namespace"
    },
    {
      "correct": "int factorial(int n) {",
      "distractors": [
        {"text": "auto factorial(int n) {", "reason": "auto can't deduce return type here"},
        {"text": "factorial(int n) {", "reason": "Missing return type"}
      ],
      "explanation": "Function returning int"
    }
  ]
}
```

## 🎯 Key Differences by Language

### Syntax Differences
- **C/C++**: Semicolons, braces, #include
- **Python**: Colons, indentation, no semicolons
- **Java**: Everything in classes, semicolons, System.out
- **JavaScript**: Optional semicolons, var/let/const, console.log

### Common Distractors
Each language has specific wrong answers that make sense:
- **C**: Mixing with C++ (cout instead of printf)
- **Python**: Forgetting colons or indentation
- **Java**: Missing 'public' or 'static' keywords
- **JavaScript**: Confusing with Python (def) or Java syntax
- **C++**: Mixing with C (printf instead of cout)

### Indentation Patterns
- **C/C++/Java/JS**: Uses indent levels (0, 1, 2, etc.)
- **Python**: Indentation is syntax-critical (4 spaces)

## 🔧 How It Works

1. User selects their desired language in the dropdown
2. AI generates challenge with language-specific:
   - Correct syntax for that language
   - Common mistakes for that language
   - Appropriate libraries/imports
   - Language-specific best practices
3. The interface updates to show the selected language
4. Challenge loads in logicbody.html with proper formatting

## 📝 Notes

- The system is **NOT** just converting to C
- Each language gets authentic syntax and idioms
- Distractors are language-appropriate mistakes
- The AI understands language-specific patterns
- The interface dynamically shows the current language

This ensures learners get authentic practice in their chosen language!
