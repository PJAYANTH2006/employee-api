package com.devops.project;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

// 1. Main Entry Point
@SpringBootApplication
public class EmployeeApp {
    public static void main(String[] args) {
        SpringApplication.run(EmployeeApp.class, args);
    }
}

// 2. The Data Model
/**
 * Employee entity representing employee information
 * 
 * @author DevOps Team
 * @version 1.0
 */
class Employee {
    private String id;
    private String name;
    private String role;
    private String email;
    private String department;

    // Constructors, Getters, Setters
    public Employee() {
    }

    public Employee(String id, String name, String role, String email, String department) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.email = email;
        this.department = department;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}

// 3. The Controller & Logic (Combined for simplicity)
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*") // Allow all origins for development
class EmployeeController {

    private final String FILE_PATH = "employees.json";
    private final ObjectMapper objectMapper = new ObjectMapper();
    // Use CopyOnWriteArrayList for thread safety
    private List<Employee> employeeList = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        // Load data from file on startup
        File file = new File(FILE_PATH);
        if (file.exists()) {
            try {
                employeeList = objectMapper.readValue(file, new TypeReference<List<Employee>>() {
                });
                System.out.println("Loaded " + employeeList.size() + " employees from file.");
            } catch (IOException e) {
                System.err.println("Failed to load employees: " + e.getMessage());
            }
        } else {
            System.out.println("No existing data file found. Starting empty.");
        }
    }

    private void saveToFile() {
        try {
            objectMapper.writeValue(new File(FILE_PATH), employeeList);
        } catch (IOException e) {
            System.err.println("Failed to save to file: " + e.getMessage());
        }
    }

    // --- REST ENDPOINTS ---

    /**
     * Retrieves all employees from the system
     * 
     * @return List of all employee records
     */
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeList;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        Optional<Employee> employee = employeeList.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();
        return employee.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee) {
        // Simple validation
        if (employee.getId() == null || employee.getName() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if ID exists
        boolean exists = employeeList.stream().anyMatch(e -> e.getId().equals(employee.getId()));
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        employeeList.add(employee);
        saveToFile();
        return ResponseEntity.status(HttpStatus.CREATED).body(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable String id, @RequestBody Employee updatedEmployee) {
        // Find existing employee
        Optional<Employee> existingEmployee = employeeList.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();

        if (existingEmployee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Remove old employee and add updated one
        employeeList.removeIf(e -> e.getId().equals(id));
        employeeList.add(updatedEmployee);
        saveToFile();

        return ResponseEntity.ok(updatedEmployee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        boolean removed = employeeList.removeIf(e -> e.getId().equals(id));
        if (removed) {
            saveToFile();
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}