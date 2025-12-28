package group_2.spring_project.entities;


import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_transaction_account", columnList = "account_id"),
        @Index(name = "idx_transaction_date", columnList = "transaction_date"),
        @Index(name = "idx_transaction_reference", columnList = "reference_number")
})
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Min(value = 1, message = "Amount must be at least 1 ETB")
    @Column(nullable = false)
    private Double amount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Size(max = 255)
    @Column(length = 255)
    private String description;

    @NotNull
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "reference_number", unique = true, length = 50)
    private String referenceNumber;

    // Relationship with SavingAccount
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private SavingAccount account;


    public enum TransactionType {
        DEPOSIT,
        WITHDRAWAL,
        INTEREST,
        PENALTY,
        FEE
    }


    public Transaction() {
        this.transactionDate = LocalDateTime.now();
    }

    public Transaction(Double amount, TransactionType transactionType, String description) {
        this();
        this.amount = amount;
        this.transactionType = transactionType;
        this.description = description;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public SavingAccount getAccount() { return account; }
    public void setAccount(SavingAccount account) { this.account = account; }
}