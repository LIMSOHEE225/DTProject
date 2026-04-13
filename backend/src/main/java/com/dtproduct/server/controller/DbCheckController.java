package com.dtproduct.server.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
public class DbCheckController {

    private final JdbcTemplate jdbcTemplate;

    public DbCheckController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/debug/db-info")
    public List<Map<String, Object>> getTableInfo() {
        try {
            return jdbcTemplate.queryForList("SHOW COLUMNS FROM teachers");
        } catch (Exception e) {
            return List.of(Map.of("error", e.getMessage()));
        }
    }
}
