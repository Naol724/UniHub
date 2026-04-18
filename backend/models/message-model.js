// backend/models/message-model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: function() {
            // roomID is required for team messages, but for private messages we use sender/receiver
            return !this.receiverId;
        }
    },
    senderUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function() {
            // receiverId is required for private messages
            return !this.roomID;
        }
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;