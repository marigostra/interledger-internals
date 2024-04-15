

const fs = require("fs");
const path = require("path");
const     cryptoRandomString = require('crypto-random-string');
const cp = require("child_process");

const     UML_BLOCK_REGEXP = /<uml>([\s\S.]*?)<\/uml>/;

function shell(cmd){
    return new Promise((resolve, reject)=>{
	cp.exec(cmd, (err, stdout, stderr)=>{
	    if (!err)
		resolve({stdout, stderr}); else
		    reject(err);
	});
	});
};

async function convert(t){
    var text = t;
    for(let m = text.match(UML_BLOCK_REGEXP);m;m = text.match(UML_BLOCK_REGEXP)){
	const id = cryptoRandomString({length: 10});
	await fs.promises.writeFile(path.join("graphics", id + ".uml"), m[1] + "\n", "UTF-8");
	await shell(`cd graphics && plantuml ${id}.uml`);
	const subst = `<div style=\"height: 20px;\"></div>\n<center><img src="graphics/${id + ".png"}"></center>\n<div style=\"height: 20px;\"></div>`;
        const fromPos = m.index, toPos = m.index + m[0].length;
	text = text.substring(0, fromPos) + subst + text.substring(toPos);
    }
    return text;
}

(async function run(){
    try {
	await fs.promises.rmdir("graphics", {recursive: true});
	await fs.promises.mkdir("graphics");
	const text = await fs.promises.readFile("README.md.in", "UTF-8");
	await fs.promises.writeFile("README.md", await convert(text), "UTF-8");
    }
    catch(ex)
    {
	console.log(ex);
	process.exit(1);
    }
})();
