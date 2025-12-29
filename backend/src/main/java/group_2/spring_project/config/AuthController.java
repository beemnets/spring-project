package org.wldu.webservices.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    record LoginRequest(String username, String password) {}
    record RegisterRequest(String username, String password, String role) {}
}

