package org.wldu.webservices.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Member;
import org.wldu.webservices.services.MemberService;
import org.wldu.webservices.repositories.MemberRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberRepository memberRepository;

    // ========== PUBLIC ENDPOINT ==========
    @PreAuthorize("permitAll()")
    @PostMapping
    public ResponseEntity<?> createMember(@RequestBody Member member) {
        try {
            if (member.getEmployeeId() == null || member.getEmployeeId().trim().isEmpty()) {
                return badRequest("Employee ID is required");
            }
            if (member.getFirstName() == null || member.getFirstName().trim().isEmpty()) {
                return badRequest("First name is required");
            }
            if (member.getLastName() == null || member.getLastName().trim().isEmpty()) {
                return badRequest("Last name is required");
            }
            if (member.getWorkDomain() == null) {
                return badRequest("Work domain is required");
            }

            Member createdMember = memberService.registerMember(member);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMember);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error creating member");
        }
    }

    // ========== ASSISTANT + MANAGER + ADMIN ==========
    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @PostMapping("/{id}/shares")
    public ResponseEntity<?> purchaseShares(@PathVariable Long id, @RequestParam int quantity) {
        try {
            if (quantity < 1) {
                return badRequest("Quantity must be at least 1");
            }

            Member member = memberService.purchaseAdditionalShares(id, quantity);

            int totalShares = 0;
            double totalShareValue = 0.0;

            try {
                if (member.getShares() != null) {
                    totalShares = member.getShares().size();
                    totalShareValue = totalShares * 150.0;
                }
            } catch (Exception e) {
                totalShares = quantity;
                totalShareValue = totalShares * 150.0;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully purchased " + quantity + " shares");
            response.put("memberId", id);
            response.put("memberName", member.getFirstName() + " " + member.getLastName());
            response.put("quantityPurchased", quantity);
            response.put("totalShares", totalShares);
            response.put("totalShareValue", totalShareValue);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error purchasing shares: " + e.getClass().getSimpleName());
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllMembers(
            @PageableDefault(size = 10, sort = "id") Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive) {
        try {
            if (search != null && !search.trim().isEmpty()) {
                // For search, always include all members (active and inactive)
                Page<Member> members = memberService.searchMembers(search.trim(), pageable);
                return ResponseEntity.ok(members);
            } else if (includeInactive) {
                // Return all members including inactive ones
                Page<Member> members = memberService.getAllMembers(pageable);
                return ResponseEntity.ok(members);
            } else {
                // Default behavior - return only active members
                Page<Member> members = memberService.getAllActiveMembers(pageable);
                return ResponseEntity.ok(members);
            }
        } catch (Exception e) {
            return serverError("Error retrieving members");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<?> searchMembers(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        try {
            Page<Member> members = memberService.searchMembers(q, pageable);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return serverError("Error searching members");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/domain/{domain}")
    public ResponseEntity<?> getMembersByDomain(
            @PathVariable Member.WorkDomain domain,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        try {
            Page<Member> members = memberService.getMembersByDomain(domain, pageable);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return serverError("Error retrieving members by domain");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/{id}/eligibility")
    public ResponseEntity<?> checkEligibility(@PathVariable Long id) {
        try {
            boolean eligible = memberService.checkEligibility(id);

            Map<String, Object> response = new HashMap<>();
            response.put("memberId", id);
            response.put("eligible", eligible);
            response.put("message", eligible ?
                    "Member is eligible for all services" :
                    "Member is not eligible for services");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error checking eligibility");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/{id}/shares/value")
    public ResponseEntity<?> getTotalShareValue(@PathVariable Long id) {
        try {
            double totalValue = memberService.getTotalShareValue(id);

            Map<String, Object> response = new HashMap<>();
            response.put("memberId", id);
            response.put("totalShareValue", totalValue);
            response.put("currency", "ETB");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error calculating share value");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/stats/count")
    public ResponseEntity<?> getMemberCount() {
        try {
            Long activeCount = memberService.getActiveMemberCount();
            Long totalCount = memberRepository.count();
            Long inactiveCount = totalCount - activeCount;

            Map<String, Object> response = new HashMap<>();
            response.put("activeMembers", activeCount);
            response.put("inactiveMembers", inactiveCount);
            response.put("totalMembers", totalCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return serverError("Error getting member count");
        }
    }

    // ========== MANAGER + ADMIN ONLY ==========
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getMember(@PathVariable Long id) {
        try {
            Member member = memberService.getMember(id);
            return ResponseEntity.ok(member);
        } catch (IllegalArgumentException e) {
            return notFound(e.getMessage());
        } catch (Exception e) {
            return serverError("Error retrieving member");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/{id}/full")
    public ResponseEntity<?> getMemberWithDetails(@PathVariable Long id) {
        try {
            Member member = memberService.getMemberWithRelations(id);
            return ResponseEntity.ok(member);
        } catch (IllegalArgumentException e) {
            return notFound(e.getMessage());
        } catch (Exception e) {
            return serverError("Error retrieving member details");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMember(@PathVariable Long id, @RequestBody Member memberUpdates) {
        try {
            if (memberUpdates.getFirstName() != null && memberUpdates.getFirstName().trim().isEmpty()) {
                return badRequest("First name cannot be empty");
            }
            if (memberUpdates.getLastName() != null && memberUpdates.getLastName().trim().isEmpty()) {
                return badRequest("Last name cannot be empty");
            }

            Member updatedMember = memberService.updateMember(id, memberUpdates);
            return ResponseEntity.ok(updatedMember);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error updating member");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateMember(@PathVariable Long id, @RequestParam(required = false) String reason) {
        try {
            Member deactivatedMember = memberService.deactivateMember(id, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Member deactivated successfully");
            response.put("memberId", id);
            response.put("deactivationDate", deactivatedMember.getDeactivationDate());
            response.put("deactivationReason", deactivatedMember.getDeactivationReason());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error deactivating member");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateMember(@PathVariable Long id) {
        try {
            Member reactivatedMember = memberService.reactivateMember(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Member reactivated successfully");
            response.put("memberId", id);
            response.put("isActive", reactivatedMember.getIsActive());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error reactivating member");
        }
    }

    // ========== ERROR HELPER METHODS ==========
    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Bad Request");
        error.put("message", message);
        error.put("status", "400");
        return ResponseEntity.badRequest().body(error);
    }

    private ResponseEntity<Map<String, String>> notFound(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Not Found");
        error.put("message", message);
        error.put("status", "404");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    private ResponseEntity<Map<String, String>> serverError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal Server Error");
        error.put("message", message);
        error.put("status", "500");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
