function getArrayMetadata(arr) {
    return {
        length: 2,
        firstObject: arr[0]
    };
}
module.exports = {
    getArrayMetadata: getArrayMetadata
};
