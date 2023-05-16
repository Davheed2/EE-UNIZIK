const { Schema, mongoose } = require("mongoose");

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      // required: true
    },
    description: {
      type: String,
      required: true,
    },
    // type:{
    //     type: String,
    //     required: true
    // },
    // slug:{
    //     type: String,
    //     required: true
    // },
    // excerpt:{
    //     type: String,
    //     required: true
    // },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
