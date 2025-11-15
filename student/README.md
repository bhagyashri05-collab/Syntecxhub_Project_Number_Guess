# Student Management System

A web-based Student Management System built with Python Flask for managing student records. This application demonstrates Object-Oriented Programming (OOP) concepts, file I/O operations, and RESTful API design.

## Features

- ✅ **Add Students**: Create new student records with name, ID, and grade
- ✅ **Update Students**: Edit existing student information
- ✅ **Delete Students**: Remove student records
- ✅ **List Students**: View all student records in a formatted table
- ✅ **Validation**: Unique ID validation and input validation
- ✅ **Persistent Storage**: Data saved to JSON file
- ✅ **Modern UI**: Beautiful, responsive web interface

## Architecture

### OOP Design

1. **Student Class** (`student.py`):
   - Encapsulates student data (name, id, grade)
   - Provides methods for serialization/deserialization
   - Demonstrates constructors and class methods

2. **StudentManager Class** (`student_manager.py`):
   - Manages collection of student records
   - Handles all CRUD operations (Create, Read, Update, Delete)
   - Implements file I/O operations (JSON persistence)
   - Provides validation logic

3. **Flask Application** (`app.py`):
   - RESTful API endpoints
   - Serves web interface
   - Connects frontend with backend logic

## Installation

1. **Install Python** (3.8 or higher)

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the Flask server**:
   ```bash
   python app.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **Manage students**:
   - Fill in the form to add new students
   - Click "Edit" to modify existing records
   - Click "Delete" to remove records
   - All changes are automatically saved to `students.json`

## File Structure

```
student/
├── app.py                 # Flask application and API routes
├── student.py             # Student class definition
├── student_manager.py     # StudentManager class with file I/O
├── requirements.txt       # Python dependencies
├── students.json          # Data storage (created automatically)
├── templates/
│   └── index.html         # Main web interface
└── static/
    ├── style.css          # Styling
    └── script.js          # Frontend JavaScript
```

## API Endpoints

- `GET /api/students` - Get all students
- `POST /api/students` - Add a new student
- `GET /api/students/<id>` - Get a specific student
- `PUT /api/students/<id>` - Update a student
- `DELETE /api/students/<id>` - Delete a student

## Concepts Demonstrated

- **OOP Basics**: Classes, constructors, methods, encapsulation
- **File I/O**: Reading and writing JSON files
- **Data Validation**: Unique ID checks, input validation
- **RESTful API**: HTTP methods for CRUD operations
- **Separation of Concerns**: Model, Manager, and Controller layers

## Data Format

Students are stored in JSON format:
```json
[
  {
    "name": "John Doe",
    "id": "S001",
    "grade": "A"
  },
  {
    "name": "Jane Smith",
    "id": "S002",
    "grade": "B+"
  }
]
```

## License

This project is for educational purposes.

