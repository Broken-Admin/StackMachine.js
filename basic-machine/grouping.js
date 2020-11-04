const { CPU } = require('../CPU');
const { createCPU } = require('../createCPU');
const { createMemory } = require('../createMemory');
const handleMemory = require('../handleMemory');
const { instructions } = require('../instructions');

arrayToUint8 = (arr, offset = 0) => {
    data = createMemory(arr.length + offset);
    for (let i = 0; i < arr.length; i++) {
        handleMemory.setMemory(data, i, arr[i]);
    }
    return (data);
}

stackToArray = (cpu) => {
    arr = [];
    for (let i = 0; i < cpu.memory.byteLength; i++) {
        arr.push(handleMemory.getMemory(cpu.memory, i));
    }
    return (arr);
}

module.exports = {
    CPU: CPU,
    createCPU: createCPU,
    createMemory: createMemory,
    handleMemory: handleMemory,
    instructions: instructions,
    arrayToUint8: arrayToUint8,
    stackToArray: stackToArray
};

// var { CPU, createCPU, createMemory, handleMemory, instructions, arrayToUint8 } = require('./grouping.js');