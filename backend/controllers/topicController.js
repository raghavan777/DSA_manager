import Topic from "../models/Topic.js";

export const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find().sort({ createdAt: -1 });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createTopic = async (req, res) => {
    try {
        const topic = new Topic(req.body);
        await topic.save();
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTopicBySlug = async (req, res) => {
    try {
        const topic = await Topic.findOne({ slug: req.params.slug });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleProblemCompletion = async (req, res) => {
    try {
        const { topicSlug, problemId } = req.params;
        const topic = await Topic.findOne({ slug: topicSlug });

        if (!topic) return res.status(404).json({ message: "Topic not found" });

        const problem = topic.problems.id(problemId);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        problem.completed = !problem.completed;
        await topic.save();

        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};