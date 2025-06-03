const logError = async (error) => {
    const time = new Date()
    console.log('\x1b[31m%s\x1b[0m', `[${time.toISOString()}] Error : ${error}`);
}

module.exports = {logError}