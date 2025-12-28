package group_2.spring_project.services;

import group_2.spring_project.entities.*;
import group_2.spring_project.repositories.SavingAccountRepository;
import group_2.spring_project.repositories.TransactionRepository;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;

import java.time.LocalDate;
import java.util.List;
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
