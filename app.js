
// local
//const HOSTNAME = "http://localhost:8080/";
//
//aws https
// const HOSTNAME = "https://ec2-13-57-24-150.us-west-1.compute.amazonaws.com:443/";
//
// aws http
// const HOSTNAME = "http://ec2-13-57-24-150.us-west-1.compute.amazonaws.com:80/";
//
// aws api
const HOSTNAME = "https://ihjo7nf1ac.execute-api.us-east-2.amazonaws.com/";
const PARSELINK = HOSTNAME + "fights";
const PREDICTLINK = HOSTNAME + "predictions";
const FIGHTLINK = HOSTNAME + "savedfights";

const States = {
	Parse: 0,
	Predict: 1,
	DonePredict: 2,
	isParsing: 3,
	isPredicting: 4,
	isEditing: 5,
};

let isValidUrl = (url) => {
	const urlPattern = /^https:\/\/www\.tapology\.com\/fightcenter\/fighters\//;
	return urlPattern.test(url);
};

var postParse = async (parseObject) => {
	let parseData = "red_link=" + encodeURIComponent(parseObject.red_link);
	parseData += "&blue_link=" + encodeURIComponent(parseObject.blue_link);
	parseData += "&red_odds=" + encodeURIComponent(parseObject.red_odds);
	parseData += "&blue_odds=" + encodeURIComponent(parseObject.blue_odds);

	let request = {
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		method: "POST",
		body: parseData,
	};

	let response = await fetch(PARSELINK, request);
	return response;
};

let getFightRecords = async () => {
	//GET
	let response = await fetch(FIGHTLINK);
	let fights = await response.json();
	if (response.status == 200) {
		console.log(fights);
		return fights;
	} else {
		console.log("Error is + " + response.status);
		return ["CODE NO WORK"];
	}
};

