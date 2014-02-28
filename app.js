#!/usr/local/bin/node 

var appCredentials = {
    clientId: '3MVG9JZ_r.QzrS7jMWJX1xnsIjdc3cP8E5Bia4BLGUKBReyQboFezdlDwW06.xTMzDuYL2_Tjp2kQn8kg5mXh',
    clientSecret: '8545709856375773519',
    redirectUri: 'http://localhost:3000/oauth/_callback',
    mode: 'single'
}

var sfCredentials = {
	username: 'offdagridfeb2014@blackbaud.com',
	password: '0Password0',
	securityToken: 'e6chnnk2t6QLdYs279m62bRu4'
};

var totalVotes;
var followingVotes;
var followingVotesName = 'Susan G. Komen';
var followingTable = 'Survey_Response__c';
var followingField = 'Vote__c';

function print(object){
	return JSON.stringify(object);
}

function handleCallbackErrors(error, response){
	if(error){
		console.log('Error: ' + error);
	}
	else{
		//console.log('Got response ' + print(response));
	}
}

function initializeTotals(tableName,callbackFunction){
	connection.query({query:'SELECT Count(Id) FROM ' + tableName}, function(error, response){
		handleCallbackErrors(error, response);
		totalVotes = response.records[0].get("expr0");
		console.log("Votes: " + totalVotes);
		connection.query({query:"SELECT Id, Vote__c, Count(Vote__c) FROM Survey_Response__c GROUP BY Vote__c"}, function(error,response){
			handleCallbackErrors(error, response);
			console.log(print(response));
			exit();
			followingVotes = response.records.length;
			console.log('percentage: '+followingVotes/totalVotes);
			callbackFunction();
		});		
	});
}

function subscribe(topicName){
	console.log('Opening stream to ' + topicName);
	var stream = connection.stream({topic:topicName});
	stream.on('connect', function(){console.log('connected');});
	stream.on('error',   function(e){console.log('error ' + e);});
	stream.on('data',    handleData);
	console.log('Opened stream ' + print(stream));
	return stream;
}

function handleData(data){
	console.log('Got stream data ' + data.sobject.Vote__c);
	totalVotes++;
	if(data.sobject.Vote__c == followingVotesName){
		followingVotes++;
	}
	console.log('percentage: ' + followingVotes/totalVotes);
}

function authenticationCallback(error, response){
	//console.log('In authentication callback.');
	handleCallbackErrors(error, response);
	console.log('Authenticated and received token ' + connection.oauth.access_token);
	main();
}

function main(){
	console.log('In main.');		
	initializeTotals(followingTable,function(){subscribe('AllVotes');});
}

console.log('Connecting.');
var connection = require('nforce').createConnection(appCredentials);
console.log('Authenticating.');
connection.authenticate(sfCredentials, authenticationCallback);

