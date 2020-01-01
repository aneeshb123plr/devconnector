const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// @route POST /api/post
// @desc  create post
// @access Private
router.post("/", [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const user = await User.findById(req.user.id).select('-password');
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })

    const post = await newPost.save();

    return res.json(post);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');

  }

});

// @route GET /api/post
// @desc  Get all post
// @access Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);

  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route GET /api/post/:id
// @desc  Get post by id
// @access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.json(post);

  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    return res.status(500).send('Server Error');
  }
});

// @route Delete /api/post/:id
// @desc  Delete post by id
// @access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User is unauthorized" });
    }
    await post.remove();
    return res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send('Server Error');
  }
});

// @route Put /api/post/like/:id
// @desc  Like post by id
// @access Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    // Check if the post has already been liked
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);

  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send('Server Error');

  }
});

// @route Put /api/post/unlike/:id
// @desc  Unlike post by id
// @access Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
     const post = await Post.findById(req.params.id);
     if(!post){
       return res.status(404).json({msg:"Post not found"})
     }
     if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
       return res.status(400).json({msg: "Post has not yet been liked"});
     }

     // Get removed index
     const removedIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
     post.likes.splice(removedIndex,1);
     await post.save();

     return res.json(post.likes);
    } catch (err) {
    console.error(err.message);
    if(err.kind === "ObjectId"){
      return res.status(404).json({msg:"Post not found"})
    }
    res.status(500).send('Sever Error');
    
  }
})

module.exports = router;