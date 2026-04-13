package com.dtproduct.server.repository;

import com.dtproduct.server.domain.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    Optional<ClassSession> findBySchoolCodeAndGradeAndClassNumAndIsActive(String schoolCode, Integer grade, Integer classNum, Boolean isActive);
}
