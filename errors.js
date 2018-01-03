exports.sendError = function (reason, msgObject) {

    // Here are explained all the errors that may happen.

    switch (reason) {

        case 'NO_RIGHTS':
            // someone tried to use an admin command, not important.
            msgObject.reply('Sorry, you do not have access to this command.');
            break;

        case 'FETCH_UPDATE':
            // This error is triggered if the bot wasn't able to fetch the content in lastupdate.json.
            console.warn('Unable to get lastupdate.json content !!');

            if (msgObject !== undefined) {
                msgObject.reply('Unable to retreive the last update, try again later.');
            }
            break;

        case 'DB':
            // This error is triggered if the connection to the database can't be established.
            if (msgObject !== undefined) {
                console.warn(`Database connection failed for ${msgObject.guild.name} guild !`);
                msgObject.reply('Connection with the database failed. Please try again later.');
            } else {
                console.warn('Failed to delete a guild from the database !');
            }
            break;

        case 'QUERY':
            // This error is triggered if a query to the database failed.
            if (msgObject !== undefined) {
                console.warn(`A query failed for ${msgObject.guild.name} guild !`)
                msgObject.reply('Query to the database failed. Please try again later.');
            } else {
                console.warn('Failed to delete a guild from the database !');
            }
            break;

        case 'HTML':
            // This error is triggered if the HTML scrapping fails.
            // It is usually not important and the next will succeed.
            console.warn('Incomplete HTML response from teamfortress.com !');
            break;
    }

};