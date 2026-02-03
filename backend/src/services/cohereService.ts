import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

dotenv.config();

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY || '',
});

interface AIAnalysisResult {
    intent: string;
    entities: {
        person?: string;
        topic?: string;
        date?: string;
        documentType?: string;
    };
    confidence: number;
}

export const analyzeIntent = async (query: string): Promise<AIAnalysisResult> => {
    if (!process.env.COHERE_API_KEY) {
        console.warn('COHERE_API_KEY not found, falling back to rule-based logic.');
        return { intent: 'unknown', entities: {}, confidence: 0 };
    }

    try {
        // We use the Chat API to get structured JSON output for intent and entities
        // This is more flexible than the Classify API for extracting entities simultaneously
        const prompt = `
        You are an AI assistant for a government officer. Analyze the following user query and extract the INTENT and ENTITIES.
        
        Possible Intents:
        - check_availability (checking free time, calendar slots)
        - fetch_tasks (listing pending tasks)
        - reschedule_suggestion (finding non-critical tasks to move)
        - schedule_meeting (scheduling a new meeting)
        - create_task (creating a new task)
        - check_status (general status check)
        - document_query (searching for reports, documents, summaries)
        - greeting (hello, hi)
        
        Query: "${query}"
        
        Return ONLY a JSON object in this format:
        {
            "intent": "one_of_the_above_intents",
            "entities": {
                "person": "extracted_person_name_or_null",
                "topic": "extracted_topic_or_keyword_or_null",
                "date": "extracted_date_reference_or_null",
                "documentType": "report_or_summary_or_null"
            }
        }
        `;

        const response = await cohere.chat({
            message: prompt,
            temperature: 0, // Low temperature for deterministic output
        });

        const text = response.text;

        // Parse JSON from the response
        // Sometimes LLMs add markdown code blocks, so we clean it
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonString);

        return {
            intent: result.intent || 'unknown',
            entities: result.entities || {},
            confidence: 0.9 // Cohere chat doesn't return a confidence score for generation, so we assume high if it parsed
        };

    } catch (error) {
        console.error('Cohere API Error:', error);
        return { intent: 'unknown', entities: {}, confidence: 0 };
    }
};
