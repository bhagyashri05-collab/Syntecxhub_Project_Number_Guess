import json
import os
from typing import List, Optional
from student import Student


class StudentManager:
    """Manages student records with file persistence."""
    
    def __init__(self, filename: str = 'students.json'):
        """
        Initialize StudentManager with a file for persistence.
        
        Args:
            filename: Path to JSON file for storing student records
        """
        self.filename = filename
        self.students: List[Student] = []
        self.load_students()
    
    def load_students(self) -> None:
        """Load student records from JSON file."""
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.students = [Student.from_dict(item) for item in data]
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error loading students: {e}")
                self.students = []
        else:
            self.students = []
    
    def save_students(self) -> bool:
        """Save student records to JSON file."""
        try:
            with open(self.filename, 'w', encoding='utf-8') as f:
                data = [student.to_dict() for student in self.students]
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving students: {e}")
            return False
    
    def add_student(self, name: str, student_id: str, grade: str) -> tuple[bool, str]:
        """
        Add a new student record.
        
        Args:
            name: Student's name
            student_id: Unique student ID
            grade: Student's grade
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        # Validate ID is unique
        if self.get_student_by_id(student_id) is not None:
            return False, f"Student ID '{student_id}' already exists. IDs must be unique."
        
        # Validate inputs
        if not name or not name.strip():
            return False, "Student name cannot be empty."
        
        if not student_id or not student_id.strip():
            return False, "Student ID cannot be empty."
        
        if not grade or not grade.strip():
            return False, "Student grade cannot be empty."
        
        # Create and add student
        student = Student(name.strip(), student_id.strip(), grade.strip())
        self.students.append(student)
        
        if self.save_students():
            return True, f"Student '{name}' added successfully."
        else:
            self.students.pop()  # Remove if save failed
            return False, "Failed to save student record."
    
    def update_student(self, student_id: str, name: Optional[str] = None, 
                      grade: Optional[str] = None) -> tuple[bool, str]:
        """
        Update an existing student record.
        
        Args:
            student_id: ID of student to update
            name: New name (optional)
            grade: New grade (optional)
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        student = self.get_student_by_id(student_id)
        if student is None:
            return False, f"Student with ID '{student_id}' not found."
        
        # Update fields if provided
        if name is not None:
            if not name.strip():
                return False, "Student name cannot be empty."
            student.name = name.strip()
        
        if grade is not None:
            if not grade.strip():
                return False, "Student grade cannot be empty."
            student.grade = grade.strip()
        
        if self.save_students():
            return True, f"Student '{student_id}' updated successfully."
        else:
            return False, "Failed to save updated student record."
    
    def delete_student(self, student_id: str) -> tuple[bool, str]:
        """
        Delete a student record.
        
        Args:
            student_id: ID of student to delete
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        student = self.get_student_by_id(student_id)
        if student is None:
            return False, f"Student with ID '{student_id}' not found."
        
        self.students.remove(student)
        
        if self.save_students():
            return True, f"Student '{student_id}' deleted successfully."
        else:
            self.students.append(student)  # Restore if save failed
            return False, "Failed to delete student record."
    
    def get_student_by_id(self, student_id: str) -> Optional[Student]:
        """
        Get a student by their ID.
        
        Args:
            student_id: Student ID to search for
            
        Returns:
            Student object if found, None otherwise
        """
        for student in self.students:
            if student.id == student_id:
                return student
        return None
    
    def list_students(self) -> List[dict]:
        """
        Get all student records as dictionaries.
        
        Returns:
            List of student dictionaries
        """
        return [student.to_dict() for student in self.students]
    
    def get_student_count(self) -> int:
        """Get the total number of students."""
        return len(self.students)

