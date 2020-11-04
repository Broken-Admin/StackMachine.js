// When psuedo-instructions are parsed "%" is replaced
// with the operand of the psuedo-instruction

psuedoinstructions = {
    // Basic
    "NOT": ["PUSH D255", "XOR D0"],
    "NOR": ["OR D0", "PUSH D255", "NOT D0"],
    "NAND": ["AND D0", "PUSH D255", "NOT D0"],
    "NEG": ["NOT D0", "PUSH D1", "ADD D0"],
    "SUB": ["NEG D0", "ADD D0"],
    // Subroutines
    "CALL": ["PUSH ^", "JMP %"],
    "RET": ["IPC D0"]
};

module.exports.psuedoinstructions = psuedoinstructions;