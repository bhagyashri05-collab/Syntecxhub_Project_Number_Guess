from flask import Flask, request, jsonify, render_template
from student_manager import StudentManager
import os

app = Flask(__name__)
manager = StudentManager('students.json')


@app.route('/')
def index():
    """Serve the main HTML page."""
    return render_template('index.html')


@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all student records."""
    students = manager.list_students()
    return jsonify({
        'success': True,
        'students': students,
        'count': len(students)
    })


@app.route('/api/students', methods=['POST'])
def add_student():
    """Add a new student record."""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    name = data.get('name', '').strip()
    student_id = data.get('id', '').strip()
    grade = data.get('grade', '').strip()
    
    success, message = manager.add_student(name, student_id, grade)
    
    if success:
        return jsonify({'success': True, 'message': message}), 201
    else:
        return jsonify({'success': False, 'message': message}), 400


@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update an existing student record."""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    name = data.get('name')
    grade = data.get('grade')
    
    if name is not None:
        name = name.strip()
    if grade is not None:
        grade = grade.strip()
    
    success, message = manager.update_student(student_id, name, grade)
    
    if success:
        return jsonify({'success': True, 'message': message})
    else:
        return jsonify({'success': False, 'message': message}), 400


@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student record."""
    success, message = manager.delete_student(student_id)
    
    if success:
        return jsonify({'success': True, 'message': message})
    else:
        return jsonify({'success': False, 'message': message}), 404


@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get a single student by ID."""
    student = manager.get_student_by_id(student_id)
    
    if student:
        return jsonify({'success': True, 'student': student.to_dict()})
    else:
        return jsonify({'success': False, 'message': 'Student not found'}), 404


if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    app.run(debug=True, port=5000)

