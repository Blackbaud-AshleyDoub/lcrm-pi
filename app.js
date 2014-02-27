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
		if(response && response.records){
			printRecords(response.records);
		}
	}
}

function print(object){
	console.log(JSON.stringify(objects));
}

function insertCallback(error, response){
	console.log('In insertCallback');
	genericCallback(error, response);
}

function insertAccount(name){
	var acc = nforce.createSObject('Account');
	acc.set('Name', name);
	acc.set('Phone', '800-555-2345');
	connection.insert({ sobject: acc }, insertCallback());
}

function basicLittleQuery(){
	var query = 'SELECT Id, Name FROM Account';
	connection.query({query:query}, queryCallback);
}

function subscribe(topicName){
	console.log('Opening stream ' + topicName);
	var stream = connection.stream({topic:topicName});
	stream.on('connect', function( ){ console.log('connected' ); });
	stream.on('error',   function(e){ console.log('error ' + e); });
	stream.on('data',    function(d){ print(d);});
	console.log('Returning stream ' + stream);
	return stream;
}

function dataToString(data){
	var s = 'Data is ';
	s += data.get('Id');
	s += data.get('Name');
	return s;
}

function main(){
	console.log('Starting in main().');
	//insertAccount('Hi Alan');
	//basicLittleQuery();
	subscribe('AllResponses');
	console.log('Done in main().');
}


console.log('Welcome to our node script!');
console.log('Creating connection.');
var nforce = require('nforce');
var connection = nforce.createConnection(appCredentials);
console.log('Authenticating.');
connection.authenticate(sfCredentials, authenticationCallback);

