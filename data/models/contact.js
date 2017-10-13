import mongoose from 'mongoose';

var contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }]
});

export default mongoose.model('contact', contactSchema);
