from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Initialize NLP Pipeline (Zero-Shot Classification)
# We use a smaller model for faster inference on local machine
print("Loading NLP Model...")
# device=-1 forces CPU, which avoids MPS hangs on some Mac setups
# classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-3", device=-1) 
print("NLP Model Loaded! (Simulated Mode)")

# Mock OCR and NLP for PoC - in production, integrate actual models
@app.route('/api/analyze-document', methods=['POST'])
def analyze_document():
    """
    Analyzes a document and extracts entities, summary, etc.
    For PoC, returns mock data. In production, integrate OCR + NLP models.
    """
    data = request.json
    document_url = data.get('url', '')
    document_title = data.get('title', '')
    
    # Mock AI Analysis
    analysis = {
        'summary': f'This document titled "{document_title}" contains critical information regarding government policies and administrative decisions.',
        'entities': {
            'people': ['Sri Venkata Rao', 'IAS Officer Sharma', 'Minister Reddy'],
            'places': ['Guntur', 'Visakhapatnam', 'Amaravati'],
            'dates': ['Nov 20, 2025', 'Dec 15, 2025']
        },
        'category': 'Government Order',
        'actionItems': [
            'Review budget allocation',
            'Approve district plan',
            'Schedule follow-up meeting'
        ]
    }
    
    return jsonify(analysis)

@app.route('/api/schedule-assistant', methods=['POST'])
def schedule_assistant():
    """
    Suggests optimal meeting times based on calendar conflicts.
    For PoC, returns mock suggestions.
    """
    data = request.json
    existing_meetings = data.get('meetings', [])
    
    # Define working hours (9 AM - 6 PM)
    work_start = 9
    work_end = 18
    
    # Simple logic: Find gaps in tomorrow's schedule
    # In a real app, we'd parse dates properly. For PoC, we assume 'Tomorrow'
    
    occupied_slots = []
    for meeting in existing_meetings:
        # Parse time "10:00 AM - 11:00 AM"
        if 'time' in meeting and '-' in meeting['time']:
            try:
                time_part = meeting['time'].split('-')[0].strip()
                # Convert to 24h format roughly for sorting
                hour = int(time_part.split(':')[0])
                if 'PM' in time_part and hour != 12:
                    hour += 12
                occupied_slots.append(hour)
            except:
                continue
                
    occupied_slots.sort()
    
    suggestions = []
    current_hour = work_start
    
    while current_hour < work_end:
        # Check if current hour is occupied
        is_occupied = False
        for busy_hour in occupied_slots:
            if abs(busy_hour - current_hour) < 1: # Simple collision check
                is_occupied = True
                break
        
        if not is_occupied:
            # Format time
            start_time = f"{current_hour if current_hour <= 12 else current_hour-12}:00 {'AM' if current_hour < 12 else 'PM'}"
            end_time = f"{current_hour + 1 if current_hour + 1 <= 12 else current_hour + 1 - 12}:00 {'AM' if current_hour + 1 < 12 else 'PM'}"
            
            suggestions.append({
                'time': f"{start_time} - {end_time}",
                'date': 'Tomorrow',
                'confidence': 90 - (len(suggestions) * 5) # Decrease confidence for later slots
            })
            
            if len(suggestions) >= 3: # Limit to 3 suggestions
                break
                
        current_hour += 1
            
    if not suggestions:
        suggestions = [
            {'time': '10:00 AM - 11:00 AM', 'date': 'Day After Tomorrow', 'confidence': 80}
        ]
    
    return jsonify({'suggestions': suggestions})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML Service is running'})

@app.route('/api/predict-duration', methods=['POST'])
def predict_duration():
    data = request.json
    description = data.get('description', '').lower()
    
    # Mock ML Logic: Keyword based prediction
    duration = "1 hour" # Default
    confidence = 0.5
    
    if 'report' in description:
        duration = "4 hours"
        confidence = 0.8
    elif 'email' in description or 'mail' in description:
        duration = "15 minutes"
        confidence = 0.9
    elif 'meeting' in description:
        duration = "1 hour"
        confidence = 0.85
    elif 'review' in description:
        duration = "2 hours"
        confidence = 0.7
    elif 'urgent' in description:
        duration = "30 minutes"
        confidence = 0.6
        
    return jsonify({
        "predicted_duration": duration,
        "confidence": confidence,
        "reasoning": f"Based on keywords in '{description}'"
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribes uploaded audio file.
    For PoC, returns mock transcription.
    """
    # In production:
    # 1. Save audio file from request.files['audio']
    # 2. Use whisper / speechrecognition to transcribe
    
    # Mock Response
    import time
    time.sleep(2) # Simulate processing
    
    return jsonify({
        'transcription': "Discussion about the upcoming budget allocation for the new district projects. Review of the timeline for the road expansion in Visakhapatnam. Action items include preparing the detailed report by next Friday.",
        'confidence': 0.92,
        'language': 'en-IN'
    })


@app.route('/api/assistant', methods=['POST'])
def assistant_chat():
    data = request.json
    query = data.get('query', '').lower()
    
    # Simulate processing time for "Thinking..." effect
    import time
    time.sleep(1.5)
    
    intent = "unknown"
    response_text = "I'm not sure how to help with that. Try asking to schedule a meeting or create a task."
    action_data = {}
    confidence = 0.95
    
    if 'schedule' in query or 'meeting' in query or 'doctor' in query:
        intent = "schedule a meeting"
        response_text = "I can help you schedule that. Checking your calendar for free slots..."
        action_data = {"type": "calendar_check"}
        
    elif 'task' in query or 'create' in query or 'remind' in query or 'buy' in query:
        intent = "create a task"
        response_text = "I'll create a task for you. What is the deadline?"
        action_data = {"type": "create_task"}
        
    elif 'status' in query or 'pending' in query or 'busy' in query:
        intent = "check status"
        response_text = "You have 3 pending tasks and 2 meetings today."
        action_data = {"type": "fetch_status"}
        
    elif 'hello' in query or 'hi' in query:
        intent = "greeting"
        response_text = "Hello! I am your AI Assistant. How can I help you today?"
        
    return jsonify({
        "intent": intent,
        "confidence": confidence,
        "response": response_text,
        "action": action_data
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5003))
    app.run(host='0.0.0.0', port=port, debug=True)
