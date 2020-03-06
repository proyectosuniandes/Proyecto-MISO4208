var mongoose = require('mongoose');

var testSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['RANDOM','E2E','BDT']
    },
	mode: {
		type: String,
		required: true,
		enum: ['HEADLESS','HEADFULL','VRT']
	},
    script: {
		type: String,
		requiered: true
	},
    description: {
        type: String,
        rquired:true
    },
    aplication_id: {
        type: String,
        required: true
    },
    version_id: {
        type: String,
        required: true
    },
	tool_id: {
        type: String,
        required: false
    },
    mutation: {
        type: String,
        default: 'N' 
    },
    mutation_value: {
        type: String
    },

	params: [{
        param: String,
    }],
},
{
	timestamps: true
}
);
testSchema.virtual('id').get(function () {
    return this._id;
  });
testSchema.virtual('app', {
    ref: 'Application', // The model to use
    localField: 'aplication_id', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    justOne: true // And only get the number of docs
});
  testSchema.set('toJSON', { getters: true, virtuals: true });
  testSchema.set('toObject', { getters: true });
var Test = module.exports = mongoose.model('test', testSchema);

module.exports.get = function (callback, limit) {
    Test.find(callback).limit(limit);
}