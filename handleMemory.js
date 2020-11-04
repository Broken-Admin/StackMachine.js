setMemory = (memory, index, value) => {
    return(memory.setUint8(index, value));
}
getMemory = (memory, index) => {
    return(memory.getUint8(index));
}

module.exports = {
    setMemory: setMemory,
    getMemory: getMemory
}