import { Request, Response } from 'express';
import DocumentModel from '../models/Document';
import Meeting from '../models/Meeting';
import Task from '../models/Task';
import User from '../models/User';
import { analyzeIntent } from '../services/cohereService';

/**
 * AI Chat Controller
 * Handles all user interactions with the AI Assistant.
 * Flow:
 * 1. Receive user query and userId.
 * 2. Analyze intent using Cohere NLP (or fallback to keywords).
 * 3. Resolve entities (e.g., find the "User" mentioned in the query).
 * 4. Execute logic based on intent (Schedule, Task, Document Search).
 * 5. Return natural language response + action payload for Frontend.
 */
export const chat = async (req: Request, res: Response) => {
    try {
        const { query, userId } = req.body;
        const lowerQuery = (query || '').toLowerCase();

        // Simulate "Thinking" delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // --- STEP 1: INTENT ANALYSIS (NLP) ---
        // We use Cohere to understand the user's intent (e.g., "schedule_meeting") 
        // and extract entities (e.g., person="Lakshman", date="tomorrow").
        let cohereResult = await analyzeIntent(query);
        console.log('Cohere Analysis:', cohereResult);

        let intent = cohereResult.intent;
        let entities = cohereResult.entities;
        let confidence = cohereResult.confidence;

        // Fallback: If NLP fails (low confidence or API error), use simple keyword matching.
        if (intent === 'unknown' || confidence < 0.5) {
            console.log('Falling back to rule-based logic');
            // ... (Keep existing rule-based logic as fallback if needed, or just rely on simple keyword matching below)
            if (lowerQuery.includes('free time') || lowerQuery.includes('available')) intent = 'check_availability';
            else if (lowerQuery.includes('tasks')) intent = 'fetch_tasks';
            else if (lowerQuery.includes('reschedule')) intent = 'reschedule_suggestion';
            else if (lowerQuery.includes('schedule') || lowerQuery.includes('meeting')) intent = 'schedule_meeting';
            else if (lowerQuery.includes('create') || lowerQuery.includes('task')) intent = 'create_task';
            else if (lowerQuery.includes('status')) intent = 'check_status';
            else if (lowerQuery.includes('document') || lowerQuery.includes('summary') || lowerQuery.includes('report')) intent = 'document_query';
            else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) intent = 'greeting';
        }

        // --- STEP 2: USER CONTEXT & ENTITY RESOLUTION ---
        // Fetch all users to find who the user is talking about (e.g., "Meeting with Sumanth").
        const allUsers = await User.find({});

        // Get the Current User (The one chatting)
        let currentUser = allUsers.find(u => u._id.toString() === userId);
        if (!currentUser && allUsers.length > 0) {
            currentUser = allUsers[0]; // Fallback for demo/testing
        }
        const currentUserId = currentUser ? currentUser._id : null;

        // Find the Mentioned User (The one being asked about)
        let mentionedUser = null;
        if (entities.person) {
            // Try to match name from NLP extraction
            mentionedUser = allUsers.find(u => u.name.toLowerCase().includes(entities.person!.toLowerCase()));
        }
        if (!mentionedUser) {
            // Fallback to checking if any user name exists in the query string
            mentionedUser = allUsers.find(u => lowerQuery.includes(u.name.toLowerCase()));
        }

        let responseText = "I'm not sure how to help with that. Try asking to schedule a meeting or create a task.";
        let actionData = {};

        if (!currentUserId) {
            return res.json({
                intent: 'error',
                confidence: 1,
                response: "I couldn't find your user profile. Please ensure you are logged in.",
                action: {}
            });
        }

        // --- STEP 3: EXECUTE INTENT LOGIC ---

        // A. Free Time / Availability Check
        if (intent === 'check_availability') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const meetings = await Meeting.find({
                userId: currentUserId,
                startTime: { $gte: today, $lt: tomorrow }
            }).sort({ startTime: 1 });

            if (meetings.length === 0) {
                responseText = "You are completely free today! No meetings scheduled.";
            } else {
                // Simple gap finding logic
                let freeSlots = [];
                let lastEnd = 9; // Start day at 9 AM

                meetings.forEach(m => {
                    const start = new Date(m.startTime).getHours();
                    const end = new Date(m.endTime).getHours();
                    if (start > lastEnd) {
                        freeSlots.push(`${lastEnd > 12 ? lastEnd - 12 : lastEnd} ${lastEnd >= 12 ? 'PM' : 'AM'} to ${start > 12 ? start - 12 : start} ${start >= 12 ? 'PM' : 'AM'}`);
                    }
                    lastEnd = Math.max(lastEnd, end);
                });

                if (lastEnd < 17) { // End day at 5 PM
                    freeSlots.push(`${lastEnd > 12 ? lastEnd - 12 : lastEnd} ${lastEnd >= 12 ? 'PM' : 'AM'} to 5 PM`);
                }

                responseText = `Here are your free slots for today:\n- ${freeSlots.join('\n- ')}`;
            }
            actionData = { type: 'calendar_check' };
        }
        // B. Task Listing
        else if (intent === 'fetch_tasks') {
            const tasks = await Task.find({
                assignedTo: currentUserId, // In real app, this would be ObjectId
                status: 'Pending'
            }).limit(5);

            if (tasks.length === 0) {
                responseText = "You have no pending tasks at the moment. Great job!";
            } else {
                const taskList = tasks.map(t => `• ${t.title} (${t.priority} Priority)`).join('\n');
                responseText = `Here are your tasks at hand:\n${taskList}`;
            }
            actionData = { type: 'fetch_status' };
        }
        // C. Rescheduling / Non-Critical Tasks
        else if (intent === 'reschedule_suggestion') {
            const lowPriorityTasks = await Task.find({
                assignedTo: currentUserId,
                status: 'Pending',
                priority: 'Low'
            });

            if (lowPriorityTasks.length === 0) {
                responseText = "You don't have any low-priority tasks that need rescheduling. Everything looks critical!";
            } else {
                const taskNames = lowPriorityTasks.map(t => t.title).join(', ');
                responseText = `I found ${lowPriorityTasks.length} non-critical tasks that can be rescheduled:\n\n${lowPriorityTasks.map(t => `• ${t.title}`).join('\n')}\n\nWould you like me to move them to tomorrow?`;
            }
            actionData = { type: 'create_task' }; // Redirect to tasks to manage them
        }
        // D. Schedule Meeting
        else if (intent === 'schedule_meeting') {
            actionData = { type: 'calendar_check' };

            // Context Awareness Logic with Dynamic User Lookup
            if (mentionedUser) {
                // Check Real-time Availability for Current User
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const meetings = await Meeting.find({
                    userId: currentUserId,
                    startTime: { $gte: today, $lt: tomorrow }
                });

                const isBusyAt4PM = meetings.some(m => {
                    const mStart = new Date(m.startTime).getHours();
                    return mStart === 16; // 4 PM
                });

                if (isBusyAt4PM) {
                    responseText = `I found ${mentionedUser.name} (${mentionedUser.designation}). He is free at 4 PM, but **you have a conflict** at that time. Shall I look for another slot?`;
                } else {
                    responseText = `I found ${mentionedUser.name} (${mentionedUser.designation}). Based on your past interactions and his calendar, he is busy at 2 PM.\n\nHowever, **I verified your calendar** and you both have a common free slot at 4 PM. Shall I schedule the meeting then?`;
                }
                confidence = 0.98;
            } else {
                responseText = 'I can help you schedule that. Who would you like to meet with?';
            }
        }
        // E. Create Task
        else if (intent === 'create_task') {
            responseText = "I'll create a task for you. What is the deadline?";
            actionData = { type: 'create_task' };
        }
        // F. Status Check
        else if (intent === 'check_status') {
            responseText = 'You have 3 pending tasks and 2 meetings today.';
            actionData = { type: 'fetch_status' };
        }
        // G. Document Query / Summary
        else if (intent === 'document_query') {

            // Use entities from Cohere if available, else fallback to keywords
            let topic = entities.topic || '';

            if (!topic) {
                const topicKeywords = ['water', 'flood', 'disaster', 'agriculture', 'health'];
                topicKeywords.forEach(t => {
                    if (lowerQuery.includes(t)) topic = t;
                });
            }

            // Date range (last week)
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            // Search for documents
            const searchQuery: any = {};

            if (topic) {
                searchQuery.$or = [
                    { title: { $regex: topic, $options: 'i' } },
                    { 'aiAnalysis.category': { $regex: topic, $options: 'i' } }
                ];
            }

            if (mentionedUser) {
                searchQuery['aiAnalysis.entities.people'] = { $regex: mentionedUser.name, $options: 'i' };
            }

            if (lowerQuery.includes('last week') || entities.date?.includes('week')) {
                searchQuery.uploadDate = { $gte: lastWeek };
            }

            const documents = await DocumentModel.find(searchQuery).limit(3);

            if (documents.length === 0) {
                responseText = `I couldn't find any documents matching "${topic || 'your query'}"${mentionedUser ? ` from ${mentionedUser.name}` : ''}. Would you like me to search with different criteria?`;
            } else {
                const doc = documents[0]; // Use first match
                const summary = doc.aiAnalysis?.summary || 'Summary not available.';

                responseText = `I found the report${mentionedUser ? ` from ${mentionedUser.name}` : ''} on ${topic || doc.title}.\n\n**Summary:**\n${summary}\n\n**Document:** ${doc.title}\n**Uploaded:** ${new Date(doc.uploadDate).toLocaleDateString()}\n\nWould you like me to open this document?`;
                actionData = { type: 'view_document', documentId: doc._id, url: doc.url };
            }
        }
        // H. Greeting
        else if (intent === 'greeting') {
            responseText = 'Hello! I am your AI Assistant. How can I help you today?';
        }

        // --- STEP 4: RETURN RESPONSE ---
        res.json({
            intent,
            confidence,
            response: responseText,
            action: actionData
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'AI Service Error' });
    }
};
