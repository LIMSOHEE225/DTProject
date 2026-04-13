package com.dtproduct.server;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Database Schema Verification ===");
        try {
            // 현재 테이블 컬럼 목록 조회
            List<Map<String, Object>> columns = jdbcTemplate.queryForList("SHOW COLUMNS FROM teachers");
            System.out.println("Current columns in 'teachers' table:");
            boolean hasTeacherId = false;
            boolean hasNeisCode = false;
            boolean hasGender = false;
            
            for (Map<String, Object> col : columns) {
                String field = (String) col.get("Field");
                System.out.println("- " + field);
                if ("teacher_id".equals(field)) hasTeacherId = true;
                if ("neis_school_code".equals(field)) hasNeisCode = true;
                if ("gender".equals(field)) hasGender = true;
            }

            // 누락된 컬럼 추가
            if (!hasTeacherId) {
                System.out.println("Adding missing 'teacher_id' column...");
                jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN teacher_id VARCHAR(255)");
            }
            if (!hasGender) {
                System.out.println("Adding missing 'gender' column...");
                jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN gender VARCHAR(255)");
            }
            if (!hasNeisCode) {
                System.out.println("Adding missing 'neis_school_code' column...");
                jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN neis_school_code VARCHAR(255)");
            }

            System.out.println("Database check completed.");
        } catch (Exception e) {
            System.err.println("Schema check failed: " + e.getMessage());
            // 기초적인 추가 시도 (실패해도 무관)
            try { jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN teacher_id VARCHAR(255)"); } catch(Exception ex) {}
            try { jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN gender VARCHAR(255)"); } catch(Exception ex) {}
            try { jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN neis_school_code VARCHAR(255)"); } catch(Exception ex) {}
        }
    }
}
