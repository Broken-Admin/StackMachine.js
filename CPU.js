const { setMemory, getMemory } = require('./handleMemory.js');
const { instructions } = require('./instructions');
const EventEmitter = require('events');

class CPU {
    // Last in, first out stack which grows down in memory
    constructor(memory) {
        this.memory = memory;
        // Stack bottom (of stack) pointer and (top of) stack pointer
        // But subtract as when accessing the DataView, it is zero-indexed.
        this.bp = memory.byteLength - 1;
        this.sp = this.bp;
        // Set the program counter
        this.pc = 0;
        // TODO: this should be generated previous to compile time
        // Prepare the instructions
        for (let i = 0; i <= 0xFF && i < instructions.array.length; i++) {
            instructions.object[instructions.array[i]] = i;
        }
        this.inputBuffer = [];
        this.eventHandler = new EventEmitter();
        this.eventHandler.on('IN', (value) => this.inputBuffer.push(value));
    }

    // Stack Operations
    push(value) {
        return (setMemory(this.memory, this.sp--, value));
    }
    pop() {
        return (getMemory(this.memory, ++this.sp));
    }

    fetch() {
        return (getMemory(this.memory, this.pc++));
    }
    // There is no necessary need for a decode stage
    // As fetching is done seperately, this can be done differently in a true stack machine,
    // having each instruction have to have a seperate operand
    // execute returns -1 upon a halt instruction, otherwise returns 0
    execute(opcode, operand) {
        let b, c;
        switch (opcode) {
            case instructions.object.NOP:
                break;
            case instructions.object.HLT:
                // Halt operations
                return (-1);
            // Stack manipulations
            case instructions.object.PUSH:
                this.push(operand);
                break;
            case instructions.object.POP:
                c = [];
                // Put the stack into an array
                this.pop();
                break;
            case instructions.object.RTT:
                c = []
                // Put the stack into an array and rotate
                while (this.sp != this.bp) {
                    c.push(this.pop());
                }
                // Reverse the array to handle it being popped LIFO, last in first out
                c = c.reverse();
                // Rotate the array elements left, looping the top element
                c.unshift(c.pop());
                // Reverse the stack again
                c = c.reverse();
                // Push all items in the array back on the stack
                while (c.length != 0) {
                    b = c.pop();
                    this.push(b);
                }
                break;
            case instructions.object.RTB:
                c = []
                // Put the stack into an array and rotate
                while (this.sp != this.bp) {
                    c.push(this.pop());
                }
                // Reverse the array to handle it being popped LIFO, last in first out
                c = c.reverse();
                // Rotate the array elements left, looping the top element
                c.push(c.shift());
                // Reverse the stack again
                c = c.reverse();
                // Push all items in the array back on the stack
                while (c.length != 0) {
                    b = c.pop();
                    this.push(b);
                }
                break;
            // Operations
            case instructions.object.ADD:
                this.push(this.pop() + this.pop());
                break;
            case instructions.object.MUL:
                this.push(this.pop() * this.pop());
                break;
            case instructions.object.DIV:
                this.push(this.pop() / this.pop());
                break;
            case instructions.object.EXP:
                this.push(this.pop() ** this.pop());
                break;
            case instructions.object.SQR:
                this.push(Math.sqrt(this.pop()));
                break;
            case instructions.object.DUP:
                b = this.pop();
                this.push(b);
                this.push(b);
                break;
            case instructions.object.SHR:
                b = this.pop();
                this.push((b >> this.pop()) & 0xff);
                break;
            case instructions.object.SHL:
                b = this.pop();
                this.push((b >> this.pop()) & 0xff);
                break;
            // Subroutines
            case instructions.object.IPC:
                this.pc = this.pop();
                break;
            // Control flow manipulation
            case instructions.object.JMP:
                this.pc = operand - 1;
                break;
            case instructions.object.JRE:
                this.pc += operand - 1 & 0xFF;
                break;
            case instructions.object.JEZ:
                this.pop() == 0 ? this.pc = operand - 1 : operand - 1;
                break;
            case instructions.object.JLZ:
                this.pop() < 0 ? this.pc = operand - 1 : operand - 1;
                break;
            case instructions.object.JGZ:
                this.pop() > 0 ? this.pc = operand - 1 : operand - 1;
                break;
            // Logical operations
            case instructions.object.AND:
                this.push(this.pop() & this.pop());
                break;
            case instructions.object.OR:
                this.push(this.pop() | this.pop());
                break;
            case instructions.object.XOR:
                this.push(this.pop() ^ this.pop());
                break;
            // I/O operations
            case instructions.object.IN:
                this.push(this.inputBuffer.pop());
                break;
            case instructions.object.OUT:
                this.eventHandler.emit('OUT', this.pop());
                break;
            // TODO: Add more instructions
            default:
                // NOP
                break;
        }
        return (0);
    }

    // Performs a fetch-execute cycle of the stack machine, returning the return-value of the execution cycle
    step() {
        return (this.execute(this.fetch(), this.fetch()));
    }

    // Return the emitter used for i/o
    getEventHandler() {
        return (this.eventHandler);
    }
};

module.exports.CPU = CPU;