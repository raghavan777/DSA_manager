import express from "express";
import {
    getTopics,
    createTopic,
    getTopicBySlug,
    toggleProblemCompletion
} from "../controllers/topicController.js";

const router = express.Router();

router.get("/", getTopics);
router.post("/", createTopic);
router.get("/:slug", getTopicBySlug);
router.patch("/:topicSlug/problems/:problemId", toggleProblemCompletion);

export default router;