from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import mediapipe as mp
import tensorflow as tf
import cv2
import base64
import json
import os
import psycopg2
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Holistic
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Load TensorFlow model
# In a real implementation, you would load your trained model here
# model = tf.keras.models.load_model('procrastination_model.h5')

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            database=os.environ.get('DB_NAME', 'procrastination_db'),
            user=os.environ.get('DB_USER', 'postgres'),
            password=os.environ.get('DB_PASSWORD', 'postgres')
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

# Extract landmarks from MediaPipe results
def extract_landmarks(results):
    # Initialize empty arrays for all landmarks
    face_landmarks = []
    pose_landmarks = []
    left_hand_landmarks = []
    right_hand_landmarks = []
    
    # Extract face landmarks (468 points)
    if results.face_landmarks:
        for landmark in results.face_landmarks.landmark:
            face_landmarks.extend([landmark.x, landmark.y, landmark.z])
    else:
        # Pad with zeros if no face detected
        face_landmarks = [0] * (468 * 3)
    
    # Extract pose landmarks (33 points)
    if results.pose_landmarks:
        for landmark in results.pose_landmarks.landmark:
            pose_landmarks.extend([landmark.x, landmark.y, landmark.z])
    else:
        pose_landmarks = [0] * (33 * 3)
    
    # Extract left hand landmarks (21 points)
    if results.left_hand_landmarks:
        for landmark in results.left_hand_landmarks.landmark:
            left_hand_landmarks.extend([landmark.x, landmark.y, landmark.z])
    else:
        left_hand_landmarks = [0] * (21 * 3)
    
    # Extract right hand landmarks (21 points)
    if results.right_hand_landmarks:
        for landmark in results.right_hand_landmarks.landmark:
            right_hand_landmarks.extend([landmark.x, landmark.y, landmark.z])
    else:
        right_hand_landmarks = [0] * (21 * 3)
    
    # Combine all landmarks into a single feature vector
    # Total: 468 (face) + 33 (pose) + 21 (left hand) + 21 (right hand) = 543 points
    # Each point has x, y, z coordinates, so total features = 543 * 3 = 1629
    combined_landmarks = face_landmarks + pose_landmarks + left_hand_landmarks + right_hand_landmarks
    
    return np.array(combined_landmarks)

# Define procrastination behaviors and their detection functions
def is_looking_away(landmarks, threshold=0.2):
    # In a real implementation, this would analyze face orientation
    # Here we're using a simplified approach
    if len(landmarks) >= 1404:  # Ensure we have face landmarks
        # Extract face direction from landmarks
        # This is a simplified example - real implementation would be more complex
        face_x = landmarks[0]  # X coordinate of first face landmark
        return abs(face_x - 0.5) > threshold
    return False

def is_using_phone(landmarks):
    # Detect if hands are in a position suggesting phone use
    # This would analyze hand positions relative to body
    # Simplified implementation
    return np.random.random() < 0.3  # 30% chance of detection for demo

def has_slouching_posture(landmarks):
    # Analyze pose landmarks to detect slouching
    # Would compare shoulder and spine positions
    # Simplified implementation
    return np.random.random() < 0.25  # 25% chance of detection for demo

def is_yawning(landmarks):
    # Detect mouth opening characteristic of yawning
    # Would analyze mouth landmarks
    # Simplified implementation
    return np.random.random() < 0.15  # 15% chance of detection for demo

def has_distracted_movements(landmarks):
    # Analyze rapid or fidgety movements
    # Would compare landmarks across multiple frames
    # Simplified implementation
    return np.random.random() < 0.2  # 20% chance of detection for demo

