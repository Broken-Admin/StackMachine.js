const { CPU } = require('./CPU');
const { createMemory } = require('./createMemory');

createCPU = (memorysize) => {
    cpu = new CPU(createMemory(memorysize));
    return(cpu);
}

module.exports.createCPU = createCPU;