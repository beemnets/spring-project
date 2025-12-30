package org.wldu.webservices.config;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {
    Optional<AuthUser> findByUsername(String username);
    boolean existsByUsername(String username);
    void deleteByUsername(String username);
    Page<AuthUser> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
}

