/// <reference path="../services/cards.client.service.js" />


'use strict';

angular.module('cards').controller('DetailedCardController', ['$scope', '$rootScope', '$stateParams', 'CardsFactory',
	function ($scope, $rootScope, $stateParams, CardsFactory) {


	    var detailedRecordData = [];

	    function getDetailedCard() {

	        $(window).scrollTop(0);

	        getSourceName();

	        var singleRecordApiParam = $stateParams.recordId;
	        if ($stateParams.sourceId == 'medlinePlusConnect') {
	            singleRecordApiParam = $stateParams.searchTerm;
	        }

	        $scope.showPreLoader = true;

	        CardsFactory.getDetailedCardRecord($stateParams.sourceId, singleRecordApiParam)
                .success(function (data) {

                    switch ($stateParams.sourceId) {
                        case "dailyMed":
                            fillInDailyMedCard(data.results[0]);
                            break;
						case "fda":
							fillInDailyMedCard(data.results[0]);
							break;
                        case "medlinePlusConnect":
                            fillInMedlinePlusConnectCard(data.feed.entry);
                            break;

                        case "medlinePlusHealthTopics":
                            fillInMedlinePlusHealthTopicsCard(data.nlmSearchResult.list[0].document[0].content[0]['health-topic'][0]);
                            break;

                        case "pubMed":
                            fillInPubMedCard(data.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0], data.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].DateCreated[0]);
                            break;

                        case "digitalCollections":
                            fillInDigitalCollectionsCard(data.nlmSearchResult.list[0].document[0].content);
                            break;

                        case "clinicalTrials":
                            fillInClinicalTrialsCard(data.clinical_study);
                            break;
                    }

                    $scope.detailedRecordData = detailedRecordData;

                    $scope.showDetailedCardContainer = true;

                    $scope.showPreLoader = false;

                    console.log("success getting a detailed record");

                })
                .error(function (data, status, headers, config) {
                    console.log("an error occured getting a detailed record");
                });
	    }

	    getDetailedCard();

	    function getSourceName() {
	        for (var i = 0; i < $rootScope.userPreferences.sources.length; i++) {

	            if ($rootScope.userPreferences.sources[i].id == $stateParams.sourceId) {
	                $scope.sourceName = $rootScope.userPreferences.sources[i].name;
	                console.log("source name is here " + $rootScope.userPreferences.sources[i].name);
	            }
	        }
	    }


	    function fillInDailyMedCard(record) {
	        var fullTitle = '';

	        if (record.openfda.brand_name) {
	            fullTitle = record.openfda.brand_name.toString() + ' ';
	        }
	        if (record.openfda.generic_name && record.openfda.generic_name.toString().toLowerCase() != record.openfda.brand_name.toString().toLowerCase()) {
	            fullTitle += '(' + record.openfda.generic_name + ') ';
	        }
	        if (record.openfda.manufacturer_name) {
	            fullTitle += '[' + record.openfda.manufacturer_name.toString() + ']';
	        }

	        detailedRecordData = [
                {
                    name: "Title",
                    value: fullTitle,
                    mainDisplay: false
                }
	        ]

	        if (record.information_for_patients) {
	            detailedRecordData.push({
	                name: "Information for Patients",
	                value: record.information_for_patients,
	                mainDisplay: true
	            });
	        }


	        //if (record.dosage_and_administration_table) {
	        //    detailedRecordData.push({
	        //        name: "Dosage",
	        //        value: record.dosage_and_administration_table,
	        //        mainDisplay: true
	        //    });
	        //}


	        if (record.indications_and_usage) {
	            detailedRecordData.push({
	                name: "Indications and Usage",
	                value: record.indications_and_usage,
	                mainDisplay: true
	            });
	        }

	        if (record.contraindications) {
	            detailedRecordData.push({
	                name: "Contraindications",
	                value: record.contraindications,
	                mainDisplay: true
	            });
	        }

	        if (record.how_supplied) {
	            detailedRecordData.push({
	                name: "How Supplied",
	                value: record.how_supplied,
	                mainDisplay: true
	            });
	        }

	        if (record.pharmacokinetics) {
	            detailedRecordData.push({
	                name: "Pharmacokinetics",
	                value: record.pharmacokinetics,
	                mainDisplay: true
	            });
	        }

	        if (record.dosage_and_administration) {
	            detailedRecordData.push({
	                name: "Dosage and Administration",
	                value: record.dosage_and_administration,
	                mainDisplay: true
	            });
	        }


	        if (record.storage_and_handling) {
	            detailedRecordData.push({
	                name: "Storage and Handling",
	                value: record.storage_and_handling,
	                mainDisplay: true
	            });
	        }

	        if (record.description) {
	            detailedRecordData.push({
	                name: "Description",
	                value: record.description,
	                mainDisplay: true
	            });
	        }


	        if (record.warnings_and_cautions) {
	            detailedRecordData.push({
	                name: "Warnings and Cautions",
	                value: record.warnings_and_cautions,
	                mainDisplay: true
	            });
	        }


	        if (record.pediatric_use) {
	            detailedRecordData.push({
	                name: "Pediatric Use",
	                value: record.pediatric_use,
	                mainDisplay: true
	            });
	        }


	        if (record.recent_major_changes) {
	            detailedRecordData.push({
	                name: "Recent Major Changes",
	                value: record.recent_major_changes,
	                mainDisplay: true
	            });
	        }


	        if (record.geriatric_use) {
	            detailedRecordData.push({
	                name: "Geriatric Use",
	                value: record.geriatric_use,
	                mainDisplay: true
	            });
	        }


	        if (record.adverse_reactions) {
	            detailedRecordData.push({
	                name: "Adverse Reactions",
	                value: record.adverse_reactions,
	                mainDisplay: true
	            });
	        }

	        if (record.overdosage) {
	            detailedRecordData.push({
	                name: "Overdosage",
	                value: record.overdosage,
	                mainDisplay: true
	            });
	        }


	        if (record.drug_interactions) {
	            detailedRecordData.push({
	                name: "Drug Interactions",
	                value: record.drug_interactions,
	                mainDisplay: true
	            });
	        }


	        if (record.nonclinical_toxicology) {
	            detailedRecordData.push({
	                name: "Nonclinical Toxicology",
	                value: record.nonclinical_toxicology,
	                mainDisplay: true
	            });
	        }


	        if (record.use_in_specific_populations) {
	            detailedRecordData.push({
	                name: "Use in Specific Populations",
	                value: record.use_in_specific_populations,
	                mainDisplay: true
	            });
	        }


	        if (record.use_in_specific_populations) {
	            detailedRecordData.push({
	                name: "Use in Specific Populations",
	                value: record.use_in_specific_populations,
	                mainDisplay: true
	            });
	        }


	        if (record.clinical_studies) {
	            detailedRecordData.push({
	                name: "Clinical Studies",
	                value: record.clinical_studies,
	                mainDisplay: true
	            });
	        }

	        detailedRecordData.push({
	            name: "Resource URL",
	            value: formatURL('http://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=' + $stateParams.recordId),
	            mainDisplay: true
	        });

	    }


	    function fillInMedlinePlusConnectCard(records) {
	        var record;


	        for (var i = 0; i < records.length; i++) {
	            if (records[i].id["_value"] == $stateParams.recordId) {
	                record = records[i];
	            }
	        }


	        detailedRecordData = [
                {
                    name: "Title",
                    value: record.title["_value"],
                    mainDisplay: false
                }
	        ]

	        if (record.link) {
	            detailedRecordData.push({
	                name: "URL",
	                value: formatURL(record.link[0].href),
	                mainDisplay: true
	            });
	        }


	        if (record.summary) {
	            detailedRecordData.push({
	                name: "Summary",
	                value: record.summary["_value"],
	                mainDisplay: true
	            });
	        }

	    }


	    function fillInMedlinePlusHealthTopicsCard(record) {
	        console.log(record);

	        detailedRecordData = [
                {
                    name: "Title",
                    value: record["$"]["title"],
                    mainDisplay: false
                }
	        ]

	        if (record["full-summary"]) {
	            detailedRecordData.push({
	                name: "Summary",
	                value: record["full-summary"][0],
	                mainDisplay: true
	            });
	        }

	        if (record["also-called"]) {
	            var alsoCalled = '';

	            for (var i = 0; i < record["also-called"].length; i++) {
	                alsoCalled += record["also-called"][i] + ', ';
	            }

	            alsoCalled = alsoCalled.substring(0, alsoCalled.length - 2);

	            detailedRecordData.push({
	                name: "Also Called",
	                value: alsoCalled,
	                mainDisplay: true
	            });
	        }

	        if (record["primary-institute"]) {
	            detailedRecordData.push({
	                name: "Primary Institute",
	                value: record["primary-institute"][0]["_"],
	                mainDisplay: true
	            });
	        }


	        if (record["site"]) {
	            var websites = '';

	            for (var i = 0; i < record["site"].length; i++) {
	                websites += '<a target=\"blank\" href=\"' + record["site"][i]["$"]["url"] + '\">' + record["site"][i]["$"]["title"] + '</a><br />';
	            }

	            //alsoCalled = alsoCalled.substring(0, alsoCalled.length - 2);

	            detailedRecordData.push({
	                name: "Related Websites",
	                value: websites,
	                mainDisplay: true
	            });
	        }


	        detailedRecordData.push({
	            name: "Resource URL",
	            value: formatURL($stateParams.recordId),
	            mainDisplay: true
	        });
	    }


	    function fillInPubMedCard(record, recordDate) {
	        console.log(record);

	        detailedRecordData = [
                {
                    name: "Title",
                    value: record.ArticleTitle[0],
                    mainDisplay: false
                }
	        ]

	        if (recordDate) {
	            try {
	                var dateCreated = recordDate.Month[0].toString() + '/' + recordDate.Day[0].toString() + '/' + recordDate.Year[0].toString();

	                detailedRecordData.push({
	                    name: "Date Created",
	                    value: dateCreated,
	                    mainDisplay: true
	                });
	            }
	            catch (err) {

	            }
	        }


	        if (record.Journal) {

	            try {
	                var pubDate = record.Journal[0].JournalIssue[0].PubDate[0].Month[0].toString() + ' ' + record.Journal[0].JournalIssue[0].PubDate[0].Day[0].toString() + ', ' + record.Journal[0].JournalIssue[0].PubDate[0].Year[0].toString();

	                detailedRecordData.push({
	                    name: "Journal",
	                    value: record.Journal[0].Title[0] + ', Volume ' + record.Journal[0].JournalIssue[0].Volume[0] + ' Issue ' + record.Journal[0].JournalIssue[0].Issue[0] + ', Published on ' + pubDate,
	                    mainDisplay: true
	                });
	            }
	            catch (err) {
	                
	            }
	            
	        }

	        if (record.Abstract) {
	            detailedRecordData.push({
	                name: "Abstract",
	                value: record.Abstract[0].AbstractText[0]['_'] ? record.Abstract[0].AbstractText[0]['_'].toString() : record.Abstract[0].AbstractText[0].toString(),
	                mainDisplay: true
	            });
	        }


	        if (record.AuthorList && record.AuthorList[0].Author) {

	            console.log(record.AuthorList);

	            try {
	                var authors = '';

	                for (var i = 0; i < record.AuthorList[0].Author.length; i++) {
	                    authors += record.AuthorList[0].Author[i].LastName + ', ' + record.AuthorList[0].Author[i].ForeName + ' ' + record.AuthorList[0].Author[i].Initials
	                    if (record.AuthorList[0].Author[i].Affiliation) {
	                        authors += '<br /> ' + record.AuthorList[0].Author[i].Affiliation[0]
	                    }
	                    authors += "<br /><br />"
	                }

	                //alsoCalled = alsoCalled.substring(0, alsoCalled.length - 2);

	                detailedRecordData.push({
	                    name: "Author(s)",
	                    value: authors,
	                    mainDisplay: true
	                });
	            } catch (e) {

	            }
	        }


	        detailedRecordData.push({
	            name: "Resource URL",
	            value: formatURL('http://www.ncbi.nlm.nih.gov/pubmed/' + $stateParams.recordId),
	            mainDisplay: true
	        });

	    }


	    function fillInDigitalCollectionsCard(record) {
	        console.log(record);


	        detailedRecordData = [
                {
                    name: "Title",
                    value: record[0]["_"],
                    mainDisplay: false
                }
	        ]


	        

	        var authors = '';
	        var pubDate = '';
	        var publisher = '';
	        var format = '';
	        var subject = '';
	        var description = '';

	        try {
	            for (var i = 0; i < record.length; i++) {
	                if (record[i]['$'].name == 'dc:creator') {
	                    authors += record[i]["_"] + "<br />"
	                }
	                if (record[i]['$'].name == 'dc:date') {
	                    pubDate += record[i]["_"] + "<br />"
	                }
	                if (record[i]['$'].name == 'dc:publisher') {
	                    publisher += record[i]["_"] + "<br />"
	                }
	                if (record[i]['$'].name == 'dc:format') {
	                    format += record[i]["_"] + "<br />"
	                }
	                if (record[i]['$'].name == 'dc:subject') {
	                    subject += record[i]["_"] + "<br />"
	                }
	                if (record[i]['$'].name == 'dc:description') {
	                    description += record[i]["_"] + "<p></p>"
	                }
	            }
	        } catch (e) {

	        }
	            

	        if (authors.length > 0) {
	            detailedRecordData.push({
	                name: "Author(s)",
	                value: authors,
	                mainDisplay: true
	            });
	        }

	        if (pubDate.length > 0) {
	            detailedRecordData.push({
	                name: "Publication Date",
	                value: pubDate,
	                mainDisplay: true
	            });
	        }
	        if (publisher.length > 0) {
	            detailedRecordData.push({
	                name: "Publisher",
	                value: publisher,
	                mainDisplay: true
	            });
	        }
	        if (format.length > 0) {
	            detailedRecordData.push({
	                name: "Format",
	                value: format,
	                mainDisplay: true
	            });
	        }
	        if (subject.length > 0) {
	            detailedRecordData.push({
	                name: "Subject(s)",
	                value: subject,
	                mainDisplay: true
	            });
	        }
	        if (description.length > 0) {
	            detailedRecordData.push({
	                name: "Description)",
	                value: description,
	                mainDisplay: true
	            });
	        }
	        
	        
	        detailedRecordData.push({
	            name: "Resource URL",
	            value: formatURL($stateParams.recordId),
	            mainDisplay: true
	        });
	    }


	    function fillInClinicalTrialsCard(record) {
	        console.log(record);

	        detailedRecordData = [
                {
                    name: "Title",
                    value: record.brief_title[0],
                    mainDisplay: false
                }
	        ]


	        if (record.official_title) {
	            detailedRecordData.push({
	                name: "Official Title",
	                value: record.official_title[0],
	                mainDisplay: true
	            });
	        }

	        if (record.overall_status) {
	            detailedRecordData.push({
	                name: "Status",
	                value: record.overall_status[0],
	                mainDisplay: true
	            });
	        }

	        if (record.condition) {
	            detailedRecordData.push({
	                name: "Condition",
	                value: record.condition[0],
	                mainDisplay: true
	            });
	        }

	        if (record.sponsors) {

	            try {
	                var sponsors = '';

	                if (record.sponsors[0].lead_sponsor) {
	                    sponsors += record.sponsors[0].lead_sponsor[0].agency[0] + '<br />'
	                }

	                if (record.sponsors[0].collaborator) {
	                    for (var i = 0; i < record.sponsors[0].collaborator.length; i++) {
	                        sponsors += record.sponsors[0].collaborator[i].agency[0] + '<br />';
	                    }
	                }
	                

	                detailedRecordData.push({
	                    name: "Sponsor(s)",
	                    value: sponsors,
	                    mainDisplay: true
	                });
	            } catch (e) {

	            }
	        }

	        if (record.firstreceived_date) {
	            detailedRecordData.push({
	                name: "First Received Date",
	                value: record.firstreceived_date[0],
	                mainDisplay: true
	            });
	        }

	        if (record.lastchanged_date) {
	            detailedRecordData.push({
	                name: "Last Updated Date",
	                value: record.lastchanged_date[0],
	                mainDisplay: true
	            });
	        }

	        if (record.start_date) {
	            detailedRecordData.push({
	                name: "Start Date",
	                value: record.start_date[0],
	                mainDisplay: true
	            });
	        }

	        if (record.primary_completion_date) {
	            detailedRecordData.push({
	                name: "Primary Completion Date",
	                value: record.primary_completion_date[0]["_"],
	                mainDisplay: true
	            });
	        }

	        if (record.brief_summary) {
	            detailedRecordData.push({
	                name: "Brief Summary",
	                value: record.brief_summary[0].textblock[0],
	                mainDisplay: true
	            });
	        }
	        
	        if (record.detailed_description) {
	            detailedRecordData.push({
	                name: "Detailed Description",
	                value: record.detailed_description[0].textblock[0],
	                mainDisplay: true
	            });
	        }

	        if (record.eligibility && record.eligibility[0].criteria) {
	            detailedRecordData.push({
	                name: "Eligibility Criteria",
	                value: record.eligibility[0].criteria[0].textblock[0],
	                mainDisplay: true
	            });
	        }

	        detailedRecordData.push({
	            name: "Resource URL",
	            value: formatURL('http://clinicaltrials.gov/ct2/show/' + $stateParams.recordId),
	            mainDisplay: true
	        });

	    }


	    function formatURL(url) {

            return '<a class="field_link" target="_blank" href='+ url +'>'+ url +'</a>';
	    }


	}
]);