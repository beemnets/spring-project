package org.wldu.webservices.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wldu.webservices.entities.*;
import org.wldu.webservices.repositories.SavingAccountRepository;
import org.wldu.webservices.repositories.TransactionRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SavingAccountService {

    private static final Logger logger = LoggerFactory.getLogger(SavingAccountService.class);

    @Autowired
    private SavingAccountRepository savingAccountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private MemberService memberService;

    // ========== CREATE OPERATIONS ==========
    @Transactional
    public FormalSavingAccount openFormalAccount(Long memberId, Double monthlyAmount) {
        logger.info("Opening formal account for memberId: {}, monthlyAmount: {}", memberId, monthlyAmount);

        if (memberId == null || memberId <= 0) {
            throw new IllegalArgumentException("Valid member ID required");
        }
        if (monthlyAmount == null || monthlyAmount < 100) {
            throw new IllegalArgumentException("Monthly amount must be at least 100 ETB");
        }

        Member member = memberService.getMember(memberId);
        if (!memberService.checkEligibility(memberId)) {
            throw new IllegalArgumentException("Member is not eligible to open accounts");
        }

        Long formalCount = savingAccountRepository.countFormalAccountsByMemberId(memberId);
        if (formalCount > 0) {
            throw new IllegalArgumentException("Member already has a formal saving account");
        }

        // ✅ FIXED: Proper constructor usage
        FormalSavingAccount account = new FormalSavingAccount(monthlyAmount);
        account.setMember(member);
        account.setAccountNumber(generateAccountNumber("FORMAL"));
        account.setCurrentBalance(0.0);
        account.setIsActive(true);
        // openingDate set by parent constructor

        FormalSavingAccount saved = savingAccountRepository.save(account);
        logger.info("Formal account created: {}", saved.getAccountNumber());
        return saved;
    }

    @Transactional
    public InformalSavingAccount openInformalAccount(Long memberId, Double targetAmount) {
        logger.info("Opening informal account for memberId: {}, targetAmount: {}", memberId, targetAmount);

        if (memberId == null || memberId <= 0) {
            throw new IllegalArgumentException("Valid member ID required");
        }

        Member member = memberService.getMember(memberId);
        if (!memberService.checkEligibility(memberId)) {
            throw new IllegalArgumentException("Member is not eligible to open accounts");
        }

        Long informalCount = savingAccountRepository.countInformalAccountsByMemberId(memberId);
        if (informalCount >= 2) {
            throw new IllegalArgumentException("Maximum 2 informal accounts per member");
        }

        InformalSavingAccount account = new InformalSavingAccount(targetAmount);
        account.setMember(member);
        account.setAccountNumber(generateAccountNumber("INFORMAL"));
        account.setCurrentBalance(0.0);
        account.setIsActive(true);

        InformalSavingAccount saved = savingAccountRepository.save(account);
        logger.info("Informal account created: {}", saved.getAccountNumber());
        return saved;
    }

    // ========== READ OPERATIONS ==========
    @Transactional(readOnly = true)
    public Page<SavingAccount> getAllAccounts(Pageable pageable) {
        return savingAccountRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<SavingAccount> searchAccounts(String keyword, Pageable pageable) {
        return savingAccountRepository.searchAccounts(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public SavingAccount getAccount(Long accountId) {
        return savingAccountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
    }

    @Transactional(readOnly = true)
    public SavingAccount getAccountByNumber(String accountNumber) {
        return savingAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountNumber));
    }

    @Transactional(readOnly = true)
    public List<SavingAccount> getMemberAccounts(Long memberId) {
        return savingAccountRepository.findByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public List<SavingAccount> getActiveMemberAccounts(Long memberId) {
        return savingAccountRepository.findByMemberIdAndIsActive(memberId, true);
    }

    @Transactional(readOnly = true)
    public Double getMemberTotalBalance(Long memberId) {
        return savingAccountRepository.getTotalBalanceByMemberId(memberId);
    }

    // ========== DEPOSIT ==========
    @Transactional
    public Transaction deposit(Long accountId, Double amount, String description) {
        logger.info("Deposit accountId: {}, amount: {}", accountId, amount);

        if (amount == null || amount < 10) {
            throw new IllegalArgumentException("Minimum deposit is 10 ETB");
        }
        if (amount > 50000) {
            throw new IllegalArgumentException("Maximum deposit is 50,000 ETB");
        }

        SavingAccount account = getAccount(accountId);
        if (!account.getIsActive()) {
            throw new IllegalArgumentException("Cannot deposit to inactive account");
        }

        // Formal account validation
        if (account instanceof FormalSavingAccount formal) {
            LocalDate lastDeposit = formal.getLastMonthlyDepositDate();
            if (lastDeposit != null &&
                    lastDeposit.getYear() == LocalDate.now().getYear() &&
                    lastDeposit.getMonth() == LocalDate.now().getMonth()) {
                throw new IllegalArgumentException("Monthly deposit already made this month");
            }
            if (Math.abs(amount - formal.getMonthlyAmount()) > 0.01) {
                throw new IllegalArgumentException("Must deposit exact monthly amount: " + formal.getMonthlyAmount());
            }
            formal.setLastMonthlyDepositDate(LocalDate.now());
        }

        Transaction tx = new Transaction(amount, Transaction.TransactionType.DEPOSIT, description);
        tx.setAccount(account);
        tx.setReferenceNumber(generateReferenceNumber());
        transactionRepository.save(tx);

        account.setCurrentBalance(account.getCurrentBalance() + amount);
        savingAccountRepository.save(account);

        return tx;
    }

    // ========== WITHDRAW ==========
    @Transactional
    public Transaction withdraw(Long accountId, Double amount, String description) {
        logger.info("Withdraw accountId: {}, amount: {}", accountId, amount);

        if (amount == null || amount < 50) {
            throw new IllegalArgumentException("Minimum withdrawal is 50 ETB");
        }

        SavingAccount account = getAccount(accountId);
        if (account instanceof FormalSavingAccount) {
            throw new IllegalArgumentException("Cannot withdraw from formal accounts");
        }
        if (!account.getIsActive()) {
            throw new IllegalArgumentException("Cannot withdraw from inactive account");
        }
        if (amount > account.getCurrentBalance()) {
            throw new IllegalArgumentException("Insufficient balance: " + account.getCurrentBalance());
        }

        Double todayWithdrawals = transactionRepository.getTodayWithdrawalTotal(accountId);
        double totalToday = (todayWithdrawals != null ? todayWithdrawals : 0) + amount;
        if (totalToday > 10000) {
            throw new IllegalArgumentException("Daily withdrawal limit (10,000 ETB) exceeded");
        }

        Transaction tx = new Transaction(amount, Transaction.TransactionType.WITHDRAWAL, description);
        tx.setAccount(account);
        tx.setReferenceNumber(generateReferenceNumber());
        transactionRepository.save(tx);

        account.setCurrentBalance(account.getCurrentBalance() - amount);
        savingAccountRepository.save(account);

        return tx;
    }

    // ========== ACCOUNT LIFECYCLE ==========
    @Transactional
    public SavingAccount closeAccount(Long accountId) {
        SavingAccount account = getAccount(accountId);
        if (account.getCurrentBalance() > 0) {
            throw new IllegalArgumentException("Zero balance required: " + account.getCurrentBalance());
        }
        account.setIsActive(false);
        return savingAccountRepository.save(account);
    }

    @Transactional
    public SavingAccount deactivateAccount(Long accountId) {
        SavingAccount account = getAccount(accountId);
        account.setIsActive(false);
        return savingAccountRepository.save(account);
    }

    @Transactional
    public SavingAccount reactivateAccount(Long accountId) {
        SavingAccount account = getAccount(accountId);
        account.setIsActive(true);
        return savingAccountRepository.save(account);
    }

    // ========== BULK OPERATIONS ==========
    @Transactional
    public Map<String, Object> bulkDepositByDomain(String workDomain, Double amount, String description) {
        logger.info("Starting bulk deposit for domain: {}, amount: {}", workDomain, amount);

        if (workDomain == null || workDomain.trim().isEmpty()) {
            throw new IllegalArgumentException("Work domain is required");
        }
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        try {
            // Convert string to enum
            Member.WorkDomain domain = Member.WorkDomain.valueOf(workDomain.toUpperCase());
            
            // Get all active members in the specified domain
            List<Member> members = memberService.getMembersByDomain(domain);
            List<Member> activeMembers = members.stream()
                    .filter(Member::getIsActive)
                    .collect(java.util.stream.Collectors.toList());

            logger.info("Found {} active members in domain {}", activeMembers.size(), workDomain);

            int successCount = 0;
            int failureCount = 0;
            List<String> errors = new java.util.ArrayList<>();
            List<Map<String, Object>> successfulDeposits = new java.util.ArrayList<>();

            for (Member member : activeMembers) {
                try {
                    // Get member's active accounts
                    List<SavingAccount> accounts = getActiveMemberAccounts(member.getId());
                    
                    if (accounts.isEmpty()) {
                        errors.add("Member " + member.getEmployeeId() + " has no active accounts");
                        failureCount++;
                        continue;
                    }

                    // Deposit to the first active account (or primary account)
                    SavingAccount primaryAccount = accounts.get(0);
                    
                    // Create transaction
                    Transaction transaction = new Transaction(amount, Transaction.TransactionType.DEPOSIT, 
                            description != null ? description : "Bulk deposit for " + workDomain + " domain");
                    transaction.setAccount(primaryAccount);
                    transaction.setReferenceNumber(generateReferenceNumber());
                    transactionRepository.save(transaction);

                    // Update account balance
                    primaryAccount.setCurrentBalance(primaryAccount.getCurrentBalance() + amount);
                    savingAccountRepository.save(primaryAccount);

                    // Record success
                    Map<String, Object> depositInfo = new java.util.HashMap<>();
                    depositInfo.put("memberId", member.getId());
                    depositInfo.put("memberName", member.getFirstName() + " " + member.getLastName());
                    depositInfo.put("employeeId", member.getEmployeeId());
                    depositInfo.put("accountNumber", primaryAccount.getAccountNumber());
                    depositInfo.put("amount", amount);
                    depositInfo.put("newBalance", primaryAccount.getCurrentBalance());
                    depositInfo.put("transactionRef", transaction.getReferenceNumber());
                    successfulDeposits.add(depositInfo);

                    successCount++;
                    logger.info("Deposited {} to account {} for member {}", amount, primaryAccount.getAccountNumber(), member.getEmployeeId());

                } catch (Exception e) {
                    logger.error("Failed to deposit for member {}: {}", member.getEmployeeId(), e.getMessage());
                    errors.add("Member " + member.getEmployeeId() + ": " + e.getMessage());
                    failureCount++;
                }
            }

            // Prepare result summary
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("totalMembers", activeMembers.size());
            result.put("successCount", successCount);
            result.put("failureCount", failureCount);
            result.put("totalAmount", successCount * amount);
            result.put("successfulDeposits", successfulDeposits);
            result.put("errors", errors);

            logger.info("Bulk deposit completed: {} successes, {} failures", successCount, failureCount);
            return result;

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid work domain: " + workDomain + ". Valid domains: ACADEMIC, ADMINISTRATION, CONTRACT, OTHER");
        } catch (Exception e) {
            logger.error("Error in bulk deposit: {}", e.getMessage(), e);
            throw new RuntimeException("Bulk deposit failed: " + e.getMessage());
        }
    }

    // ========== HELPERS ==========
    private String generateAccountNumber(String type) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.format("%04d", (int)(Math.random() * 10000));
        return type + "-" + timestamp.substring(timestamp.length() - 8) + random;
    }

    private String generateReferenceNumber() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
