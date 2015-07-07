'use strict';

/**
 * Module dependencies.
 */
var http = require('http');

var request = require('request');

var parseString = require('xml2js').parseString;

function getApiParams(sourceId, recordId, searchTerm, currentPage)
{
    var maxRecordsPerPage = 9;
    var nextRecordset = currentPage * maxRecordsPerPage;
    if (!recordId) {
        recordId = '';
    }

    var options = {
    };

    switch (sourceId) {
        case "fda":
            options = {
                url: recordId.length == 0 ? 'https://api.fda.gov/drug/label.json?api_key=ohV19XYnKxoOarXUZlqdqaf9H1zwfpLk5XuXzpRp&search=' + searchTerm + '&skip=' + (currentPage == 1 ? '0' : nextRecordset.toString()) + '&limit=' + maxRecordsPerPage.toString() : 'https://api.fda.gov/drug/label.json?api_key=ohV19XYnKxoOarXUZlqdqaf9H1zwfpLk5XuXzpRp&search=openfda.spl_set_id:"'+ recordId +'"',
                contentType: 'application/json'
            };
            break;
    }

    return options;
}

exports.read = function (client_req, client_res) {

    var options = getApiParams(client_req.query.sourceId, client_req.query.recordId, client_req.query.searchTerm, client_req.query.currentPage);

    client_res.setHeader('Content-Type', "application/json");

    request(options.url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            
            if (options.contentType == "text/xml") {
                parseString(body, function (err, jres) {
                    client_res.write(JSON.stringify(jres));
                });
            }
            else
            {
                client_res.write(body);
            }

            client_res.end();
        }
    });
};

