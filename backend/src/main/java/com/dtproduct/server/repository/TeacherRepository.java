package com.dtproduct.server.repository;

import com.dtproduct.server.domain.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findBySchoolName(String schoolName);
    Optional<Teacher> findByTeacherId(String teacherId);
    Optional<Teacher> findByName(String name);
}
