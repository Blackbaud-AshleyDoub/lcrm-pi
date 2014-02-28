#!/usr/local/bin/node 

var log = console.log;

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
		log('Error: ' + error);
	}
	else{
		//log('Got response ' + print(response));
	}
}

function printVoteStatus(){
		//log('Votes:');
		for(cause in votesByCause){
			//log('\t' + votesByCause[cause] + '\t' + getPercentage(cause) + '\t' + cause);
			log(getPercentage(cause) + '\t' + cause);
		}
		//log('\tTotal: ' + totalVotes);
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
			printVoteStatus();
			setTimeout(initializeTotals(), 5000); //omg remove this after the demo, okay?
			//subscribe('AllVotes'); // this was the real callback, restore it
		});		
	});
}

function subscribe(topicName){
	//log('Opening stream to ' + topicName);
	var stream = connection.stream({topic:topicName});
	stream.on('connect', function(){log('Connected to ' + topicName + '.');});
	stream.on('error',   function(e){log('error ' + e);});
	stream.on('data',    handleData);
	//log('Opened stream ' + print(stream));
	return stream;
}

function getPercentage(cause){
	return Math.floor(100*votesByCause[cause]/totalVotes) + '%';
}

function handleData(data){
	var cause = data.sobject.Vote__c;
	//log('Just received vote for ' + cause + '!');
	totalVotes++;
	if(votesByCause[cause] === undefined){votesByCause[cause] = 0;}
	votesByCause[cause] = votesByCause[cause] + 1;
	log(cause + ' now has ' + getPercentage(cause) + ' of the vote.');
	log(getPercentage(cause) + '\t' + cause);
}

function authenticationCallback(error, response){
	//log('In authentication callback.');
	handleCallbackErrors(error, response);
	//log('Authenticated and received token ' + connection.oauth.access_token);
	main();
}

function main(){
	//log('In main.');		
	initializeTotals();
}

//log('Connecting.');
var connection = require('nforce').createConnection(appCredentials);
//log('Authenticating.');
connection.authenticate(sfCredentials, authenticationCallback);

