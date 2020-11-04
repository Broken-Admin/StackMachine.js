createMemory = (length) => {
    ab = new ArrayBuffer(length);
    data = new DataView(ab);
    return(data);
}

module.exports.createMemory = createMemory;