instructions = {
    array: [
        "NOP", // No operand
        "HLT", // Halt operation

        // Stack manipulations
        "PUSH", // One operand
        "POP", // No operand
        "RTT", // Rotate to top, the top-most item on the stack becoming the bottom-most, the second to top becoming top, no operand
        "RTB", // Rotate to bottom, the bottom-most item on the stack becoming the top-most, the top-most item becoming the bottomno operand

        // Operations upon items on the stack
        "ADD", // Addition
        "MUL", // Multiplication
        "DIV", // Division
        "EXP", // Exponential
        "SQR", // Square Root
        "DUP", // Duplicate top item
        "SHR", // Bitshift top item right, second-to-top times
        "SHL", // Bitshift top item left, second-to-top times

        // Subroutines
        "IPC", // Pop the top item off the stack and store assign it to the PC
        // The rest of the subroutine code can be implemented as psuedo-instructions

        // Control flow manipulations
        "JMP", // Unconditional jump, one operand
        "JRE", // Unconditional jump relative, one operand
        "JEZ", // Conditional jump, when top item on stack is equal one
        "JGZ", // Conditional jump, when top item on stack is more than one
        "JFS", // Jump from stack, perform a type of above jump by popping the top item on the stack for a value, the operand 0 to 3 describing the type of jump, one operand

        // Logical operations upon items on the stack
        "AND",
        "OR",
        "XOR",

        // I/O operations
        "IN", // Read from input buffer
        "OUT" // Pop and output top item on stack via an event
    ],
    object: {}
};

// I'd prefer to use an enum, but JavaScript does not seem to support them.

module.exports.instructions = instructions;