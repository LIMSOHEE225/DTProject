
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DbFix {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/dt_project?serverTimezone=Asia/Seoul&useSSL=false";
        String user = "root";
        String password = "1234";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            // 1. teacher1 이름 복구 (이민호)
            String updateTeacher = "UPDATE teachers SET name = '이민호' WHERE teacher_id = 'teacher1'";
            try (PreparedStatement pst = conn.prepareStatement(updateTeacher)) {
                int rows = pst.executeUpdate();
                System.out.println("Teacher1 name restored: " + (rows > 0 ? "Success" : "Not Found"));
            }

            // 2. 5-2반 학생 데이터 삭제 (Grade 5, Class 2)
            String deleteStudents = "DELETE FROM students WHERE grade = 5 AND class_num = 2";
            try (PreparedStatement pst = conn.prepareStatement(deleteStudents)) {
                int rows = pst.executeUpdate();
                System.out.println("Deleted " + rows + " students from Class 5-2.");
            }
            
            // 3. 현재 교사 목록 조회 (디버깅용)
            System.out.println("\n--- Current Teachers ---");
            String selectTeachers = "SELECT teacher_id, name, grade, class_num FROM teachers";
            try (PreparedStatement pst = conn.prepareStatement(selectTeachers);
                 ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    System.out.println("ID: " + rs.getString("teacher_id") + " | Name: " + rs.getString("name") + " | Class: " + rs.getInt("grade") + "-" + rs.getInt("class_num"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
