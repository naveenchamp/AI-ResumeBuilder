// ============================================
// ChatHistory.model.js - AI Chat Conversation Log
// ============================================
// Stores conversation history between user and AI agents.
// Maintains context for multi-turn interactions.
// Supports different AI agent types (interview, bulletWriter, etc.)
// ============================================

import mongoose from 'mongoose';

/**
 * Message schema - Single message in conversation
 * Tracks: speaker role, message content, and timestamp
 */
const messageSchema = new mongoose.Schema(
  {
    // Who sent this message: 'user' or 'assistant' (AI)
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },

    // Message text content
    content: {
      type: String,
      required: true,
    },

    // When message was sent (auto-set)
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Don't generate separate IDs for messages
);

/**
 * Chat History schema - Full conversation session
 * Stores complete history of conversations between user and AI
 */
const chatHistorySchema = new mongoose.Schema(
  {
    // Which resume this conversation is about
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },

    // Which user owns this conversation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Type of AI agent having the conversation
    // 'interview': coaching for interview questions
    // 'bulletWriter': generating bullet points
    // 'atsScorer': discussing ATS score
    // 'reviewer': getting resume review feedback
    agentType: {
      type: String,
      enum: ['interview', 'bulletWriter', 'atsScorer', 'reviewer'],
      required: true,
    },

    // Array of all messages in this conversation (chronological order)
    messages: [messageSchema],

    // Additional context about the conversation
    metadata: {
      sectionTargeted: { type: String, default: '' }, // Which resume section is being discussed?
      completedAt: { type: Date },                     // When was conversation marked complete?
    },
  },
  {
    // Auto-generates createdAt and updatedAt
    timestamps: true,
  }
);

// ========== INDEXES ==========
// Index for finding chat histories by resume and agent type
// Improves query performance
chatHistorySchema.index({ resumeId: 1, agentType: 1 });

// Create and export the ChatHistory model
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
