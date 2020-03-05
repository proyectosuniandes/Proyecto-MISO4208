const mongoose = require('mongoose');

const ApplicationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['WEB', 'MOVIL']
    },
    versions: 
		[{
			version_id: String,
		}],
    },
    //Mongoose uses this option to automatically add two new fields - createdAt and updatedAt to the schema.
    {
        timestamps: true
    });
    ApplicationSchema.virtual('id').get(function () {
        return this._id;
      });
   ApplicationSchema.set('toJSON', { getters: true, virtuals: true });
   ApplicationSchema.set('toObject', { getters: true });
module.exports = mongoose.model('Application', ApplicationSchema);