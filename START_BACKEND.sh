#!/bin/bash
# Quick Start Guide for LearnByEmotion with TensorFlow Integration

echo "=================================="
echo "LearnByEmotion with TensorFlow"
echo "Quick Start Guide"
echo "=================================="
echo ""

# Check Python
echo "✓ Checking Python..."
python --version
echo ""

# Install dependencies
echo "✓ Installing backend dependencies..."
cd backend
pip install -r requirements.txt
echo ""

# Test TensorFlow
echo "✓ Testing TensorFlow installation..."
python -c "import tensorflow as tf; print(f'TensorFlow {tf.__version__} loaded')"
echo ""

# Run integration tests
echo "✓ Running integration tests..."
python test_emotion_integration.py
echo ""

# Start Flask server
echo "✓ Starting Flask server..."
echo "Server will be available at: http://localhost:5000"
python app.py
