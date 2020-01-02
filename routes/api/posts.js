const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// @route POST /api/posts
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

// @route GET /api/posts
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

// @route GET /api/posts/:id
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

// @route Delete /api/posts/:id
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

// @route Put /api/posts/like/:id
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

// @route Put /api/posts/unlike/:id
// @desc  Unlike post by id
// @access Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" })
    }
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Get removed index
    const removedIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removedIndex, 1);
    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" })
    }
    res.status(500).send('Sever Error');

  }
});

// @route POST /api/posts/comment/:id
// @desc  comment post by id
// @access Private

router.post('/comment/:id', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    const newComment = {
      user: req.user.id,
      text: req.body.text,
      avatar: user.avatar,
      name: user.name
    }
    post.comments.unshift(newComment);

    await post.save();
    res.json(post.comments);

  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }

});

// @route DELETE /api/posts/comment/:id/:comment_id
// @desc  Delete comment by id
// @access Private

router.delete("/comment/:id/:comment_id",auth, async(req,res) => {
  try {
    const post = await Post.findById(req.params.id).select('-password');
    if(!post) {
      return res.status(404).json({msg:"Post not found"});
    }
    // Pull out of comment
    const comment = await post.comments.find(comment => comment.id === req.params.comment_id);

    // Make sure comment exists
    if(!comment) {
      return res.status(404).json({msg:'Comment not found'});
    }

    //check user 
    if(comment.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User unauthorized'});
    }

    // find index
    const removedIndex = post.comments.map(comment => comment.id).indexOf(req.params.comment_id);

    post.comments.splice(removedIndex, 1);

    await post.save();

    res.json(post.comments);


  } catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg:"Post not found"});
    }
    res.status(500).send('Server Error');
    
  }
})
 


module.exports = router;