import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        maxLength: 100,
        required: true,
    },
    description: {
        type: String,
        default: "",
        maxLength: 500,
    },
    status: {
        type: String,
        enum: ["pending", "active", "completed"],
        default: "pending",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    category: {
        type: String,
        default: "General",
    },
    dueDate: {
        type: Date,
        default: null,
    },
},
    {
        timestamps: true,
        versionKey: false,
    });

const Task = mongoose.model("Task", taskSchema);

export default Task;