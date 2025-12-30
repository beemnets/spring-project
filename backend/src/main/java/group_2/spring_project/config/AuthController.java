package org.wldu.webservices.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtConfig jwtConfig;
    @Autowired private AuthUserRepository authUserRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        AuthUser user = authUserRepository.findByUsername(request.username()).get();

        // ✅ FIXED: Cast to List
        List<GrantedAuthority> authorities = authentication.getAuthorities().stream()
                .collect(Collectors.toList());

        String token = jwtConfig.generateToken(request.username(), authorities);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", request.username());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        if (authUserRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
        }

        AuthUser user = new AuthUser(
                request.username(),
                passwordEncoder.encode(request.password()),
                AuthUser.Role.valueOf(request.role())
        );
        authUserRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User created successfully",
                "username", request.username(),
                "role", request.role()
        ));
    }

    @GetMapping("/staff")
    public ResponseEntity<Map<String, Object>> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "username") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search) {
        try {
            Pageable pageable = PageRequest.of(page, size, 
                Sort.Direction.fromString(direction), sort);
            
            Page<AuthUser> staffPage;
            
            if (search != null && !search.trim().isEmpty()) {
                // Search by username containing the search term (case insensitive)
                staffPage = authUserRepository.findByUsernameContainingIgnoreCase(search.trim(), pageable);
            } else {
                staffPage = authUserRepository.findAll(pageable);
            }
            
            // Convert to response format
            List<Map<String, Object>> staffList = staffPage.getContent().stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("username", user.getUsername());
                    userMap.put("role", user.getRole().name());
                    return userMap;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Staff retrieved successfully");
            response.put("data", Map.of(
                "content", staffList,
                "totalElements", staffPage.getTotalElements(),
                "totalPages", staffPage.getTotalPages(),
                "size", staffPage.getSize(),
                "number", staffPage.getNumber(),
                "first", staffPage.isFirst(),
                "last", staffPage.isLast(),
                "numberOfElements", staffPage.getNumberOfElements()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve staff"));
        }
    }

    @DeleteMapping("/staff/{username}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteStaff(@PathVariable String username) {
        try {
            if (!authUserRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User not found"));
            }
            
            authUserRepository.deleteByUsername(username);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Staff member deleted successfully",
                    "username", username
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete staff member"));
        }
    }

    @PutMapping("/staff/{username}/role")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateStaffRole(
            @PathVariable String username, 
            @RequestBody UpdateRoleRequest request) {
        try {
            AuthUser user = authUserRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate the new role
            AuthUser.Role newRole;
            try {
                newRole = AuthUser.Role.valueOf(request.role().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid role: " + request.role()));
            }
            
            AuthUser.Role oldRole = user.getRole();
            user.setRole(newRole);
            authUserRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Staff role updated successfully");
            response.put("username", username);
            response.put("oldRole", oldRole.name());
            response.put("newRole", newRole.name());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update staff role"));
        }
    }

    record LoginRequest(String username, String password) {}
    record RegisterRequest(String username, String password, String role) {}
    record UpdateRoleRequest(String role) {}
}

