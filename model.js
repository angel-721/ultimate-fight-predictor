const mongoose = require("mongoose");

mongoose.connect(
	process.env.DBLINK
);

const fightSchema = new mongoose.Schema({
	red_name: {
		type: String,
	},
	blue_name: {
		type: String,
	},

	red_odds: {
		type: Number,
		bsonType: "int",
		required: [true, "The red fighter betting odds must be present"],
	},
	blue_odds: {
		type: Number,
		bsonType: "int",
		required: [true, "The blue fighter betting odds must be present"],
	},

	red_wins: {
		type: Number,
		bsonType: "int",
		minimum: [0, "You can't have negative wins"],
		required: [true, "The red fighter betting wins must be present"],
	},
	blue_wins: {
		type: Number,
		bsonType: "int",
		minimum: [0, "You can't have negative wins"],
		required: [true, "The blue fighter betting wins must be present"],
	},
	loss_streak_dif: {
		type: Number,
		bsonType: "int",
		required: [true, "There must be a loss_streak_dif for the model"],
	},
	win_streak_dif: {
		type: Number,
		bsonType: "int",
		required: [true, "There must be a win_streak_dif for the model"],
	},
	age_dif: {
		type: Number,
		bsonType: "int",
		required: [true, "There must be a age_dif for the model"],
	},
	height_dif: {
		type: Number,
		bsonType: "int",
		required: [true, "There must be a height_dif for the model"],
	},
	reach_dif: {
		type: Number,
		bsonType: "int",
		required: [true, "There must be a reach_dif for the model"],
	},
	winner: {
		type: String,
		enum: ["Red", "Blue"],
		required: [true, "There must be a reach_dif for the model"],
	},
});

const FightRecord = mongoose.model("FightRecord", fightSchema);
module.exports = {
	FightRecord: FightRecord,
};
