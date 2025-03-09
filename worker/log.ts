let logContent = "";

function log(text: string) {
	logContent += `${text}\n`;
	console.log(text);
}

function exportLog() {
	return logContent;
}

export { log, exportLog };