# Process frame and detect procrastination
def detect_procrastination(frame):
    # Convert BGR to RGB
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process the image with MediaPipe
    results = holistic.process(image)
    
    # Extract landmarks
    landmarks = extract_landmarks(results)
    
    # In a real implementation, you would use your TensorFlow model here
    # prediction = model.predict(np.expand_dims(landmarks, axis=0))[0]
    
    # For demonstration, we'll use our behavior detection functions
    behaviors = []
    if is_looking_away(landmarks):
        behaviors.append("Looking away from screen")
    
    if is_using_phone(landmarks):
        behaviors.append("Phone usage detected")
    
    if has_slouching_posture(landmarks):
        behaviors.append("Slouching posture")
    
    if is_yawning(landmarks):
        behaviors.append("Frequent yawning")
    
    if has_distracted_movements(landmarks):
        behaviors.append("Distracted hand movements")
    
    # Calculate procrastination score (0-5)
    # In a real implementation, this would be based on model prediction
    score = len(behaviors) * (5/5)  # Scale to 0-5
    
    return {
        "score": float(score),
        "behaviors": behaviors,
        "timestamp": datetime.now().isoformat()
    }

# API endpoint for procrastination detection
@app.route('/api/detect', methods=['POST'])
def process_frame():
    try:
        # Get the image data from the request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'Missing image data'}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Process the frame and detect procrastination
        result = detect_procrastination(frame)
        
        # Save results to database
        user_id = data.get('user_id')
        session_id = data.get('session_id')
        if user_id and session_id:
            save_detection_result(user_id, session_id, result)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error processing detection request: {e}")
        return jsonify({'error': 'Failed to process detection request'}), 500

# Save detection results to database
def save_detection_result(user_id, session_id, result):
    conn = get_db_connection()
    if not conn:
        logger.error("Failed to connect to database")
        return
    
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO detection_results 
            (user_id, session_id, score, behaviors, timestamp)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id, 
                session_id, 
                result['score'], 
                json.dumps(result['behaviors']), 
                result['timestamp']
            )
        )
        conn.commit()
        cur.close()
    except Exception as e:
        logger.error(f"Database error: {e}")
    finally:
        conn.close()

# API endpoint for user statistics
@app.route('/api/stats/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        
        # Get average procrastination score
        cur.execute(
            """
            SELECT AVG(score) FROM detection_results 
            WHERE user_id = %s AND timestamp > NOW() - INTERVAL '30 days'
            """,
            (user_id,)
        )
        avg_score = cur.fetchone()[0] or 0
        
        # Get most common procrastination behaviors
        cur.execute(
            """
            SELECT behaviors FROM detection_results 
            WHERE user_id = %s AND timestamp > NOW() - INTERVAL '30 days'
            """,
            (user_id,)
        )
        
        # Process behaviors to find most common ones
        all_behaviors = []
        for row in cur.fetchall():
            behaviors = json.loads(row[0])
            all_behaviors.extend(behaviors)
        
        behavior_counts = {}
        for behavior in all_behaviors:
            if behavior in behavior_counts:
                behavior_counts[behavior] += 1
            else:
                behavior_counts[behavior] = 1
        
        # Sort behaviors by frequency
        common_behaviors = sorted(
            behavior_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        
        # Get study session statistics
        cur.execute(
            """
            SELECT 
                COUNT(DISTINCT session_id) as session_count,
                SUM(EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 3600) as total_hours
            FROM detection_results 
            WHERE user_id = %s AND timestamp > NOW() - INTERVAL '30 days'
            GROUP BY user_id
            """,
            (user_id,)
        )
        
        stats_row = cur.fetchone()
        if stats_row:
            session_count, total_hours = stats_row
        else:
            session_count, total_hours = 0, 0
        
        cur.close()
        
        return jsonify({
            'avg_procrastination_score': float(avg_score),
            'common_behaviors': [{'behavior': b, 'count': c} for b, c in common_behaviors],
            'session_count': session_count,
            'total_study_hours': float(total_hours) if total_hours else 0,
            'days_analyzed': 30
        })
    
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        return jsonify({'error': 'Failed to retrieve user statistics'}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

