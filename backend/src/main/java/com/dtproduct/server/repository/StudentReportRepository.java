package com.dtproduct.server.repository;

import com.dtproduct.server.domain.StudentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentReportRepository extends JpaRepository<StudentReport, Long> {
    List<StudentReport> findByStudentNumberOrderByCreatedAtDesc(Integer studentNumber);
}
