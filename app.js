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
var followingTable = 'Survey_Response__c'
var followingField = 'Vote__c'

function authenticationCallback(error, response){
	console.log('In authenticaion callback.');
	genericCallback(error, response);
	console.log('Cached Token: ' + connection.oauth.access_token);
	main();
}

function queryCallback(error, response){
	console.log('In query callback.');
	genericCallback(error, response);
}

function genericCallback(error, response){
	if(error){
		console.log('Error: ' + error);
	}
	else{
		console.log('Got response ' + response);
		//if(response && response.records){
			//print(response.records);
		//}
	}
}

function print(object){
	console.log(JSON.stringify(object));
}

function insertCallback(error, response){
	console.log('In insertCallback');
	genericCallback(error, response);
}

function initializingTotals(tableName,callbackFunction){
	connection.query({query:'SELECT Id FROM '+tableName}, function(error,response){		
		totalVotes = response.records.length;
		console.log("Votes:"+ totalVotes);
		connection.query({query:"SELECT Id FROM "+tableName+" WHERE "+ followingField +" = '"+followingVotesName+"'"},function(error,response){
			followingVotes = response.records.length;
			console.log('percentage: '+followingVotes/totalVotes);
			callbackFunction();
		});		
	});
}

function basicLittleQuery(){
	var query = 'SELECT Id, Vote__c FROM Survey_Response__c';
	connection.query({query:query}, queryCallback);
}

function subscribe(topicName){
	console.log('Opening stream ' + topicName);
	var stream = connection.stream({topic:topicName});
	stream.on('connect', function( ){ console.log('connected' ); });
	stream.on('error',   function(e){ console.log('error ' + e); });
	stream.on('data',    handleData);
	console.log('Returning stream ' + stream);
	return stream;
}

function handleData(data){
	console.log('got stream data ' + data.sobject.Vote__c);
	totalVotes++;
	if(data.sobject.Vote__c == followingVotesName){
		followingVotes++;
	}
	console.log('percentage: '+followingVotes/totalVotes);
}

function main(){
	console.log('Starting in main().');		

	initializingTotals(followingTable,function() {
		subscribe('AllVotes');
	});

	console.log('Done in main().');
}


console.log('Welcome to our node script!');
console.log('Creating connection.');
var nforce = require('nforce');
var connection = nforce.createConnection(appCredentials);
console.log('Authenticating.');
connection.authenticate(sfCredentials, authenticationCallback);

