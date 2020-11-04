const { instructions } = require("../instructions");
const { psuedoinstructions } = require('./psuedoinstructions')
const fs = require('fs');
const { createMemory } = require("../createMemory");
const { parse } = require("path");
const { getMemory, setMemory } = require("../handleMemory");

// The assembled file is only valid as long as new instructions are not introduced,
// as the assembler implements a 2-byte checksum for instructions
var insArray = instructions.array;

// Very simplistic, but it works
var checksum = 0;
insArray.forEach(instruction => {
    for (let i = 0; i < instruction.length; i++) {
        checksum += instruction[i].charCodeAt() % 10;
    }
});

if (process.argv.length != 4) {
    console.log('Usage: node assembler.js input.asm out.bin');
    process.exit(1);
}

// Handle the input file
var inputfd = fs.openSync(process.argv[2], 'r');
// Read the entire file as a string
var inputFile = fs.readFileSync(inputfd, { encoding: 'utf-8' });
// Close the input file
fs.close(inputfd, () => { });

// Open the output file for later handling
outputfd = fs.openSync(process.argv[3], 'w');

// Write the checksum to the file
checksumMem = createMemory(2);
checksumMem.setUint16(0, checksum);
fs.writeSync(outputfd, checksumMem);

var inputLines = inputFile.split('\n');
var linecount = inputLines.length;

var labels = {};
var labelReferences = [];

// Pre-parsing of labels
for (let i = 0; i < inputLines.length; i++) {
    let line = inputLines[i];
    let label;

    if (line.match(/^([A-Z]|[a-z])+:$/)) {
        label = line.replace(":", "")
    } else continue;
    labels[label] = {};
}


// Main assembly
var assembledInstructionCount = 0;
for (let i = 0; i < inputLines.length; i++) {
    let line = inputLines[i];

    // Initialize variables
    let opcode, operand;

    // Skip line comments
    if (line.match(/\/\/.*($)*/) || line.match(/\;.*($)*/)) continue;

    // Split the line into tokens
    let tokens = line.split(' ');

    // Possible opcode or label
    // Zeroth token on line
    let instructionIndex = insArray.indexOf(tokens[0]); // Index of the token if it's in the instruction array.
    if (instructionIndex != -1) { // True Instructions
        opcode = instructionIndex;
    } else if (psuedoinstructions[tokens[0]]) { // Pseudo-instructions
        let replaceInstructions = psuedoinstructions[tokens[0]]
        // Loop through and replace the "%" keys with the second token of the pseudo-instruction
        // There is no guarantee that the second token is a valid opcode, this could result in
        // code being invalid and having weird interactions
        // TODO, maybe implement a function to validate opcode tokens
        for (let j = 0; j < replaceInstructions.length; j++) replaceInstructions[j] = replaceInstructions[j].replace("%", tokens[1]);
        // Add the modified instructions
        inputLines.splice(i, 1, ...replaceInstructions);
        // Re-parse the instruction
        i--;
        continue;
    } else if (line.match(/^([A-Z]|[a-z])+:$/)) { // Label
        // The label is alone on the line
        // Add it to the labels object
        tokens[0] = tokens[0].replace(":", "");
        // Every assembled instruction is 2 bytes, therefore labels' locations in memory
        // can be calculated by multiplying the assembled instruction count by 2
        // Label values are not zero-indexed
        labels[tokens[0]] = (assembledInstructionCount * 2) + 1;
        // Skip to the next line
        continue;
    } else {
        console.log(`Undefined instruction \"${tokens[0]}\".`);
        console.log("Skipping line.");
        continue;
    }

    // Operand
    // Only parsed if there was a valid opcode found
    // "Hnnn" or "Xnnn", nnn is hexadecmial number
    // "Dnnn", nnn is a decimal number
    // "Onnn", nnn is an octal number
    // "Tnnn", nnn is a ternary number
    // "Bnnn", nnn is a binary number
    // "$", current byte offset in assembled code
    if (tokens[1] && tokens[1].match(/^(H|X|D|O|T|B)([0-9])+$/)) { // Immediate
        let base;
        // Hexadecimal
        if (tokens[1].match(/^(H|X)([0-9])+$/)) base = 16;
        // Decimal
        else if (tokens[1].match(/^D([0-9])+$/)) base = 10;
        // Octal
        else if (tokens[1].match(/^O([0-9])+$/)) base = 8;
        // Ternary
        else if (tokens[1].match(/^T([0-9])+$/)) base = 3;
        // Binary
        else if (tokens[1].match(/^B([0-9])+$/)) base = 2;
        // Convert the number 
        operand = parseInt(tokens[1].replace(/(H|X|D|O|T|B)/, ''), base);
    } else if (tokens[1] && labels[tokens[1].replace(":", "")]) { // Label
        // labelReference locations should be zero-indexed, as they are later used to edit values
        labelReferences.push({
            location: (assembledInstructionCount * 2) + 1,
            label: tokens[1].replace(":", "")
        });
        operand = 0;
    } else if (tokens[1] == "$") { // Current line
        // Every instruction is two bytes
        // Plus 1 to point to the current instruction
        operand = (assembledInstructionCount * 2) + 1;
    } else if (tokens[1] == "^") { // To be used only by the CALL instruction
        // Every instruction is two bytes, plus two instructions of the CALL
        // Plus 1 to point to the instruction after
        operand = ((assembledInstructionCount + 2) * 2) + 1
    }
    // Checking
    if (isNaN(operand) || operand > 255) {
        if (tokens[1]) console.log(`Invalid operand \"${tokens[1]}\" on line ${i + 1}.`);
        else console.log(`No operand provided with instruction \"${tokens[0]}\".`);
        console.log("Operand must be a number in the range of [0, 255], \"$\" to reference the current location, or a valid label.")
        console.log("Skipping line.");
        continue;
    }
    // Writing to file
    let raw = createMemory(2);
    raw.setUint8(0, opcode);
    raw.setUint8(1, operand);
    fs.writeSync(outputfd, raw);

    // Update assembledInstructionCount
    assembledInstructionCount++;
};

// Post-assembly label handling
for (let i = 0; i < labelReferences.length; i++) {
    let loc = labelReferences[i].location;
    let ab = new ArrayBuffer(1);
    let val = new DataView(ab);
    setMemory(val, 0, labels[labelReferences[i].label]);
    // Location + 2 to account for the two byte checksum
    fs.writeSync(outputfd, val, 0, 1, loc + 2);
}

// Finalize and close the output file
console.log(`Assembly completed, assembled ${assembledInstructionCount} instructions from ${linecount} lines.`);
fs.close(outputfd, () => { });