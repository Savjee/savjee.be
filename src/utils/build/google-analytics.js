const fs = require('fs').promises;

(async () => {
    if(!process.env || !process.env.GOOGLE_ANALYTICS_ID){
        console.error("Google Analytics envrinment variables is not set.");
        process.exit(1);
    }

    const path = __dirname + '/../../site/_assets/js/analytics.js';

    // Read the file & replace the tag ID
    let contents = await fs.readFile(path, 'utf-8');
    contents = contents.replace(/UA-XXXXXXXX-X/gi, process.env.GOOGLE_ANALYTICS_ID);

    // Write it back
    await fs.writeFile(path, contents, 'utf-8');
})();