var postSavedFights = async (saveObject) => {
	console.log("Post Save");
	console.log(saveObject);
	let request = {
		headers: { "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify(saveObject),
	};

	let response = await fetch(FIGHTLINK, request);
	return response;
};

var deleteSavedFights = async (saveFight) => {
	let request = {
		method: "DELETE",
	};
	let link = FIGHTLINK + "/" + saveFight._id;

	let response = await fetch(link, request);
	return response;
};

var patchSavedFights = async (saveFights) => {
	let request = {
		headers: { "Content-Type": "application/json" },
		method: "PATCH",
		body: JSON.stringify(saveFights),
	};
	let link = FIGHTLINK;

	let response = await fetch(link, request);
	return response;
};

var postPredict = async (predictObject) => {
	console.log("Post Predict");
	console.log(predictObject);
	let request = {
		headers: { "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify(predictObject),
	};

	let response = await fetch(PREDICTLINK, request);
	return response;
};

Vue.createApp({
	data: function () {
		return {
			currentState: States.Parse,
			isEditing: false,
			// predictedWinner: "",
			redWin: false,
			blueWin: false,
			label: "",
			fights: [],
			changedFights: [],
			errors: {},
			csvLink: HOSTNAME + "datasets",

			rFighter: {
				link: "",
				name: "",
				odds: 0,
				wins: 0,
				losses: 0,
				height: 0,
				reach: 0,
				streak: 0,
				age: 0,
				image_link: "",
			},

			bFighter: {
				link: "",
				name: "",
				odds: 0,
				wins: 0,
				losses: 0,
				height: 0,
				reach: 0,
				streak: 0,
				age: 0,
				image_link: "",
			},
		};
	},

	// any functions you use
	methods: {
		clearRFighter: function () {
			this.rFighter.link = "";
			this.rFighter.name = "";
			this.rFighter.odds = 0;
			this.rFighter.wins = 0;
			this.rFighter.losses = 0;
			this.rFighter.height = 0;
			this.rFighter.reach = 0;
			this.rFighter.streak = 0;
			this.rFighter.age = 0;
			this.rFighter.image_link = "";
		},
		clearBFighter: function () {
			this.bFighter.link = "";
			this.bFighter.name = "";
			this.bFighter.odds = 0;
			this.bFighter.wins = 0;
			this.bFighter.losses = 0;
			this.bFighter.height = 0;
			this.bFighter.reach = 0;
			this.bFighter.streak = 0;
			this.bFighter.age = 0;
			this.bFighter.image_link = "";
		},
		loadFights: async function () {
			this.fights = await getFightRecords();
		},
		parseButtonClickHandler: async function () {
			this.currentState = "isParsing";
			this.errors = {};
			let parseObject = {
				red_link: this.rFighter["link"],
				blue_link: this.bFighter["link"],
				red_odds: this.rFighter["odds"],
				blue_odds: this.bFighter["odds"],
			};

			if (this.bFighter.link == this.rFighter.link) {
				alert("You can't match the same fighter!!!");
				this.bFighter.link = "";
				this.rFighter.link = "";
				this.currentState = "Parse";
			}

			if (this.rFighter.link.trim() == "") {
				this.errors.rlink_empty = 1;
				this.rFighter.link = "";
			} else if (!isValidUrl(this.rFighter.link)) {
				this.errors.rlink = 1;
				this.rFighter.link = "";
			}

			if (this.bFighter.link.trim() == "") {
				this.errors.blink_empty = 1;
				this.bFighter.link = "";
			} else if (!isValidUrl(this.bFighter.link)) {
				this.errors.blink = 1;
				this.bFighter.link = "";
			}

			if (this.rFighter.odds == "" || isNaN(this.rFighter.odds)) {
				this.errors.rodds = 1;
				this.rFighter.odds = "";
			}
			if (this.bFighter.odds == "" || isNaN(this.bFighter.odds)) {
				this.errors.bodds = 1;
				this.bFighter.odds = "";
			}

			if (Object.keys(this.errors).length > 0) {
				this.currentState = "Parse";
				return;
			}

			let response = await postParse(parseObject);

			if (response.status == 422) {
				alert("Server couldn't process data: " + (await response.text()));
				this.currentState = "Parse";
			} else if (response.status == 201) {
				let inputForms = await response.json();
				let rf = inputForms.r_fighter;
				let bf = inputForms.b_fighter;

				console.log(inputForms);

				this.rFighter = {
					link: this.rFighter.link,
					name: rf.fighter_name,
					odds: this.rFighter.odds,
					wins: rf.fighter_record[0],
					losses: rf.fighter_record[1],
					height: rf.height_and_reach[0],
					reach: rf.height_and_reach[1],
					streak: rf.streak,
					age: rf.age,
					image_link: rf.image_link,
				};

				this.bFighter = {
					link: this.bFighter.link,
					name: bf.fighter_name,
					odds: this.bFighter.odds,
					wins: bf.fighter_record[0],
					losses: bf.fighter_record[1],
					height: bf.height_and_reach[0],
					reach: bf.height_and_reach[1],
					streak: bf.streak,
					age: bf.age,
					image_link: bf.image_link,
				};

				this.currentState = "Predict";
				return;
			} else {
				console.log("Parse did not work. It's over.");
				this.currentState = "Parse";
				return;
			}
		},
		predictButtonClickHandler: async function () {
			console.log("Predict button pressed");
			if (this.currentState != "Predict") {
				console.log("You can only invoke this on predict mode");
				return;
			}
			this.currentState = "isPredicting";

			this.errors = {};

			if (this.bFighter.name.trim() == "" || !isNaN(this.bFighter.name)) {
				this.errors.bnamebad = 1;
				this.bFighter.name = "";
			}

			if (this.rFighter.name.trim() == "" || !isNaN(this.rFighter.name)) {
				this.errors.rnamebad = 1;
				this.rFighter.name = "";
			}

			if (
				this.bFighter.wins < 0 ||
				isNaN(this.bFighter.wins) ||
				this.bFighter.wins == ""
			) {
				this.errors.bwinsnegative = 1;
				this.bFighter.wins = "";
			}

			if (
				this.rFighter.wins < 0 ||
				isNaN(this.rFighter.wins) ||
				this.rFighter.wins == ""
			) {
				this.errors.rwinsnegative = 1;
				this.rFighter.wins = "";
			}

			if (
				this.bFighter.losses < 0 ||
				isNaN(this.bFighter.losses) ||
				this.bFighter.losses == ""
			) {
				this.errors.blossesnegative = 1;
				this.bFighter.losses = "";
			}

			if (
				this.rFighter.losses < 0 ||
				isNaN(this.rFighter.losses) ||
				this.rFighter.losses == ""
			) {
				this.errors.rlossesnegative = 1;
				this.rFighter.losses = "";
			}

			if (
				this.bFighter.height < 0 ||
				isNaN(this.bFighter.height) ||
				this.bFighter.height == ""
			) {
				this.errors.bheightnegative = 1;
				this.bFighter.height = "";
			}
			if (
				this.rFighter.height < 0 ||
				isNaN(this.rFighter.height) ||
				this.rFighter.height == ""
			) {
				this.errors.rheightnegative = 1;
				this.rFighter.height = "";
			}

			if (
				this.bFighter.reach < 0 ||
				isNaN(this.bFighter.reach) ||
				this.bFighter.reach == ""
			) {
				this.errors.breachnegative = 1;
				this.bFighter.reach = "";
			}
			if (
				this.rFighter.reach < 0 ||
				isNaN(this.rFighter.reach) ||
				this.rFighter.reach == ""
			) {
				this.errors.rreachnegative = 1;
				this.rFighter.reach = "";
			}

			if (
				this.bFighter.streak == 0 ||
				isNaN(this.bFighter.streak) ||
				this.bFighter.streak == ""
			) {
				this.errors.bstreaknegative = 1;
				this.bFighter.streak = "";
			}

			if (
				this.rFighter.streak == 0 ||
				isNaN(this.rFighter.streak) ||
				this.rFighter.streak == ""
			) {
				this.errors.rstreaknegative = 1;
				this.rFighter.streak = "";
			}

			if (this.rFighter.odds == "" || isNaN(this.rFighter.odds)) {
				this.errors.rodds = 1;
				this.rFighter.odds = "";
			}
			if (this.bFighter.odds == "" || isNaN(this.bFighter.odds)) {
				this.errors.bodds = 1;
				this.bFighter.odds = "";
			}

			if (Object.keys(this.errors).length > 0) {
				this.currentState = "Predict";
				return;
			}

			let fight = { rFighter: this.rFighter, bFighter: this.bFighter };
			let response = await postPredict(fight);
			console.log(response.status);
			if (response.status == 201) {
				let label = (await response.text()).trim();
				console.log("Predicted label: " + label);

				if (label == "Red") {
					this.redWin = true;
					this.blueWin = false;
				} else if (label == "Blue") {
					this.blueWin = true;
					this.redWin = false;
				}
				this.label = label;

				this.currentState = "DonePredict";
				return;
			} else {
				alert(response.status + response.statusText);
				this.currentState = "Parse";
			}
		},

		editDataButtonClickHandler: async function () {
			if (this.fights.length == 0) return;
			this.fights.forEach((fight) => {
				fight.new_label = fight.winner;
			});
			this.isEditing = true;
			this.changedFights = [];
		},
		saveDataButtonClickHandler: async function () {
			this.isEditing = false;

			if (this.changedFights.length == 0) {
				return;
			}

			let response = await patchSavedFights(this.changedFights);
			this.loadFights();

			// last resort
			// window.location.reload();
		},

		changeLabel: function (fight) {
			console.log(fight.new_label);
			console.log(fight.winner);
			if (fight.new_label != fight.winner) {
				this.changedFights.push(fight);
			}
		},

		delDataButtonClickHandler: async function (fight) {
			if (!this.isEditing) {
				return;
			}

			response = await deleteSavedFights(fight);
			if (response.status == 204) {
				this.loadFights();
			}
		},

		saveButtonClickHandler: async function () {
			if (this.currentState != "DonePredict") {
				console.log("Can only save after predicting");
				return;
			}
			let fightRecord = {
				red_name: this.rFighter.name,
				blue_name: this.bFighter.name,
				red_odds: this.rFighter.odds,
				blue_odds: this.bFighter.odds,
				red_wins: this.rFighter.wins,
				blue_wins: this.bFighter.wins,
				loss_streak_dif: 1,
				win_streak_dif: 1,
				age_dif: this.bFighter.age - this.rFighter.age,
				height_dif: this.bFighter.height - this.rFighter.height,
				reach_dif: this.bFighter.reach - this.rFighter.reach,
				winner: this.label,
			};

			let response = await postSavedFights(fightRecord);
			if (response.status == 201) {
				this.redWin = false;
				this.blueWin = false;
				this.clearRFighter();
				this.clearBFighter();
				this.currentState = "Parse";
				this.label = "";
				this.loadFights();
			}
		},

		isState: function (state) {
			return States[this.currentState] == States[state];
		},
	},

	computed: {
		redLinkError: function () {
			let value = this.errors.rlink_empty == 1 || this.errors.rlink == 1;
			return value;
		},
		blueLinkError: function () {
			let value = this.errors.blink_empty == 1 || this.errors.blink == 1;
			return value;
		},
		redOddsError: function () {
			let value = this.errors.rodds_empty == 1 || this.errors.rodds == 1;
			return value;
		},
		blueOddsError: function () {
			let value = this.errors.bodds_empty == 1 || this.errors.bodds == 1;
			return value;
		},

		blueNameError: function () {
			let value = this.errors.bnamebad;
			return value;
		},

		redNameError: function () {
			let value = this.errors.rnamebad;
			return value;
		},

		blueWinsError: function () {
			let value = this.errors.bwinsnegative;
			return value;
		},
		redWinsError: function () {
			let value = this.errors.rwinsnegative;
			return value;
		},
		blueLossesError: function () {
			let value = this.errors.blossesnegative;
			return value;
		},
		redLossesError: function () {
			let value = this.errors.rlossesnegative;
			return value;
		},
		blueHeightError: function () {
			let value = this.errors.bheightnegative;
			return value;
		},
		redHeightError: function () {
			let value = this.errors.rheightnegative;
			return value;
		},
		blueReachError: function () {
			let value = this.errors.breachnegative;
			return value;
		},
		redReachError: function () {
			let value = this.errors.rreachnegative;
			return value;
		},
		blueStreakError: function () {
			let value = this.errors.bstreaknegative;
			return value;
		},
		redStreakError: function () {
			let value = this.errors.rstreaknegative;
			return value;
		},
	},
	// called once when it loads
	created: function () {
		this.loadFights();
		this.currentState = "Parse";
		this.errors = {};
	},
}).mount("#app");
