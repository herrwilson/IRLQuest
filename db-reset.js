import http from 'http';

// Define the URL and options for the DELETE request
const url =
	'http://127.0.0.1:8080/emulator/v1/projects/irl-quest-cee22/databases/(default)/documents';
const options = {
	method: 'DELETE',
};

const req = http.request(url, options, (res) => {
	if (res.statusCode === 200 || res.statusCode === 204) {
		console.log('DELETE request successful. Database reset.');
	} else {
		console.error('DELETE request failed. Status code:', res.statusCode);
	}
	process.exit(0);
});

req.on('error', (error) => {
	console.error('An error occurred while making the DELETE request:', error);
	process.exit(1);
});

req.end();
