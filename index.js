/*
 * PLEASE RUN THIS SERVER FROM THE MAIN DIR OR YOU'RE NOT GOING TO BE HAPPY
 *
 */

const express = require("express");

const app = express();
const spawn = require("child_process").spawn;
const cors = require("cors");
const model = require("./model");
const { default: mongoose } = require("mongoose");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

var makeCSV = (fightTable) => {
	csv = "";
	fields = Object.keys(fightTable[0]);
	values = Object.values(fightTable[0]);

	fields.forEach((element) => {
		csv += element + ",";
	});
	csv = csv.slice(0, -1);
	csv += "\n";

	fightTable.forEach((row) => {
		rowValues = Object.values(row);
		rowValues.forEach((col) => {
			csv += col + ",";
		});
		csv = csv.slice(0, -1);
		csv += "\n";
	});
	return csv;
};

app.get("/savedfights", function (request, response) {
	model.FightRecord.find().then((fights) => {
		console.log("/GET for /savedfights");
		response.json(fights);
	});
});

app.delete("/savedfights/:id", function (request, response) {
	console.log("/DELETE for /savedfights");
	model.FightRecord.findById(request.params.id).then((out) => {
		if (!out) {
			response.status(404).send("Fight not found");
		} else {
			model.FightRecord.deleteOne({ _id: request.params.id })
				.then(() => {
					response.sendStatus(204);
				})
				.catch(function (error) {
					response.status(400).send(error);
				});
		}
	});
});

app.patch("/savedfights/", function (request, response) {
	console.log("/PATCH for /savedfights");
	let fights = request.body;

	fights.forEach((fight) => {
		model.FightRecord.findById(fight._id).then((out) => {
			if (!out) {
				response.status(404).send("Fight not found");
				return;
			} else {
				model.FightRecord.updateOne(
					{ _id: fight._id },
					{ winner: fight.new_label }
				)
					.then(() => {})
					.catch(function (error) {
						response.status(400).send(error);
						return;
					});
			}
		});
	});
	model.FightRecord.find().then((fights) => {
		console.log("/GET for /savedfights");
	response.status(200).json(fights);
	});
});

app.get("/datasets", function (request, response) {
	model.FightRecord.find()
		.lean()
		.then((fights) => {
			console.log("/GET for /datasets");
			let data = fights;
			console.log(data);
			let csvFile = makeCSV(data);
			console.log(csvFile);
			response.send(csvFile);
		});
});

app.post("/fights", function (request, response) {
	console.log("/POST for /fights");

	const fight = request.body;
	let redLink = fight.red_link;
	let blueLink = fight.blue_link;
	let redOdds = fight.red_odds;
	let blueOdds = fight.blue_odds;

	var process = spawn("python", [
		"./run_model.py",
		"parse",
		"--rlink",
		redLink,
		"--blink",
		blueLink,
		"--rodds",
		redOdds,
		"--bodds",
		blueOdds,
	]);

	process.stdout.on("data", (data) => {
		let output = data.toString("utf8");
		try {
			output = JSON.parse(output);
			response.header = { "Content-Type": "application-type/json" };
			response.status(201).json(output);
			return;
		} catch (error) {
			console.log("python error");
			response.status(422).send(output);
			return;
		}
	});

	process.stderr.on("data", (data) => {
		console.log("servererror");
		response.status(500).send("Server error, sorry :(");
	});
});

app.post("/predictions", function (request, response) {
	console.log("/POST for /predictions");

	const fight = request.body;
	let rf = fight.rFighter;
	let bf = fight.bFighter;

	let ro = rf.odds;
	let bo = bf.odds;

	let rn = rf.name;
	let bn = bf.name;

	let rw = rf.wins;
	let bw = bf.wins;

	let rl = rf.losses;
	let bl = bf.losses;

	let rs = rf.streak;
	let bs = bf.streak;

	let rr = rf.reach;
	let br = bf.reach;

	let rh = rf.height;
	let bh = bf.height;

	let ra = rf.age;
	let ba = bf.age;

	var process = spawn("python", [
		"./run_model.py",
		"predict",
		"--rodds",
		ro,
		"--bodds",
		bo,
		"-rn",
		rn,
		"-rw",
		rw,
		"-rl",
		rl,
		"-rs",
		rs,
		"-ra",
		ra,
		"-rr",
		rr,
		"-rh",
		rh,
		"-bn",
		bn,
		"-bw",
		bw,
		"-bl",
		bl,
		"-bs",
		bs,
		"-ba",
		ba,
		"-br",
		br,
		"-bh",
		bh,
	]);

	process.stdout.on("data", (data) => {
		let output = data.toString("utf8");

		try {
			response.status(201).send(output);
		} catch (error) {
			response.status(422).send("Failed to Create");
		}
	});

	process.stderr.on("data", (data) => {
		console.log(data.toString("utf8"));
		response.status(422).send("Failed to Create");
	});
});

app.post("/savedfights", function (request, response) {
	console.log("POST/ for /savedfights");
	const fight = request.body;
	const newFightRecord = model.FightRecord({
		red_name: fight.red_name,
		blue_name: fight.blue_name,
		red_odds: fight.red_odds,
		blue_odds: fight.blue_odds,
		red_wins: fight.red_wins,
		blue_wins: fight.blue_wins,
		loss_streak_dif: fight.loss_streak_dif,
		win_streak_dif: fight.win_streak_dif,
		age_dif: fight.age_dif,
		height_dif: fight.height_dif,
		reach_dif: fight.reach_dif,
		winner: fight.winner,
	});

	newFightRecord.save().then(() => {
		response.status(201).send("Created :)");
	});
});

PORT=8080

app.listen(PORT, function () {
	console.log("Server is running on http://localhost:"+PORT+"/");
});
