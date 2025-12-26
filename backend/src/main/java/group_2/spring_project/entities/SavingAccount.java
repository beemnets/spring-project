package group_2.spring_project.entities;


import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(
        name = "account_type",
        discriminatorType = DiscriminatorType.STRING,
        length = 20
)
@Table(name = "saving_accounts", indexes = {
        @Index(name = "idx_account_member", columnList = "member_id"),
        @Index(name = "idx_account_number", columnList = "account_number"),
        @Index(name = "idx_account_active", columnList = "is_active")
})
public abstract class SavingAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_number", unique = true, nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "account_type", insertable = false, updatable = false, length = 20)
    private String accountType;

    @NotNull
    @Min(value = 0, message = "Balance cannot be negative")
    @Column(name = "current_balance", nullable = false)
    private Double currentBalance = 0.0;

    @NotNull
    @Column(name = "opening_date", nullable = false)
    private LocalDate openingDate;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnore
    private Member member;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("transactionDate DESC")
    @JsonIgnore
    private List<Transaction> transactions = new ArrayList<>();


    protected SavingAccount() {
        this.openingDate = LocalDate.now();
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }

    public LocalDate getOpeningDate() { return openingDate; }
    public void setOpeningDate(LocalDate openingDate) { this.openingDate = openingDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public List<Transaction> getTransactions() { return transactions; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }
}