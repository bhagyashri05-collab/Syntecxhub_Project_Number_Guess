class Student:
    """Represents a student with name, id, and grade."""
    
    def __init__(self, name: str, student_id: str, grade: str):
        """
        Initialize a Student object.
        
        Args:
            name: Student's name
            student_id: Unique student ID
            grade: Student's grade
        """
        self.name = name
        self.id = student_id
        self.grade = grade
    
    def to_dict(self) -> dict:
        """Convert Student object to dictionary."""
        return {
            'name': self.name,
            'id': self.id,
            'grade': self.grade
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """Create Student object from dictionary."""
        return cls(data['name'], data['id'], data['grade'])
    
    def __repr__(self) -> str:
        return f"Student(name='{self.name}', id='{self.id}', grade='{self.grade}')"

