# CPU Register Transfer and Microoperation Simulator

A beginner-friendly, browser-based educational simulator that demonstrates how a simple 8-bit CPU register bank and ALU work.

## Features
- Four 8-bit registers: R0, R1, R2 and R3.
- Decimal, 8-bit binary and hexadecimal representations.
- Load values, register-to-register transfer, and individual/all-register clearing.
- Addition, subtraction, increment and decrement with modulo-256 wraparound.
- Bitwise AND, OR, XOR and 8-bit NOT.
- Dynamic RTL notation, ALU display and CPU architecture highlighting.
- Operation history with date and time.
- Input validation, success/error messages and responsive layout.
- No backend, database, API key, build step or framework.

## Technologies
HTML5, CSS3 and vanilla JavaScript.

## Project structure
```text
CPU-Register-Transfer-Simulator/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   ├── registers.js
│   ├── operations.js
│   └── history.js
├── assets/
│   └── images/
├── README.md
└── LICENSE
```

## 8-bit arithmetic
All stored values are unsigned and range from 0 to 255. Results are reduced modulo 256:
- `255 + 1 = 0` (overflow)
- `0 - 1 = 255` (underflow)

The operation history marks arithmetic wraparound in the RTL entry.

## Example workflow
1. In **Load**, set R1 to 15.
2. Set R2 to 3.
3. In **Arithmetic**, choose Addition, inputs R1 and R2, destination R3.
4. Execute. R3 becomes 18, and the RTL is `R3 ← R1 + R2`.
5. Try `R0 ← R1 AND R2` in the Logical panel.

## Screenshots

<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/5517adec-203a-46fb-877c-c08628106062" />


## Educational note
This project is a simplified model for learning register transfer and microoperations. It is not a cycle-accurate processor emulator.
