package com.dtproduct.server.repository;

import com.dtproduct.server.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByNameAndSchoolName(String name, String schoolName);
    Optional<Student> findByStudentNumberAndSchoolNameAndGradeAndClassNum(Integer studentNumber, String schoolName, Integer grade, Integer classNum);
    List<Student> findBySchoolNameAndGradeAndClassNum(String schoolName, Integer grade, Integer classNum);
    List<Student> findByTeacherName(String teacherName);
}
