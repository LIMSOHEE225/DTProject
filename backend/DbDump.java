import java.sql.*;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class DbDump {
    private static final String KEY = "AijoaSecretKey123";
    private static final String ALGORITHM = "AES";

    public static String decrypt(String encryptedData) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY.getBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decoded = Base64.getDecoder().decode(encryptedData);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted);
        } catch (Exception e) { return encryptedData; }
    }

    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/dt_project?serverTimezone=Asia/Seoul&useSSL=false", "root", "1234");
            Statement stmt = conn.createStatement();
            
            System.out.println("--- Students ---");
            ResultSet rs = stmt.executeQuery("SELECT * FROM students");
            while (rs.next()) {
                System.out.println("ID: " + decrypt(rs.getString("student_id")) + " | Name: " + rs.getString("name"));
            }
            
            System.out.println("\n--- Users (Teachers/Admins) ---");
            rs = stmt.executeQuery("SELECT * FROM users");
            while (rs.next()) {
                System.out.println("Login ID: " + rs.getString("login_id") + " | Name: " + rs.getString("name") + " | Role: " + rs.getString("role"));
            }
            
            conn.close();
        } catch (Exception e) { e.printStackTrace(); }
    }
}
