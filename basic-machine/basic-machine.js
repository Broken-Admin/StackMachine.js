const { getMemory } = require('../handleMemory.js');
const { CPU, createCPU, createMemory, handleMemory, instructions, arrayToDataView, stackToArray } = require('./grouping.js');
const fs = require('fs');

class BasicMachine {
    constructor(instructionsArray, inputBuffer, fileChecksum, memoryPadding) {
        this.inputBuffer = inputBuffer;
        this.instructionsArray = instructionsArray;
        this.fileChecksum = fileChecksum;
        this.memoryPadding = memoryPadding;
    }

    bufferToArrayBuffer(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    generateChecksum() {
        let checksum = 0;
        this.instructionsArray.forEach(instruction => {
            for (let i = 0; i < instruction.length; i++) {
                checksum += instruction[i].charCodeAt() % 10;
            }
        });
        return (checksum);
    }

    // Returns true upon validation, false upon devalidation
    validateChecksum() {
        if (this.generateChecksum() == this.fileChecksum) return (true);
        else return (false);
    }

    initialize() {
        let totalLength = this.inputBuffer.length + memoryPadding;
        if (!this.validateChecksum()) {
            console.log("File checksum does not match generated checksum.");
            console.log("Please re-assemble the assembly file due to the updated instructions.");
            console.log("Exiting...");
            process.exit(1);
        }
        this.memoryBuffer = Buffer.concat([this.inputBuffer, Buffer.from(Array.from(''.padStart(this.memoryPadding)))]);
        this.memoryArrayBuffer = this.bufferToArrayBuffer(this.memoryBuffer);
        this.memoryDataView = new DataView(this.memoryArrayBuffer);
        this.cpu = new CPU(this.memoryDataView);
    }

    prepareIO() {
        this.eventHandler = this.cpu.getEventHandler();
        this.outputBuffer = [];
        this.logBuffer = [];
        this.specialCharacters = [
            '{', '}',
            '[', ']',
            ' ', '\n',
            '\\', '\/',
            '_', '-',
            '+', '=',
            '!', '@',
            '$', '%',
            '^', '&',
            '*', '?',
            '<', '>',
            ';', ':',
            ',', '.',
            '`', '~',
            '|'
        ];
        this.eventHandler.on("OUT", value => {
            // The log buffer is output upon the machine halting.
            if (value == 255) {
                let temp = [];
                this.outputBuffer.map((val) => {
                    if ((val >= 65 /*A*/ && val <= 90 /*Z*/) || (val >= 97 /*a*/ && val <= 122 /*z*/) || this.specialCharacters.indexOf(character) != -1) {
                        temp.push(String.fromCharCode(val));
                    }
                });
                this.logBuffer.push(temp.join(''));
                return (0);
            }
            if (value == 254) {
                // Push the actual values to the buffer
                this.outputBuffer.map((val) => {
                    this.logBuffer.push(val.toString(10));
                });
            }
            this.outputBuffer.push(value);

            // Otherwise, possibly do some memory operations or etc.
        });
    }

    run() {
        for (let step = 0; true; step++) {
            console.log(`Step ${step}.`);
            if (this.cpu.step() < 0) {
                console.log("\nExecution halted.");
                break;
            }
            console.log(`BP: ${this.cpu.bp}\nSP: ${this.cpu.sp}`);
            console.log(`PC: ${this.cpu.pc}`);
            console.log("Memory contents:", stackToArray(this.cpu));
            // Trailing newline
            console.log();
        }
    }
}

if ((process.argv.length != 3 && process.argv.length != 4)) {
    console.log('Usage: node basic-machine.js program.bin [memorypadding]');
    process.exit(1);
}

// Open file
inputfd = fs.openSync(process.argv[2]);
// Prepare checksum buffer
let fileChecksumAb = new ArrayBuffer(2);
let fileChecksumView = new DataView(fileChecksumAb);
fs.readSync(inputfd, fileChecksumView, 0, 2);
let fileChecksum = fileChecksumView.getUint16(0);

let memoryPadding;
if (process.argv.length == 4 && !isNaN(Number(process.argv[3]))) memoryPadding = Number(process.argv[3]);
else memoryPadding = 64;

let inputData = fs.readFileSync(inputfd);
fs.close(inputfd, () => { });

let machine = new BasicMachine(instructions.array, inputData, fileChecksum, memoryPadding);
machine.initialize();
machine.prepareIO();
machine.run();

console.log("\nMachine Output:");
machine.logBuffer.forEach(message => {
    console.log(message);
});