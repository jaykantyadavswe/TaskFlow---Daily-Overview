import mongoose from "mongoose";

import Task from "../models/Task.js";

// GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });

        res.status(200).json(
            { success: true, data: tasks }
        );
    } catch (error) {
        res.status(500).json({ 
            success: false, message: "Error retrieving tasks", error 
        });
    }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, message: "Invalid task ID" 
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false, message: "Task not found" 
            });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ 
            success: false, message: "Error retrieving task", error 
        });
    }
};

// POST /api/tasks
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, category, dueDate } = req.body;

        if (typeof title !== 'string' || !title.trim()){
            return res.status(400).json({ 
                success: false, message: "A task title is required"
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || "",
            priority: priority,
            category: category,
            dueDate: dueDate || null,
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        if(error.name === 'ValidationError' || error.name === 'CastError') {  
            return res.status(400).json({ 
                success: false, message: "Invalid task data", error 
            });
        }

        res.status(500).json({ 
            success: false, message: "Failed to create task", error 
        });
    }
};

// PATCH /api/tasks/:id
export const updateTask = async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, message: "Invalid task ID" 
            });
        }

        const allowedFields = ['title', 'description', 'status', 'priority', 'category', 'dueDate'];
        const updateData = {};

        for (const field of allowedFields) {
            if (Object.hasOwn(req.body, field)) {
                updateData[field] = req.body[field];
            }
        }

        if(Object.hasOwn(updateData, 'title') && (typeof updateData.title !== 'string' || !updateData.title.trim())) {
            return res.status(400).json({ 
                success: false, message: "A task title is required" 
            });
        }

        if(typeof updateData.title === 'string') {
            updateData.title = updateData.title.trim();
        }

        if(Object.hasOwn(updateData, 'description') && typeof updateData.description === 'string') {
            updateData.description = updateData.description.trim();
        }

        if(Object.hasOwn(updateData, 'dueDate') && updateData.dueDate === '') {
            updateData.dueDate = null;
        }

        const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        if (!task) {
            return res.status(404).json({ 
                success: false, message: "Task not found" 
            });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        if(error.name === 'ValidationError' || error.name === 'CastError') {  
            return res.status(400).json({ 
                success: false, message: "Invalid task data", error 
            });
        }

        res.status(500).json({ 
            success: false, message: "Failed to update task", error 
        });
    }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, message: "Invalid task ID" 
            });
        }
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false, message: "Task not found" 
            });
        }

        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ 
            success: false, message: "Failed to delete task", error 
        });
    }
};
