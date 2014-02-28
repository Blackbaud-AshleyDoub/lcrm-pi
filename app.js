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
var votesByCause = {};

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

function initializeTotals(){
	connection.query({query:'SELECT Count(Id) FROM Survey_Response__c'}, function(error, response){
		handleCallbackErrors(error, response);
		totalVotes = response.records[0].get("expr0");
		connection.query({query:"SELECT Vote__c, Count(Id) FROM Survey_Response__c GROUP BY Vote__c"}, function(error,response){
			handleCallbackErrors(error, response);
			for(var i=0; i<response.records.length; i++){
				var record = response.records[i];
				votesByCause[record.get("Vote__c")] = record.get("expr0");
			}
			console.log('Votes:');
			for(cause in votesByCause){
				console.log('\t' + votesByCause[cause] + '\t' + getPercentage(cause) + ' ' + cause);
			}
			console.log('\tTotal: ' + totalVotes);
			subscribe('AllVotes');
		});		
	});
}

function subscribe(topicName){
	//console.log('Opening stream to ' + topicName);
	var stream = connection.stream({topic:topicName});
	stream.on('connect', function(){console.log('Connected to ' + topicName + '.');});
	stream.on('error',   function(e){console.log('error ' + e);});
	stream.on('data',    handleData);
	//console.log('Opened stream ' + print(stream));
	return stream;
}

function getPercentage(cause){
	return Math.floor(100*votesByCause[cause]/totalVotes) + '%';
}

function handleData(data){
	var cause = data.sobject.Vote__c;
	console.log('Just received vote for ' + cause + '!');
	totalVotes++;
	votesByCause[cause] = votesByCause[cause] + 1;
	console.log( cause + ' now has ' + getPercentage(cause) + ' of the vote.');
}

function authenticationCallback(error, response){
	//console.log('In authentication callback.');
	handleCallbackErrors(error, response);
	//console.log('Authenticated and received token ' + connection.oauth.access_token);
	main();
}

function main(){
	console.log('In main.');		
	initializeTotals();
}

console.log('Connecting.');
var connection = require('nforce').createConnection(appCredentials);
console.log('Authenticating.');
connection.authenticate(sfCredentials, authenticationCallback);

