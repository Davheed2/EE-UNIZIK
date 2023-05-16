const { Schema, mongoose } = require("mongoose");

const commentSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    replies: [ 
        { 
            type: Schema.Types.ObjectId, 
            ref: "Comment" 
        } 
    ],
    postId: { 
        type: Schema.Types.ObjectId,
        ref: "Post" 
    }
}, {
    timestamps: true
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;