package org.wldu.webservices.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.FormalSavingAccount;
import org.wldu.webservices.entities.InformalSavingAccount;
import org.wldu.webservices.entities.SavingAccount;
import org.wldu.webservices.entities.Transaction;
import org.wldu.webservices.services.SavingAccountService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class SavingAccountController {

    @Autowired
    private SavingAccountService savingAccountService;

    // ========== ASSISTANT + MANAGER + ADMIN ==========
    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @PostMapping("/formal")
    public ResponseEntity<?> openFormalAccount(@RequestParam Long memberId, @RequestParam Double monthlyAmount) {
        try {
            FormalSavingAccount account = savingAccountService.openFormalAccount(memberId, monthlyAmount);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Formal saving account created successfully");
            response.put("accountId", account.getId());
            response.put("accountNumber", account.getAccountNumber());
            response.put("monthlyAmount", account.getMonthlyAmount());
            response.put("memberId", memberId);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error creating formal account");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @PostMapping("/informal")
    public ResponseEntity<?> openInformalAccount(@RequestParam Long memberId, @RequestParam(required = false) Double targetAmount) {
        try {
            InformalSavingAccount account = savingAccountService.openInformalAccount(memberId, targetAmount);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Informal saving account created successfully");
            response.put("accountId", account.getId());
            response.put("accountNumber", account.getAccountNumber());
            response.put("targetAmount", account.getTargetAmount());
            response.put("memberId", memberId);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error creating informal account");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllAccounts(
            @PageableDefault(size = 10, sort = "id") Pageable pageable,
            @RequestParam(required = false) String search) {
        try {
            Page<SavingAccount> accounts;
            if (search != null && !search.trim().isEmpty()) {
                accounts = savingAccountService.searchAccounts(search.trim(), pageable);
            } else {
                accounts = savingAccountService.getAllAccounts(pageable);
            }
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return serverError("Error retrieving accounts");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getAccount(@PathVariable Long id) {
        try {
            SavingAccount account = savingAccountService.getAccount(id);
            return ResponseEntity.ok(account);
        } catch (IllegalArgumentException e) {
            return notFound(e.getMessage());
        } catch (Exception e) {
            return serverError("Error retrieving account");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<?> getAccountByNumber(@PathVariable String accountNumber) {
        try {
            SavingAccount account = savingAccountService.getAccountByNumber(accountNumber);
            return ResponseEntity.ok(account);
        } catch (IllegalArgumentException e) {
            return notFound(e.getMessage());
        } catch (Exception e) {
            return serverError("Error retrieving account");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/member/{memberId}")
    public ResponseEntity<?> getMemberAccounts(@PathVariable Long memberId) {
        try {
            List<SavingAccount> accounts = savingAccountService.getMemberAccounts(memberId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return serverError("Error retrieving member accounts");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/member/{memberId}/active")
    public ResponseEntity<?> getActiveMemberAccounts(@PathVariable Long memberId) {
        try {
            List<SavingAccount> accounts = savingAccountService.getActiveMemberAccounts(memberId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return serverError("Error retrieving active accounts");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @GetMapping("/member/{memberId}/balance")
    public ResponseEntity<?> getMemberTotalBalance(@PathVariable Long memberId) {
        try {
            Double totalBalance = savingAccountService.getMemberTotalBalance(memberId);

            Map<String, Object> response = new HashMap<>();
            response.put("memberId", memberId);
            response.put("totalBalance", totalBalance);
            response.put("currency", "ETB");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return serverError("Error calculating total balance");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @PostMapping("/{id}/deposit")
    public ResponseEntity<?> deposit(@PathVariable Long id, @RequestParam Double amount, @RequestParam(required = false) String description) {
        try {
            if (amount == null || amount <= 0) {
                return badRequest("Amount must be positive");
            }

            Transaction transaction = savingAccountService.deposit(
                    id, amount, description != null ? description : "Deposit"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Deposit successful");
            response.put("transactionId", transaction.getId());
            response.put("referenceNumber", transaction.getReferenceNumber());
            response.put("amount", transaction.getAmount());
            response.put("newBalance", transaction.getAccount().getCurrentBalance());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error processing deposit");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @PostMapping("/{id}/deposit/monthly")
    public ResponseEntity<?> makeMonthlyDeposit(@PathVariable Long id, @RequestParam(required = false) String description) {
        try {
            SavingAccount account = savingAccountService.getAccount(id);

            if (!(account instanceof FormalSavingAccount)) {
                return badRequest("Only formal accounts can make monthly deposits");
            }

            FormalSavingAccount formalAccount = (FormalSavingAccount) account;

            Transaction transaction = savingAccountService.deposit(
                    id,
                    formalAccount.getMonthlyAmount(),
                    description != null ? description : "Monthly deposit"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Monthly deposit successful");
            response.put("transactionId", transaction.getId());
            response.put("referenceNumber", transaction.getReferenceNumber());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error processing monthly deposit");
        }
    }

    @PreAuthorize("hasAnyRole('ASSISTANT', 'MANAGER', 'ADMIN')")
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id, @RequestParam Double amount, @RequestParam(required = false) String description) {
        try {
            if (amount == null || amount <= 0) {
                return badRequest("Amount must be positive");
            }

            Transaction transaction = savingAccountService.withdraw(
                    id, amount, description != null ? description : "Withdrawal"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Withdrawal successful");
            response.put("transactionId", transaction.getId());
            response.put("referenceNumber", transaction.getReferenceNumber());
            response.put("amount", transaction.getAmount());
            response.put("newBalance", transaction.getAccount().getCurrentBalance());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error processing withdrawal");
        }
    }

    // ========== MANAGER + ADMIN ONLY ==========
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeAccount(@PathVariable Long id) {
        try {
            SavingAccount account = savingAccountService.closeAccount(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account closed successfully");
            response.put("accountId", id);
            response.put("accountNumber", account.getAccountNumber());
            response.put("isActive", account.getIsActive());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error closing account");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAccount(@PathVariable Long id) {
        try {
            SavingAccount account = savingAccountService.deactivateAccount(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account deactivated successfully");
            response.put("accountId", id);
            response.put("accountNumber", account.getAccountNumber());
            response.put("isActive", account.getIsActive());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error deactivating account");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateAccount(@PathVariable Long id) {
        try {
            SavingAccount account = savingAccountService.reactivateAccount(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account reactivated successfully");
            response.put("accountId", id);
            response.put("accountNumber", account.getAccountNumber());
            response.put("isActive", account.getIsActive());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            return serverError("Error reactivating account");
        }
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping("/bulk-deposit")
    public ResponseEntity<?> bulkDepositByDomain(
            @RequestParam String workDomain, 
            @RequestParam Double amount, 
            @RequestParam(required = false) String description) {
        try {
            if (amount == null || amount <= 0) {
                return badRequest("Amount must be positive");
            }

            System.out.println("DEBUG: Starting bulk deposit for domain: " + workDomain + ", amount: " + amount);

            Map<String, Object> result = savingAccountService.bulkDepositByDomain(workDomain, amount, description);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bulk deposit completed successfully");
            response.put("workDomain", workDomain);
            response.put("amount", amount);
            response.put("description", description != null ? description : "Bulk deposit");
            response.put("results", result);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        } catch (Exception e) {
            System.err.println("ERROR in bulk deposit: " + e.getMessage());
            e.printStackTrace();
            return serverError("Error processing bulk deposit: " + e.getMessage());
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
